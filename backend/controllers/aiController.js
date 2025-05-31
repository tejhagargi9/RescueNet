// controllers/aiController.js
require("dotenv").config(); // Ensures environment variables are loaded
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Existing code for getAIResponseForCoordinates (keep it as is) ---
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

const getAIResponseForCoordinates = async (req, res, next) => {
  try {
    const { prompt: placeName } = req.body; 

    console.log("Received request for coordinates. Place name:", placeName);

    if (!placeName || typeof placeName !== 'string' || placeName.trim() === "") {
      return res.status(400).json({ error: "Place name (in 'prompt' field) is required and must be a non-empty string." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPromptToAI = `${systemPromptForCoordinates}\n\nFind coordinates for: "${placeName}"`;
    const result = await model.generateContent(fullPromptToAI);

    if (!result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("AI response structure for coordinates is not as expected:", result);
      return res.status(500).json({ error: "Received an unexpected response structure from AI for coordinates." });
    }

    const aiResponseText = result.response.candidates[0].content.parts[0].text.trim();
    console.log("Raw AI response text for coordinates:", aiResponseText);

    try {
      const coordinates = JSON.parse(aiResponseText);
      if (coordinates?.latitude !== undefined && typeof coordinates.latitude === 'number' && 
          coordinates?.longitude !== undefined && typeof coordinates.longitude === 'number') {
        res.status(200).json({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        });
      } else if (coordinates?.error) {
        res.status(404).json({ error: coordinates.error });
      } else {
        console.error("AI response JSON for coordinates is not in the expected format:", coordinates);
        res.status(500).json({
          error: "AI response for coordinates was valid JSON but not in the expected format.",
          details: aiResponseText,
        });
      }
    } catch (parseError) {
      console.error("Error parsing AI response for coordinates as JSON:", parseError.message);
      res.status(500).json({
        error: "AI response for coordinates was not valid JSON.",
        ai_response: aiResponseText,
        details: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error in getAIResponseForCoordinates controller:", error);
    if (error.response?.data) {
      console.error("Google AI API Error (Coordinates):", error.response.data);
      return res.status(500).json({
        error: "Error calling Google AI API for coordinates.",
        details: error.response.data
      });
    }
    next(error);
  }
};

// --- MODIFIED CONTROLLER FOR TEXT ANALYSIS (CHATBOT) ---

// System prompt to instruct the AI on its task for general chat
const systemPromptForChatbot = `You are RescueNet Assistant, a helpful, friendly, and concise AI assistant.
Your primary goal is to assist users with their queries related to RescueNet, safety, or general information.
If a user's query sounds like an emergency or they explicitly mention an emergency, you MUST advise them to use the Emergency SOS button in the app or call their local emergency number immediately.
For other queries, provide clear and brief answers.
Avoid overly long responses. Be direct.
Do not make up information. If you don't know an answer, say so.
`;

/**
 * @desc    Get an AI-generated response for a user's chat message.
 * @route   POST /api/ai/analyzeText
 * @access  Public (or as configured)
 */
const getAIResponseForTextAnalysis = async (req, res, next) => {
  try {
    const { prompt: userQuery } = req.body; // Expecting a 'prompt' field with the user's message
    console.log("User prompt at backend : ", req.body)

    console.log("Received request for chatbot response.");
    console.log("User Query (from 'prompt' field):", userQuery);

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === "") {
      return res.status(400).json({ message: "A 'prompt' field with the user's query is required and must be a non-empty string." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPromptToAI = `${systemPromptForChatbot}\n\nUser's message: "${userQuery}"\n\nAssistant's response:`;
    // console.log("\nFull prompt to AI for chatbot:\n", fullPromptToAI); // For debugging

    const result = await model.generateContent(fullPromptToAI);

    if (!result.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("AI response structure for chatbot is not as expected:", result);
      return res.status(500).json({ message: "Received an unexpected response structure from AI for chatbot." });
    }

    const aiResponseText = result.response.candidates[0].content.parts[0].text.trim();
    console.log("Raw AI response text for chatbot:", aiResponseText);

    res.status(200).json({
      reply: aiResponseText // Ensure this key is 'reply'
    });

  } catch (error) {
    console.error("Error in getAIResponseForTextAnalysis controller:", error);
    if (error.response?.data) {
      console.error("Google AI API Error (Chatbot):", error.response.data);
      return res.status(500).json({
        message: "Error calling Google AI API for chatbot.",
        details: error.response.data
      });
    }
    // Ensure a default message for other errors
    const errorMessage = error.message || "An unexpected error occurred processing your request.";
    res.status(500).json({ message: errorMessage });
    // next(error); // Use this if you have a global error handler middleware
  }
};

module.exports = {
  getAIResponseForCoordinates,
  getAIResponseForTextAnalysis,
};