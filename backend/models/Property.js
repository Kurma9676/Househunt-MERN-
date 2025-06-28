const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propType: {
    type: String,
    required: true,
    enum: ['apartment', 'house', 'room', 'studio', 'villa']
  },
  adType: {
    type: String,
    required: true,
    enum: ['rent', 'sale']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  ownerContact: {
    phone: String,
    email: String
  },
  propAmt: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  addInfo: {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    parking: Boolean,
    furnished: Boolean,
    petsAllowed: Boolean,
    description: String,
    amenities: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', propertySchema); 