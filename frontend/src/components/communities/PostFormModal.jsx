// src/components/communities/PostFormModal.jsx
import React from 'react';
import IncidentForm from '../models/IncidentForm'; // Adjust path if your IncidentForm is elsewhere
import { X } from 'lucide-react';

const PostFormModal = ({
  show,
  onClose,
  incidentToEdit,
  onFormSubmit,
  formKey // Add a key to reset form state if needed
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Close form"
        >
          <X size={24} />
        </button>
        <IncidentForm
          key={formKey} // Use the key here
          incidentToEdit={incidentToEdit}
          onFormSubmit={onFormSubmit}
          onCancel={onClose} // The form's cancel button will also close the modal
        />
      </div>
    </div>
  );
};

export default PostFormModal;