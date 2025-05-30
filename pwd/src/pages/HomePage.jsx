// src/App.js // Should be src/HomePage.js based on function name, or App.js if this is the root
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

// Import the refactored components
import Navbar from '../components/Navbar';
// Make sure this import path is correct for NetworkWarning
import NetworkWarning from '../components/NetworkWarning'; // Or wherever NetworkWarning.js is
import SOSModal from '../components/SOSModal';
import { useNavigate } from 'react-router-dom';

function HomePage() { // If this file is App.js, consider renaming the function to App
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [learnContentVisible, setLearnContentVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    serviceWorkerRegistration.register();
  }, []);

  const handleSosClick = () => {
    setShowNetworkWarning(true);
    setLearnContentVisible(false);
  };

  const handleNetworkWarningContinue = () => {
    setShowNetworkWarning(false);
    setShowSOSModal(true);
  };

  const handleSOSModalSubmit = (data) => {
    console.log('SOS Data Submitted:', data);
    // Here you would integrate with your MERN backend API
    // Example: axios.post('/api/sos', data);
    alert('SOS request submitted! (Check console for data)');
  };

  const handleLearnClick = () => {
    navigate('/learn');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20">
      <Navbar onSosClick={handleSosClick} onLearnClick={handleLearnClick} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-grow w-full max-w-4xl p-6"
      >
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-red-600 mb-8"
        >
          Need Urgent Help?
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-center text-gray-700 mb-12"
        >
          Connect to immediate assistance and safety resources.
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-lg text-center text-gray-600 mb-12"
        >
          Your reliable companion for emergencies and learning.
        </motion.p>

        <AnimatePresence>
          {learnContentVisible && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-lg shadow-md mb-8"
            >
              <h2 className="text-2xl font-bold text-blue-600 mb-4">Learn More</h2>
              <p className="text-gray-700 leading-relaxed">
                This section would contain valuable information about disaster preparedness,
                first aid tips, safety guidelines, and other educational resources.
                You can expand this with articles, videos, and interactive content.
                The goal is to empower users with knowledge to handle various situations.
                Stay informed, stay safe!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLearnContentVisible(false)}
                className="mt-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300"
              >
                Close Learn Section
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Access</h2>
            <p className="text-gray-700">
              Easily send an SOS message in critical situations. Your safety is our priority.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSosClick}
              className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition-colors duration-300"
            >
              Send SOS Now
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-white p-8 rounded-lg shadow-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Base</h2>
            <p className="text-gray-700">
              Access a wealth of information on disaster preparedness and safety.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLearnClick}
              className="mt-6 px-6 py-3 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300"
            >
              Explore Learn
            </motion.button>
          </motion.div>
        </div>
      </motion.main>

      <AnimatePresence>
        {showNetworkWarning && (
          <NetworkWarning onContinue={handleNetworkWarningContinue} />
        )}
        {showSOSModal && (
          <SOSModal onClose={() => setShowSOSModal(false)} onSubmit={handleSOSModalSubmit} />
        )}
      </AnimatePresence>

      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 1 }}
        className="w-full bg-gray-800 text-white text-center p-4 mt-8 rounded-t-xl"
      >
        {/* CHANGED HERE */}
        <p>© {new Date().getFullYear()} RescueNet. All rights reserved.</p>
      </motion.footer>
    </div>
  );
}

export default HomePage;