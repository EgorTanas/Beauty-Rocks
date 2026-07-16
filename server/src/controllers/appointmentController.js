const crypto = require('crypto');
const Appointment = require('../models/Appointment');
const TeamMember  = require('../models/TeamMember');
const Service     = require('../models/Service');
const {
  emitBookingCancelled,
  emitBookingCompleted,
  emitBookingConfirmed,
  emitBookingCreated,
  emitBookingRescheduleRequested,
  emitBookingRescheduled,
} = require('../events/bookingEvents');

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const isSlotAvailable = async ({ teamMember, date, startTime, endTime, ignoreAppointmentId = null }) => {
  const dayStart = normalizeDate(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  const existingOnDay = await Appointment.find({
    teamMember,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ['pending', 'confirmed', 'rescheduleRequested'] },
    ...(ignoreAppointmentId ? { _id: { $ne: ignoreAppointmentId } } : {}),
  }).select('startTime endTime');

  return !existingOnDay.some((a) => {
    const aStart = toMinutes(a.startTime);
    const aEnd = toMinutes(a.endTime);
    return startMin < aEnd && endMin > aStart;
  });
};

const getAvailableSlots = async (req, res) => {
  try {
    const { worker, date, service } = req.query;

    if (!worker || !date || !service) {
      return res.status(400).json({
        success: false,
        message: 'worker, date and service query params are required',
      });
    }

    const [member, svc] = await Promise.all([
      TeamMember.findById(worker),
      Service.findById(service),
    ]);

    if (!member) return res.status(404).json({ success: false, message: 'Team member not found' });
    if (!svc)    return res.status(404).json({ success: false, message: 'Service not found' });

    if (!member.isActive) {
      return res.json({ success: true, data: [] });
    }

    const targetDate = new Date(date);
    if (!member.isAvailableOnDate(targetDate)) {
      return res.json({ success: true, data: [], message: 'Team member has a day off on this date' });
    }

    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hours   = member.getWorkingHoursForDay(dayName);

    if (!hours) {
      return res.json({ success: true, data: [], message: 'Team member does not work on this day' });
    }

    let durationMin = svc.durationMinutes || (typeof svc.duration === 'number' ? svc.duration : parseInt(svc.duration, 10));

    if (!durationMin || durationMin <= 0) {
      return res.status(400).json({ success: false, message: 'Service has an invalid duration' });
    }

    const workStart = toMinutes(hours.start);
    const workEnd   = toMinutes(hours.end);
    const allSlots  = [];

    for (let t = workStart; t + durationMin <= workEnd; t += durationMin) {
      allSlots.push(t);
    }

    const dayStart = normalizeDate(date);
    const dayEnd   = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const existing = await Appointment.find({
      teamMember: worker,
      date:       { $gte: dayStart, $lt: dayEnd },
      status:     { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    const busyRanges = existing.map((a) => ({
      start: toMinutes(a.startTime),
      end:   toMinutes(a.endTime),
    }));

    const freeSlots = allSlots.filter((slotStart) => {
      const slotEnd = slotStart + durationMin;
      return !busyRanges.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );
    });

    res.json({ success: true, data: freeSlots.map(toTime) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { service, teamMember, date, startTime, notes } = req.body;

    if (!service || !teamMember || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'service, teamMember, date and startTime are required',
      });
    }

    const svc = await Service.findById(service);
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });

    let durationMin = svc.durationMinutes || (typeof svc.duration === 'number' ? svc.duration : parseInt(svc.duration, 10));

    if (!durationMin || durationMin <= 0) {
      return res.status(400).json({ success: false, message: 'Service has an invalid duration' });
    }

    const endTime = toTime(toMinutes(startTime) + durationMin);

    const dayStart = normalizeDate(date);
    const dayEnd   = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const startMin = toMinutes(startTime);
    const endMin   = toMinutes(endTime);

    const hasConflict = await isSlotAvailable({
      teamMember,
      date: normalizeDate(date),
      startTime,
      endTime,
    });

    if (!hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please choose another.',
      });
    }

    const appointment = await Appointment.create({
      user:       req.user.id,
      service,
      teamMember,
      date:       normalizeDate(date),
      startTime,
      endTime,
      notes:      notes || '',
      status:     'pending',
    });

    await appointment.populate(['service', 'teamMember']);
    emitBookingCreated(String(appointment._id));

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getRescheduleRequestByToken = async (req, res) => {
  try {
    const token = String(req.params.token || '').trim();
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const appointment = await Appointment.findOne({
      rescheduleToken: token,
      rescheduleRequested: true,
      rescheduleTokenUsedAt: null,
      rescheduleTokenExpiresAt: { $gt: new Date() },
    })
      .select('+rescheduleToken +rescheduleTokenExpiresAt +rescheduleTokenUsedAt')
      .populate('service', 'name price duration durationMinutes category image')
      .populate('teamMember', 'name role avatar')
      .populate('user', 'username email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Reschedule link is invalid or expired.' });
    }

    return res.json({ success: true, data: appointment });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const submitRescheduleRequest = async (req, res) => {
  try {
    const token = String(req.params.token || '').trim();
    const { date, startTime } = req.body;

    if (!token || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'token, date and startTime are required' });
    }

    const appointment = await Appointment.findOne({
      rescheduleToken: token,
      rescheduleRequested: true,
      rescheduleTokenUsedAt: null,
      rescheduleTokenExpiresAt: { $gt: new Date() },
    })
      .select('+rescheduleToken +rescheduleTokenExpiresAt +rescheduleTokenUsedAt')
      .populate('service', 'name price duration durationMinutes category image')
      .populate('teamMember', 'name role avatar')
      .populate('user', 'username email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Reschedule link is invalid or expired.' });
    }

    const svc = await Service.findById(appointment.service._id);
    let durationMin = svc.durationMinutes || (typeof svc.duration === 'number' ? svc.duration : parseInt(svc.duration, 10));
    if (!durationMin || durationMin <= 0) {
      return res.status(400).json({ success: false, message: 'Service has an invalid duration' });
    }

    const nextEndTime = toTime(toMinutes(startTime) + durationMin);
    const allowed = await isSlotAvailable({
      teamMember: appointment.teamMember._id,
      date,
      startTime,
      endTime: nextEndTime,
      ignoreAppointmentId: appointment._id,
    });

    if (!allowed) {
      return res.status(409).json({ success: false, message: 'This time slot is no longer available. Please choose another.' });
    }

    const oldDateTime = `${new Date(appointment.date).toLocaleDateString('en-GB')} ${appointment.startTime}`;
    appointment.date = normalizeDate(date);
    appointment.startTime = startTime;
    appointment.endTime = nextEndTime;
    appointment.status = 'confirmed';
    appointment.rescheduleRequested = false;
    appointment.rescheduleToken = null;
    appointment.rescheduleTokenExpiresAt = null;
    appointment.rescheduleTokenUsedAt = new Date();
    await appointment.save();

    const newDateTime = `${new Date(appointment.date).toLocaleDateString('en-GB')} ${appointment.startTime}`;
    emitBookingRescheduled(String(appointment._id), oldDateTime, newDateTime, {
      finalized: true,
      telegramLines: [
        '✅ Client selected a new appointment.',
        `Old: ${oldDateTime}`,
        `New: ${newDateTime}`,
      ],
      emailHtml: 'Appointment successfully rescheduled.',
    });

    return res.json({ success: true, data: appointment });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id })
      .populate('service',    'name price duration category')
      .populate('teamMember', 'name role avatar')
      .sort({ date: -1, startTime: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('service',    'name price duration category')
      .populate('teamMember', 'name role avatar');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    emitBookingCancelled(String(appointment._id));

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const { status, date, worker, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (worker) filter.teamMember = worker;
    if (date) {
      const dayStart = normalizeDate(date);
      const dayEnd   = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      filter.date = { $gte: dayStart, $lt: dayEnd };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate('user',       'name email')
      .populate('service',    'name price duration category')
      .populate('teamMember', 'name role avatar')
      .sort({ date: -1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   appointments.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      data:    appointments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const createAppointmentAdmin = async (req, res) => {
  try {
    const { user, service, teamMember, date, startTime, notes, status } = req.body;

    if (!user || !service || !teamMember || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'user, service, teamMember, date and startTime are required',
      });
    }

    const svc = await Service.findById(service);
    if (!svc) return res.status(404).json({ success: false, message: 'Service not found' });

    let durationMin = svc.durationMinutes || (typeof svc.duration === 'number' ? svc.duration : parseInt(svc.duration, 10));

    const endTime = toTime(toMinutes(startTime) + durationMin);

    const appointment = await Appointment.create({
      user,
      service,
      teamMember,
      date:      normalizeDate(date),
      startTime,
      endTime,
      notes:     notes  || '',
      status:    status || 'confirmed',
    });

    await appointment.populate(['user', 'service', 'teamMember']);
    emitBookingCreated(String(appointment._id));

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after', runValidators: true }
    ).populate(['user', 'service', 'teamMember']);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status === 'confirmed') {
      emitBookingConfirmed(String(appointment._id));
    } else if (status === 'completed') {
      emitBookingCompleted(String(appointment._id));
    } else if (status === 'cancelled') {
      emitBookingCancelled(String(appointment._id));
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime, teamMember, notes, status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const oldDateTime = `${new Date(appointment.date).toLocaleDateString('en-GB')} ${appointment.startTime}`;

    if (startTime) {
      const svc = await Service.findById(appointment.service);
      let durationMin = svc.durationMinutes || (typeof svc.duration === 'number' ? svc.duration : parseInt(svc.duration, 10));
      appointment.endTime = toTime(toMinutes(startTime) + durationMin);
      appointment.startTime = startTime;
    }

    if (date)       appointment.date       = normalizeDate(date);
    if (teamMember) appointment.teamMember = teamMember;
    if (notes !== undefined) appointment.notes = notes;
    if (status)     appointment.status     = status;

    await appointment.save();
    await appointment.populate(['user', 'service', 'teamMember']);

    const newDateTime = `${new Date(appointment.date).toLocaleDateString('en-GB')} ${appointment.startTime}`;
    emitBookingRescheduled(String(appointment._id), oldDateTime, newDateTime);

    res.json({ success: true, data: appointment });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  getRescheduleRequestByToken,
  submitRescheduleRequest,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,

  getAllAppointmentsAdmin,
  createAppointmentAdmin,
  updateAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment,
};
