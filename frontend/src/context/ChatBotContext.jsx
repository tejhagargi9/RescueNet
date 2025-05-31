// ChatbotContext.jsx
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

  const sendMessage = useCallback(async (userPrompt) => {
    console.log("User Prompt : ",userPrompt)
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
      // The backend /analyzeText endpoint now expects { prompt: userPrompt }
      // and returns { reply: botReply }
      const response = await apiClient.post('/ai/analyzeText', { prompt: userPrompt });
      const botReply = response.data.reply;

      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, botMessage]);
      return botReply; // Return for potential immediate use, though history is the main source
    } catch (err) {
      console.error("Chatbot request failed:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to get a response from the chatbot.";
      setError(errorMessage);

      // Optionally add an error message to chat history
      const errorBotMessage = {
        id: `error-bot-${Date.now()}`,
        sender: 'bot',
        text: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorBotMessage]);
      // Do not re-throw here if you want the flow to continue and display error in chat
      // throw err; // Re-throwing will make the calling component's catch block execute
    } finally {
      setIsLoading(false);
    }
  }, []);

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