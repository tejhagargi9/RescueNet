const express = require('express');
const multer = require('multer');
const incidentController = require('../controllers/incidentController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/', upload.single('image'), incidentController.createIncident);
router.get('/', incidentController.getAllIncidents);
router.get('/:id', incidentController.getIncidentById);
router.put('/:id', upload.single('image'), incidentController.updateIncidentById);
router.delete('/:id', incidentController.deleteIncidentById);

module.exports = router;