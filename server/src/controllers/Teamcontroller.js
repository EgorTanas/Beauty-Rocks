const TeamMember = require('../models/TeamMember');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/uploadMiddleware');


// PUBLIC ROUTES


/**
 * GET /api/team
 * Get all active team members (public)
 */
const getTeamMembers = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Filtrare opțională după serviciu: GET /api/team?service=<serviceId>
    if (req.query.service) {
      const Service = require('../models/Service');
      const svc = await Service.findById(req.query.service).select('category');
      if (!svc) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      // Mapare categorie serviciu → valori specialties acceptate
      const categoryMap = {
        'manicure':    ['manicure', 'nails'],
        'pedicure':    ['pedicure', 'nails'],
        'hair-women':  ['hair', 'hair-women', 'color'],
        'hair-men':    ['hair', 'hair-men'],
        'bridal':      ['bridal', 'hair', 'manicure'],
        'nails':       ['manicure', 'pedicure', 'nails'],
        'hair':        ['hair', 'hair-women', 'hair-men', 'color'],
        'skincare':    ['skincare'],
        'other':       [],
      };
      const relevantSpecialties = categoryMap[svc.category] || [];
      if (relevantSpecialties.length > 0) {
        filter.specialties = { $in: relevantSpecialties };
      }
    }

    const members = await TeamMember.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/team/:id
 * Get single team member by ID (public)
 */
const getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /api/team/:id/availability/:date
 * Check if team member is available on a specific date
 */
const checkAvailability = async (req, res) => {
  try {
    const { id, date } = req.params;
    const member = await TeamMember.findById(id);
    
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const isAvailable = member.isAvailableOnDate(date);
    const workingHours = member.getWorkingHoursForDay(dayName);
    
    res.json({
      success: true,
      data: {
        isAvailable,
        workingHours,
        dayName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// ADMIN ROUTES


const getAllTeamMembersAdmin = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: members.length, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const uploadTeamAvatar = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    return res.status(200).json({
      success:  true,
      url:      req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
};


const createTeamMember = async (req, res) => {
  try {
    const {
      name,
      role,
      bio,
      avatar,
      email,
      phone,
      specialties,
      workingHours,
      daysOff,
      isActive,
      order,
    } = req.body;

    const member = await TeamMember.create({
      name,
      role,
      bio:          bio          || '',
      avatar:       avatar       || '',
      email:        email        || '',
      phone:        phone        || '',
      specialties:  specialties  || [],
      workingHours: workingHours || {},
      daysOff:      daysOff      || [],
      isActive:     isActive !== undefined ? isActive : true,
      order:        order        || 0,
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


const updateTeamMember = async (req, res) => {
  try {
    const existing = await TeamMember.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // Delete old avatar from Cloudinary if changed
    if (req.body.avatar && req.body.avatar !== existing.avatar) {
      const oldPublicId = extractPublicId(existing.avatar);
      if (oldPublicId) {
        deleteFromCloudinary(oldPublicId).catch((err) =>
          console.warn('Could not delete old Cloudinary avatar:', err.message)
        );
      }
    }

    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { returnDocument: 'after', runValidators: true }
    );

    res.json({ success: true, data: member });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    // Delete avatar from Cloudinary
    const publicId = extractPublicId(member.avatar);
    if (publicId) {
      deleteFromCloudinary(publicId).catch((err) =>
        console.warn('Could not delete Cloudinary avatar on member delete:', err.message)
      );
    }

    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


const toggleTeamMemberActive = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    member.isActive = !member.isActive;
    await member.save();

    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  // Public
  getTeamMembers,
  getTeamMemberById,
  checkAvailability,
  
  // Admin
  getAllTeamMembersAdmin,
  uploadTeamAvatar,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  toggleTeamMemberActive,
};