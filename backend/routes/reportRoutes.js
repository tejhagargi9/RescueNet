// routes/reportRoutes.js
const express = require('express');
const {
  createReport,
  getAllReports,
  deleteReport,
} = require('../controllers/reportController');

// Optional: If you have authentication middleware
// const { protect, authorize } = require('../middleware/auth'); // Example auth middleware

const router = express.Router();

router.route('/')
  .post(createReport) // Could add 'protect' middleware if only logged-in users can create
  .get(getAllReports); // Could add 'protect' if reports are not public

router.route('/:id')
  .delete(deleteReport); // Could add 'protect', and 'authorize' for roles like 'admin'

module.exports = router;