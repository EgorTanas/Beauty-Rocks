const mongoose = require('mongoose');
const workingHoursSchema = new mongoose.Schema({
  start: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Invalid time format. Use HH:MM (e.g., 09:00)',
    },
  },
  end: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        return !v || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Invalid time format. Use HH:MM (e.g., 18:00)',
    },
  },
}, { _id: false });
const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    specialties: [{
      type: String,
      trim: true,
    }],
    workingHours: {
      monday:    { type: workingHoursSchema, default: () => ({}) },
      tuesday:   { type: workingHoursSchema, default: () => ({}) },
      wednesday: { type: workingHoursSchema, default: () => ({}) },
      thursday:  { type: workingHoursSchema, default: () => ({}) },
      friday:    { type: workingHoursSchema, default: () => ({}) },
      saturday:  { type: workingHoursSchema, default: () => ({}) },
      sunday:    { type: workingHoursSchema, default: () => ({}) },
    },
    daysOff: [{
      type: Date,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
teamMemberSchema.index({ isActive: 1, order: 1 });
teamMemberSchema.methods.isAvailableOnDate = function(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  return !this.daysOff.some(dayOff => {
    const offDate = new Date(dayOff);
    offDate.setHours(0, 0, 0, 0);
    return offDate.getTime() === targetDate.getTime();
  });
};
teamMemberSchema.methods.getWorkingHoursForDay = function(dayName) {
  const day = dayName.toLowerCase();
  const hours = this.workingHours[day];
  if (!hours || !hours.start || !hours.end) {
    return null;
  }
  return {
    start: hours.start,
    end: hours.end,
  };
};
module.exports = mongoose.model('TeamMember', teamMemberSchema);