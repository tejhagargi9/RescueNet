const Incident = require('../models/incidentModel');
const uploadImage = require('../utils/uploadImage');

exports.createIncident = async (req, res) => {
  try {
    const { title, description, incidentPlace } = req.body;
    const imageFile = req.file;

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadImage(imageFile.buffer, 'incidents');
    }

    const newIncident = new Incident({
      title,
      description,
      incidentPlace,
      imageUrl,
    });

    const savedIncident = await newIncident.save();
    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.status(200).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateIncidentById = async (req, res) => {
  try {
    const { title, description, incidentPlace } = req.body;
    const imageFile = req.file;
    let imageUrl;

    const incidentToUpdate = await Incident.findById(req.params.id);
    if (!incidentToUpdate) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    if (imageFile) {
      imageUrl = await uploadImage(imageFile.buffer, 'incidents');
    } else {
      imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : incidentToUpdate.imageUrl;
    }

    const updatedData = {
      title: title || incidentToUpdate.title,
      description: description || incidentToUpdate.description,
      incidentPlace: incidentPlace || incidentToUpdate.incidentPlace,
      imageUrl: imageUrl,
    };

    const updatedIncident = await Incident.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });

    res.status(200).json(updatedIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.status(200).json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};