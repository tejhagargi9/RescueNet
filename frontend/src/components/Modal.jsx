// src/components/Modal.js
import React from 'react';
// Correct import for Heroicons v2
import { XMarkIcon } from '@heroicons/react/24/outline'; // Or use /20/solid if you prefer

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose} // Optional: close modal on backdrop click
    >
      {/* Modal content container */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Close modal"
          >
            {/* Use the v2 icon name */}
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;