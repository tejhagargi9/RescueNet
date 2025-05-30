// controllers/reportController.js
const Report = require('../models/reportModel');
// const User = require('../models/User'); // If you need to fetch user details

// @desc    Create a new report
// @route   POST /api/reports
// @access  Public (or Private if you require authentication)
exports.createReport = async (req, res) => {
  try {
    const { message, latitude, longitude, userId, userName } = req.body; // Assuming userId and userName might be sent from frontend if user is logged in

    if (!message || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Message, latitude, and longitude are required' });
    }

    const reportData = { message, latitude, longitude };
    if (userId) reportData.userId = userId;
    if (userName) reportData.userName = userName;


    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public (or Private)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 }); // Sort by newest first
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private (typically, only an admin or the user who created it should delete)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Optional: Add authorization check here (e.g., if req.user.role !== 'admin' && report.userId.toString() !== req.user.id)
    // For now, allowing deletion if found.

    await report.deleteOne(); // or report.remove() for older mongoose versions

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: {}, // Send back empty object or the id of deleted item
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Report not found with this ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};