const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
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
  incidentPlace: {
    type: String,
    required: [true, 'Incident place is required'],
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    default: '',
  }
}, { timestamps: true });

const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;