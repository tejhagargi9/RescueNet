

const mongoose = require('mongoose');

const disasterAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  places: {
    type: [String],
    required: [true, 'Places are required'],
    validate: [array => array.length > 0, 'At least one place is required']
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  disasterDateTime: {
    type: Date,
    required: [true, 'Date and time of disaster is required'],
  },
}, { timestamps: true });

const DisasterAlert = mongoose.model('DisasterAlert', disasterAlertSchema);

module.exports = DisasterAlert;