// src/components/Navbar.js
import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ onSosClick, onLearnClick }) => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg p-4 flex justify-between items-center rounded-b-xl"
    >
      <div className="text-white text-2xl font-bold tracking-wide">
        RescueNet
      </div>
      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,255,255,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onSosClick}
          className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          aria-label="SOS Button"
        >
          SOS
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255,255,255,0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onLearnClick}
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition-colors duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
          aria-label="Learn Button"
        >
          Learn
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;