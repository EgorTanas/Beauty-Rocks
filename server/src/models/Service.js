const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
      trim: true,
      
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    // Câmp numeric derivat — folosit de booking pentru calcul sloturi
    // Se populează automat din `duration` dacă nu e setat explicit
    durationMinutes: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'manicure',
        'pedicure',
        'hair-women',
        'hair-men',
        'other',
        /* legacy values kept for existing records */
        'nails',
        'hair',
        'skincare',
        'bridal',
      ],
      default: 'other',
    },
    image: {
      type: String,
      default: '',

    },
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


serviceSchema.index({ isActive: 1, order: 1 });
serviceSchema.index({ category: 1 });

// Auto-populează durationMinutes din string-ul duration (ex: "75 min", "1h 15min", "60")
serviceSchema.pre('save', function (next) {
  if (this.isModified('duration') || !this.durationMinutes) {
    const raw = String(this.duration || '');
    // Încearcă formatul "1h 30min" sau "1h30m"
    const hoursMatch = raw.match(/(\d+)\s*h/i);
    const minsMatch  = raw.match(/(\d+)\s*m/i);
    if (hoursMatch || minsMatch) {
      const h = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const m = minsMatch  ? parseInt(minsMatch[1],  10) : 0;
      this.durationMinutes = h * 60 + m;
    } else {
      // fallback: primul număr din string ("75 min" → 75, "75" → 75)
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num > 0) this.durationMinutes = num;
    }
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);