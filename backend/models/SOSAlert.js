// backend/models/SOSAlert.js
const mongoose = require('mongoose');
const VolunteerResponseSchema = new mongoose.Schema({
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  volunteerName: { type: String, required: true },
  fcmToken: { type: String }, // Store token at time of notification for record
  responseStatus: {
    type: String,
    enum: ['Notified', 'Acknowledged', 'EnRoute', 'Assisting', 'UnableToAssist', 'ResolvedByVolunteer'],
    default: 'Notified',
  },
  responseTimestamp: { type: Date, default: Date.now },
}, { _id: false });

const SOSAlertSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: { type: String, required: true },
  citizenLocation: { // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: { // [longitude, latitude]
      type: [Number],
      required: true,
    },
  },
  message: { type: String, trim: true }, // Optional message from citizen
  status: { // Overall status of the SOS alert
    type: String,
    enum: ['Pending', 'VolunteersNotified', 'AcknowledgedByVolunteer', 'AssistanceEnRoute', 'AssistanceInProgress', 'Resolved', 'Unattended'],
    default: 'Pending',
  },
  respondedVolunteers: [VolunteerResponseSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true }); // `timestamps: true` will manage createdAt and updatedAt automatically

SOSAlertSchema.index({ citizenLocation: '2dsphere' });


module.exports = mongoose.model('SOSAlert', SOSAlertSchema);