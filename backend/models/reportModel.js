// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
  },
  // Optional: To associate with a user if your app has authentication
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Replace 'User' with your actual User model name if you have one
    required: false, // Make true if user must be logged in to report
  },
  // Optional: user's name for quick display, if available and desired
  userName: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Create a 2dsphere index for geospatial queries if needed later
ReportSchema.index({ location: '2dsphere' }); // You'd need to store lat/long as a GeoJSON point for this

module.exports = mongoose.model('Report', ReportSchema);