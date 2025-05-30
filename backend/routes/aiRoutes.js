// routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { getAIResponseForCoordinates } = require("../controllers/aiController");

// If authentication is required for this route, you would uncomment and use middleware:
// const { requireAuth } = require('../middleware/clerkAuth'); // Adjust path as needed

// @route   POST /getAIResponse
// @desc    Get latitude and longitude for a given place name using AI.
//          The request body should contain a 'prompt' field with the place name.
//          e.g., { "prompt": "Eiffel Tower, Paris" }
// @access  Public (or Private if requireAuth middleware is added)
router.post("/getAIResponse", /* requireAuth, */ getAIResponseForCoordinates);
// Note: If this router is mounted under a prefix in your main app.js (e.g., app.use('/api/ai', aiRoutes);),
// the full path would be /api/ai/getAIResponse.

module.exports = router;