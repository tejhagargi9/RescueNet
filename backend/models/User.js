const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['guest', 'citizen', 'volunteer', 'admin'],
    default: 'guest', // Or null, onboarding will set it
  },
  firstName: { type: String },
  lastName: { type: String },
  fullName: { type: String },
  imageUrl: { type: String },
  onboarded: { type: Boolean, default: false },

  // Citizen-specific fields
  age: { type: Number },
  disabilities: { type: String },

  // Volunteer-specific fields
  // (Currently, phoneNumbers, addresses, location are shared)
  // serviceAreas: [{ type: String }], // If you want to differentiate volunteer addresses

  // Shared by Citizen and Volunteer (populated during onboarding)
  phoneNumbers: [{ type: String }],
  addresses: [{ type: String }], // For Citizen: "places they visit often", For Volunteer: "service areas"
  location: { type: LocationSchema }, // Current/primary location

  clerkCreatedAt: { type: Date },
}, { timestamps: true }); // Adds createdAt and updatedAt for our DB records

module.exports = mongoose.model('User', UserSchema);