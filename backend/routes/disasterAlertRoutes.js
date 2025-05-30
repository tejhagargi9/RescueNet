const express = require('express');
const multer = require('multer');
const disasterAlertController = require('../controllers/disasterAlertController');

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

router.post('/', upload.single('image'), disasterAlertController.createAlert);
router.get('/', disasterAlertController.getAllAlerts);
router.get('/:id', disasterAlertController.getAlertById);
router.put('/:id', upload.single('image'), disasterAlertController.updateAlertById);
router.delete('/:id', disasterAlertController.deleteAlertById);

module.exports = router;