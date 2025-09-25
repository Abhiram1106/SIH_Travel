const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  groupSize: {
    type: Number,
    default: 1
  },
  travelStyle: {
    type: String,
    default: 'mid-range'
  },
  interests: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  },
  itinerary: [{
    day: Number,
    time: String,
    activity: String,
    location: String,
    description: String,
    cost: Number
  }],
  totalEstimatedCost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', TripSchema);
