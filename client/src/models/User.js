// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  preferences: {
    budget: { type: String, enum: ['budget', 'mid-range', 'luxury'] },
    travelStyle: { type: String, enum: ['adventure', 'relaxed', 'cultural'] },
    accommodation: { type: String, enum: ['hotel', 'hostel', 'apartment'] }
  },
  trips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }]
}, { timestamps: true });

// models/Trip.js
const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  budget: { type: Number, required: true },
  weather: {
    forecast: { type: Object },
    alerts: [{ type: Object }]
  },
  security: {
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    alerts: [{ type: Object }]
  },
  itinerary: [{
    day: Number,
    activities: [{
      name: String,
      location: {
        lat: Number,
        lng: Number,
        address: String
      },
      time: String,
      duration: Number,
      description: String
    }]
  }],
  hotels: [{
    name: String,
    location: Object,
    price: Number,
    rating: Number,
    amenities: [String]
  }],
  route: {
    waypoints: [Object],
    traffic: Object,
    alternatives: [Object]
  }
}, { timestamps: true });
