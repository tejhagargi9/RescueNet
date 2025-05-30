const DisasterAlert = require('../models/disasterAlertModel');
const uploadImage = require('../utils/uploadImage');

exports.createAlert = async (req, res) => {
  try {
    const { title, description, places, disasterDateTime } = req.body;
    const imageFile = req.file;

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadImage(imageFile.buffer, 'disaster_alerts');
    }

    const placesArray = places ? places.split(',').map(p => p.trim()).filter(p => p) : [];
    if (placesArray.length === 0) {
      return res.status(400).json({ message: "Places cannot be empty and must be a comma-separated string." });
    }

    const newAlert = new DisasterAlert({
      title,
      description,
      places: placesArray,
      imageUrl,
      disasterDateTime,
    });

    const savedAlert = await newAlert.save();
    res.status(201).json(savedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await DisasterAlert.find().sort({ disasterDateTime: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await DisasterAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAlertById = async (req, res) => {
  try {
    const { title, description, places, disasterDateTime } = req.body;
    const imageFile = req.file;
    let imageUrl;

    const alertToUpdate = await DisasterAlert.findById(req.params.id);
    if (!alertToUpdate) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (imageFile) {
      imageUrl = await uploadImage(imageFile.buffer, 'disaster_alerts');
    } else {
      imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : alertToUpdate.imageUrl;
    }

    const placesArray = places ? places.split(',').map(p => p.trim()).filter(p => p) : alertToUpdate.places;
    if (places && placesArray.length === 0) {
      return res.status(400).json({ message: "Places cannot be empty and must be a comma-separated string if provided." });
    }


    const updatedData = {
      title: title || alertToUpdate.title,
      description: description || alertToUpdate.description,
      places: places ? placesArray : alertToUpdate.places,
      disasterDateTime: disasterDateTime || alertToUpdate.disasterDateTime,
      imageUrl: imageUrl,
    };

    const updatedAlert = await DisasterAlert.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });

    res.status(200).json(updatedAlert);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAlertById = async (req, res) => {
  try {
    const alert = await DisasterAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};