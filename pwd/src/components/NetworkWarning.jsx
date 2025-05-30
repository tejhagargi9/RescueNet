// src/components/NetworkWarning.js
import React from 'react';
import { motion } from 'framer-motion';

const NetworkWarning = ({ onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center"
      >
        <p className="font-bold text-lg mb-4">Important Notice!</p>
        <p className="text-base mb-6">
          Please keep your network on for emergencies, even if the connection is slow.
          This ensures your SOS message can be sent.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="px-8 py-3 bg-yellow-500 text-white font-bold rounded-full shadow-lg hover:bg-yellow-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
          aria-label="Continue to SOS form"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default NetworkWarning;