import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig'; // Ensure this is properly configured

const ChatbotContext = createContext(null);

const initialBotMessage = {
  id: 'initial-bot-message-' + Date.now(), // Make ID unique enough
  sender: 'bot',
  text: 'Hello! I am RescueNet Assistant. How can I help you today?',
  timestamp: new Date().toISOString(),
};

export const ChatbotProvider = ({ children }) => {
  const [chatHistory, setChatHistory] = useState([initialBotMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modified sendMessage to accept an optional location object
  const sendMessage = useCallback(async (userPrompt, location) => {
    console.log("ChatbotContext: Sending message - Prompt:", userPrompt, "Location:", location);
    if (!userPrompt.trim()) return; // Don't send empty messages

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toISOString(),
    };

    // Add user message to history immediately
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Prepare payload, including location if available and valid
      const payload = { prompt: userPrompt };
      if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
        payload.location = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      }

      // The backend /ai/analyzeText endpoint now expects { prompt: userPrompt, location?: {latitude, longitude} }
      // and returns { reply: botReply }
      const response = await apiClient.post('/ai/analyzeText', payload);
      const botReply = response.data.reply;

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, botMessage]);
      return botReply; 
    } catch (err) {
      console.error("Chatbot request failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get a response from the chatbot.";
      setError(errorMessage);

      const errorBotMessage = {
        id: `error-bot-${Date.now()}`,
        sender: 'bot',
        text: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback dependencies are correct

  const clearChat = () => {
    setChatHistory([initialBotMessage]); // Reset to initial message
    setError(null);
    setIsLoading(false); // Reset loading state as well
  };

  const value = {
    chatHistory,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};