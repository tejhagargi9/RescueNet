// controllers/aiController.js
require("dotenv").config(); // Ensures environment variables are loaded
const { GoogleGenerativeAI } = require("@google/generative-ai");

// System prompt to instruct the AI on its task and output format
const systemPromptForCoordinates = `You are a highly accurate geolocation AI. Your sole task is to return the geographical coordinates (latitude and longitude) for a given place or area name.

The user will provide a place name.

You MUST respond ONLY with a JSON object.
The JSON object MUST be in the following format:
{"latitude": <NUMBER_latitude_value_with_high_precision>, "longitude": <NUMBER_longitude_value_with_high_precision>}

Example for "Eiffel Tower, Paris":
{"latitude": 48.85837009999999, "longitude": 2.2944813}

Do NOT include any introductory text, concluding remarks, explanations, apologies, code block markers (like \`\`\`json ... \`\`\`), or any other text outside of the raw JSON object.
Ensure the latitude and longitude values are NUMBERS (not strings) and have as much precision as possible.
If you cannot find the coordinates for the given place, or if the input is not a recognizable place, respond ONLY with the following JSON object:
{"error": "Could not find coordinates for the specified place."}
Do not add any other text even if you are returning an error.
`;

/**
 * @desc    Get latitude and longitude for a given place name using AI.
 * @route   POST /api/ai/getAIResponse (or similar, depending on how routes are mounted)
 * @access  Public (or as configured)
 */
const getAIResponseForCoordinates = async (req, res, next) => {
  try {
    const { prompt: placeName } = req.body; // 'prompt' field from body contains the place name

    console.log("Received request for coordinates. Place name:", placeName);

    if (!placeName || typeof placeName !== 'string' || placeName.trim() === "") {
      return res.status(400).json({ error: "Place name (in 'prompt' field) is required and must be a non-empty string." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the full prompt for the AI
    // The system prompt guides the AI, and the placeName is the specific input.
    const fullPromptToAI = `${systemPromptForCoordinates}\n\nFind coordinates for: "${placeName}"`;

    const result = await model.generateContent(fullPromptToAI);

    // Defensive coding: check if response, candidates, content, and parts exist
    if (!result.response || !result.response.candidates || !result.response.candidates[0] ||
      !result.response.candidates[0].content || !result.response.candidates[0].content.parts ||
      !result.response.candidates[0].content.parts[0] || !result.response.candidates[0].content.parts[0].text) {
      console.error("AI response structure is not as expected:", result);
      return res.status(500).json({ error: "Received an unexpected response structure from AI." });
    }

    const aiResponseText = result.response.candidates[0].content.parts[0].text.trim();
    console.log("Raw AI response text:", aiResponseText);

    try {
      // Attempt to parse the AI's response as JSON
      const coordinates = JSON.parse(aiResponseText);

      // Validate the parsed JSON: checks for latitude and longitude numbers
      if (coordinates && typeof coordinates.latitude === 'number' && typeof coordinates.longitude === 'number') {
        res.status(200).json({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        });
      } else if (coordinates && coordinates.error) {
        // AI explicitly returned an error in the expected JSON format
        // e.g., {"error": "Could not find coordinates for the specified place."}
        res.status(404).json({ error: coordinates.error });
      } else {
        // The response was JSON, but not in the expected {latitude, longitude} format or error format
        console.error("AI response JSON is not in the expected format:", coordinates);
        res.status(500).json({
          error: "AI response was valid JSON but not in the expected coordinate or error format.",
          details: aiResponseText, // Send raw response for debugging
        });
      }
    } catch (parseError) {
      // The AI's response was not valid JSON
      console.error("Error parsing AI response as JSON:", parseError.message);
      res.status(500).json({
        error: "AI response was not valid JSON.",
        ai_response: aiResponseText, // Send back the raw AI response for debugging
        details: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error in getAIResponseForCoordinates controller:", error);
    // Check if it's a Google AI API specific error
    if (error.response && error.response.data) {
      console.error("Google AI API Error:", error.response.data);
      return res.status(500).json({
        error: "Error calling Google AI API.",
        details: error.response.data
      });
    }
    // Pass to a generic error handler if one exists
    next(error);
  }
};

module.exports = {
  getAIResponseForCoordinates,
};