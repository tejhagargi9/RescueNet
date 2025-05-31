// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot, UserCircle, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for errors
import { useChatbotContext } from '../context/ChatBotContext'; // Adjust path if necessary
import { useAuthContext } from '../context/AuthContext'; // Import AuthContext

const Chatbot = ({ onClose }) => {
  const { chatHistory, isLoading, error, sendMessage, clearChat } = useChatbotContext();
  const { currentUser } = useAuthContext(); // Get currentUser from AuthContext
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput === '') return;

    setInputValue(''); // Clear input immediately

    // Get location from currentUser if available
    // Assuming currentUser.location is like { latitude: number, longitude: number } or undefined
    const userLocation = currentUser?.location;

    await sendMessage(trimmedInput, userLocation); // Pass user input and location to context's sendMessage
    
    inputRef.current?.focus(); // Refocus after send
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Optional: A button to clear chat for testing
  const handleClearChat = () => {
    clearChat();
    inputRef.current?.focus();
  }

  return (
    <div className="fixed bottom-20 right-5 md:bottom-24 md:right-8 w-[calc(100vw-2.5rem)] max-w-md h-[70vh] max-h-[500px] bg-white/90 backdrop-blur-md shadow-2xl rounded-xl border border-gray-200/50 flex flex-col z-50 transition-all duration-300 ease-out transform scale-100 origin-bottom-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300/50 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <h3 className="font-semibold text-lg">RescueNet Assistant</h3>
        </div>
        {/* <button onClick={handleClearChat} className="p-1 mr-2 text-xs hover:bg-white/20 rounded">Clear</button>  Optional clear chat button */}
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {chatHistory.map((msg) => (
          <div key={msg.id || msg.timestamp} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'bot' && (
              <div className={`flex-shrink-0 w-8 h-8 ${msg.text.toLowerCase().includes('error:') || msg.text.toLowerCase().includes('sorry, i encountered an error:') ? 'bg-red-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white`}>
                {msg.text.toLowerCase().includes('error:') || msg.text.toLowerCase().includes('sorry, i encountered an error:') ? <AlertTriangle size={18} /> : <Bot size={18} />}
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-2xl shadow ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : msg.text.toLowerCase().includes('error:') || msg.text.toLowerCase().includes('sorry, i encountered an error:')
                    ? 'bg-red-100 text-red-700 rounded-bl-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                <UserCircle size={20} />
              </div>
            )}
          </div>
        ))}
        {isLoading && ( // Use isLoading from context
          <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div className="max-w-[70%] p-3 rounded-2xl shadow bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
        {error && !isLoading && ( // Display general error if not already handled by a message in chatHistory
           <div className="flex items-center gap-2 p-2 text-sm text-red-700 bg-red-100 rounded-md">
             <AlertTriangle size={18} className="flex-shrink-0"/> 
             <p>Error: {typeof error === 'string' ? error : JSON.stringify(error)}</p>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-300/50 flex items-center gap-2">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
          className="flex-grow p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          style={{ maxHeight: '80px', overflowY: 'auto' }}
          disabled={isLoading} // Disable input while loading
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || inputValue.trim() === ''}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;