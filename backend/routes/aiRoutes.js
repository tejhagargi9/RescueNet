const express = require("express");
const router = express.Router();
const {
  getAIResponseForCoordinates,
  getAIResponseForTextAnalysis,
} = require("../controllers/aiController");

// Uncomment the line below if you want to protect routes with authentication
// const { requireAuth } = require('../middleware/clerkAuth');

// @route   POST /getAIResponse
// @desc    Get latitude and longitude for a given place name using AI.
//          Request body should contain a 'prompt' field.
//          e.g., { "prompt": "Eiffel Tower, Paris" }
// @access  Public
router.post("/getAIResponse", /* requireAuth, */ getAIResponseForCoordinates);

// @route   POST /analyzeText
// @desc    Get a response from the chatbot AI.
//          Request body should contain a 'prompt' field.
//          e.g., { "prompt": "Hello, how are you?" }
// @access  Public
router.post("/analyzeText", /* requireAuth, */ getAIResponseForTextAnalysis);

module.exports = router;