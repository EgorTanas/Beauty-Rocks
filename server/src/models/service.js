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
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['nails', 'hair', 'skincare', 'bridal', 'other'],
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

module.exports = mongoose.model('Service', serviceSchema);