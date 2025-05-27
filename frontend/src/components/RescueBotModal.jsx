import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const RescueBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm RescueBot, your disaster preparedness assistant. How can I help you prepare for emergencies today?", 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const botResponses = {
    earthquake: "For earthquake preparedness: 1) Secure heavy furniture to walls, 2) Create an emergency kit with 72 hours of supplies, 3) Identify safe spots in each room (under sturdy tables), 4) Practice Drop, Cover, and Hold On drills. Would you like specific details about any of these steps?",
    flood: "Flood preparedness essentials: 1) Know your evacuation routes, 2) Keep important documents in waterproof containers, 3) Install sump pumps and backup power, 4) Never drive through flooded roads. What specific flood risks are you concerned about?",
    fire: "Wildfire safety measures: 1) Create defensible space around your home, 2) Use fire-resistant building materials, 3) Have multiple evacuation routes planned, 4) Keep emergency supplies ready to go. Are you in a high-risk wildfire area?",
    wildfire: "Wildfire safety measures: 1) Create defensible space around your home, 2) Use fire-resistant building materials, 3) Have multiple evacuation routes planned, 4) Keep emergency supplies ready to go. Are you in a high-risk wildfire area?",
    hurricane: "Hurricane preparation steps: 1) Board up windows, 2) Stock up on water (1 gallon per person per day), 3) Secure outdoor furniture, 4) Have battery-powered radio ready. When is hurricane season in your area?",
    tornado: "Tornado safety basics: 1) Identify your safe room (interior room on lowest floor), 2) Have a weather radio, 3) Practice tornado drills, 4) Stay away from windows during storms. Do you have a basement or storm shelter?",
    winter: "Winter storm preparation: 1) Insulate pipes and service heating equipment, 2) Stock heating fuel and warm clothing, 3) Prepare food that doesn't require cooking, 4) Have rock salt for walkways. What's your main heating source?",
    heat: "Heat wave safety: 1) Check air conditioning systems, 2) Identify cooling centers, 3) Stay hydrated and avoid alcohol, 4) Wear light-colored, loose clothing. Do you have reliable air conditioning?",
    drought: "Drought preparedness: 1) Implement water conservation measures, 2) Install drought-resistant landscaping, 3) Fix leaks and install water-efficient fixtures, 4) Plan alternative water sources. What's your main water source?",
    power: "Power outage preparation: 1) Have battery-powered radio and flashlights, 2) Consider backup power options, 3) Keep mobile devices charged, 4) Never use generators indoors. How long do outages typically last in your area?",
    outage: "Power outage preparation: 1) Have battery-powered radio and flashlights, 2) Consider backup power options, 3) Keep mobile devices charged, 4) Never use generators indoors. How long do outages typically last in your area?",
    pandemic: "Pandemic preparedness: 1) Stock prescription medications (30-90 day supply), 2) Prepare non-perishable food for extended periods, 3) Plan for working from home, 4) Have cleaning supplies. Are you in a high-risk group?",
    chemical: "Chemical spill safety: 1) Know industrial facilities nearby, 2) Understand evacuation vs shelter-in-place, 3) Have emergency kit ready, 4) Know symptoms of exposure. Are there chemical facilities in your area?",
    cyber: "Cyber attack preparedness: 1) Keep software updated, 2) Use strong passwords and two-factor authentication, 3) Backup data offline, 4) Have paper copies of critical info. Do you work with sensitive data?",
    emergency: "Emergency kit essentials: Water (1 gallon per person for 3 days), non-perishable food (3-day supply), flashlight, first aid kit, extra batteries, whistle, dust masks, plastic sheeting, moist towelettes, wrench to turn off utilities, manual can opener, and cash. What specific items do you need help with?",
    supplies: "Essential emergency supplies include: Food and water for 72 hours, medications, first aid kit, flashlight, radio, batteries, whistle, dust masks, plastic sheeting, and important documents. Would you like a complete checklist for your household size?",
    evacuation: "Evacuation planning: 1) Know multiple routes out of your area, 2) Designate meeting places, 3) Keep vehicle fueled, 4) Have grab-and-go bags ready, 5) Plan for pets. Have you discussed evacuation plans with your family?",
    communication: "Emergency communication plan: 1) Choose out-of-state contact person, 2) Ensure everyone knows the contact info, 3) Have backup charging methods for phones, 4) Know how to use text messaging (often works when calls don't). Do you have an emergency contact established?",
    first: "First aid basics: 1) Learn CPR and basic first aid, 2) Keep well-stocked first aid kit, 3) Know how to treat shock, bleeding, and fractures, 4) Have emergency medications available. Are you trained in first aid?",
    aid: "First aid basics: 1) Learn CPR and basic first aid, 2) Keep well-stocked first aid kit, 3) Know how to treat shock, bleeding, and fractures, 4) Have emergency medications available. Are you trained in first aid?",
    family: "Family emergency planning: 1) Create communication plan with contact info, 2) Practice evacuation routes, 3) Assign responsibilities to each family member, 4) Plan for special needs (elderly, disabled, pets). How many people are in your household?",
    pet: "Pet emergency planning: 1) Have carrier and leash for each pet, 2) Stock pet food, water, and medications, 3) Keep vaccination records handy, 4) Identify pet-friendly shelters. What types of pets do you have?",
    pets: "Pet emergency planning: 1) Have carrier and leash for each pet, 2) Stock pet food, water, and medications, 3) Keep vaccination records handy, 4) Identify pet-friendly shelters. What types of pets do you have?",
    shelter: "Emergency shelter options: 1) Know locations of public shelters, 2) Understand shelter rules and what to bring, 3) Have backup plans if shelters are full, 4) Consider staying with friends/family outside danger zone. Have you identified shelter locations?",
    insurance: "Emergency insurance planning: 1) Review coverage for natural disasters, 2) Document belongings with photos/video, 3) Keep copies of policies in safe place, 4) Understand deductibles and claims process. When did you last review your coverage?",
    default: "I can help you with earthquake, flood, wildfire, hurricane, tornado, winter storm, heat wave, drought, power outage, pandemic, chemical spill, and cyber attack preparedness. I also provide guidance on emergency supplies, evacuation planning, communication strategies, first aid, family planning, pet safety, shelter options, and insurance. What specific disaster or topic would you like to know about?"
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerInput = inputText.toLowerCase();
      let response = botResponses.default;

      // Check for keywords in user input
      Object.keys(botResponses).forEach(key => {
        if (lowerInput.includes(key)) {
          response = botResponses[key];
        }
      });

      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'bot'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black bg-opacity-50  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl mt-[5rem] w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">RescueBot</h3>
              <p className="text-sm opacity-90">Your Emergency Preparedness Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about disaster preparedness..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescueBot;