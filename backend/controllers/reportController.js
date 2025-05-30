// controllers/reportController.js
const Report = require('../models/reportModel'); // Corrected to point to Report.js as per your model file name

// @desc    Create a new report
// @route   POST /api/reports
// @access  Public (or Private if you require authentication)
exports.createReport = async (req, res) => {
  try {
    // Destructure `filter`. Removed userId and userName.
    const { message, latitude, longitude, filter } = req.body;

    if (!message || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Message, latitude, and longitude are required' });
    }

    const reportData = { message, latitude, longitude };

    // Add filter to reportData if it's provided in the request body
    if (filter) {
      reportData.filter = filter;
    }
    // userId and userName are no longer expected or used

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    if (error.name === 'ValidationError') {
      // Extract and send validation error messages
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public (or Private)
exports.getAllReports = async (req, res) => {
  try {
    // To enable filtering by the 'filter' field via query parameter (e.g., /api/reports?filter=medical):
    // const queryConditions = {};
    // if (req.query.filter) {
    //   queryConditions.filter = req.query.filter;
    // }
    // const reports = await Report.find(queryConditions).sort({ timestamp: -1 });

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
// @access  Private (typically, only an admin should delete)
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Optional: Add authorization check here (e.g., if req.user.role !== 'admin')
    // Since userId is not stored on the report, user-specific ownership checks are not applicable here.
    // For now, allowing deletion if found and assuming authorization is handled elsewhere (e.g., admin-only route).

    await report.deleteOne(); // or report.remove() for older mongoose versions

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: { id: req.params.id }, // Send back id of deleted item for client-side updates
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    // Handle cases where the ID format is invalid (CastError) or simply not found
    if (error.name === 'CastError' || error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Report not found: Invalid ID format' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};