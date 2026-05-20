const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/uploadMiddleware');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, phone, dateOfBirth, gender } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;

    await user.save();

    res.json({ success: true, data: user.toPublicJSON() });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.avatar) {
      const oldPublicId = extractPublicId(user.avatar);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: user.avatarUrl,
        message: 'Avatar updated successfully'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.avatar) {
      return res.status(400).json({ success: false, message: 'No avatar to delete' });
    }

    const publicId = extractPublicId(user.avatar);
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    user.avatar = null;
    await user.save();

    res.json({ success: true, message: 'Avatar deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.id };

    if (status) {
      filter.status = status;
    }

    if (upcoming === 'true') {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('service', 'name price duration category image')
      .populate('teamMember', 'name role avatar')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: appointments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: appointments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getAppointmentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [total, pending, confirmed, cancelled, upcoming] = await Promise.all([
      Appointment.countDocuments({ user: userId }),
      Appointment.countDocuments({ user: userId, status: 'pending' }),
      Appointment.countDocuments({ user: userId, status: 'confirmed' }),
      Appointment.countDocuments({ user: userId, status: 'cancelled' }),
      Appointment.countDocuments({
        user: userId,
        date: { $gte: new Date() },
        status: { $in: ['pending', 'confirmed'] }
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        confirmed,
        cancelled,
        upcoming,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await Appointment.updateMany(
      {
        user: req.user.id,
        date: { $gte: today },
        status: { $in: ['pending', 'confirmed'] },
      },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully. All upcoming appointments have been cancelled.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getMyAppointments,
  getAppointmentStats,
  changePassword,
  deleteAccount,
};
