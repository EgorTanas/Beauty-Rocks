const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
    },
    teamMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamMember',
      required: [true, 'Team member is required'],
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
    },

    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      validate: {
        validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: 'Invalid time format. Use HH:MM',
      },
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      validate: {
        validator: (v) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: 'Invalid time format. Use HH:MM',
      },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },

    rescheduleRequested: {
      type: Boolean,
      default: false,
    },

    rescheduleToken: {
      type: String,
      default: null,
      select: false,
    },

    rescheduleTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    rescheduleTokenUsedAt: {
      type: Date,
      default: null,
      select: false,
    },

    reminder24hSentAt: {
      type: Date,
      default: null,
    },

    reminder2hSentAt: {
      type: Date,
      default: null,
    },

    telegramMessageId: {
      type: String,
      default: null,
      select: false,
    },

    telegramChatId: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ teamMember: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
