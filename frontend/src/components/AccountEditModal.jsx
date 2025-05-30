// src/components/AccountEditModal.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Your generic modal component

// Reusable InputField and SelectField (same as your previous version)
const InputField = ({ label, id, type = 'text', value, onChange, required = false, disabled = false, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
      {...props}
    />
  </div>
);

const SelectField = ({ label, id, value, onChange, options, required = false, disabled = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const TextareaField = ({ label, id, value, onChange, rows = 3, disabled = false, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            rows={rows}
            disabled={disabled}
            className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
            {...props}
        />
    </div>
);

const CheckboxField = ({ label, id, checked, onChange, disabled = false }) => (
    <div className="flex items-center mb-4">
        <input
            id={id}
            name={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500 ${disabled ? 'cursor-not-allowed' : ''}`}
        />
        <label htmlFor={id} className={`ml-2 block text-sm text-slate-700 ${disabled ? 'text-slate-500' : ''}`}>
            {label}
        </label>
    </div>
);


const AccountEditModal = ({ isOpen, account, onClose, onSave }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (account) {
      // Initialize form with account data, handling potentially undefined fields
      setFormData({
        _id: account._id, // Keep ID for the save operation
        clerkUserId: account.clerkUserId, // Keep for reference
        fullName: account.fullName || '',
        email: account.email || '', // Email might not be editable by admin directly if tied to Clerk
        role: account.role || 'citizen', // Default role if not set
        onboarded: account.onboarded || false,
        accountStatus: account.accountStatus || 'pending_review',
        // Citizen specific
        age: account.age || '',
        disabilities: account.disabilities || '',
        // Shared
        phoneNumbers: account.phoneNumbers ? account.phoneNumbers.join(', ') : '', // Display as CSV
        addresses: account.addresses ? account.addresses.join(', ') : '', // Display as CSV
        // Volunteer specific (if any extra fields not covered by shared)
        // e.g. skills: account.skills ? account.skills.join(', ') : '',
        imageUrl: account.imageUrl || '', // Admins might want to update this
        // Location is an object, handle separately if editable
        // location: account.location ? { latitude: account.location.latitude || '', longitude: account.location.longitude || '' } : { latitude: '', longitude: '' },
      });
    } else {
      setFormData({}); // Reset if no account
    }
  }, [account, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Prepare data for submission (e.g., convert CSV strings back to arrays)
    const dataToSave = {
      ...formData,
      phoneNumbers: formData.phoneNumbers.split(',').map(p => p.trim()).filter(p => p),
      addresses: formData.addresses.split(',').map(a => a.trim()).filter(a => a),
      age: formData.age ? parseInt(formData.age, 10) : null,
    };
    // Remove fields an admin shouldn't directly set or are for reference
    delete dataToSave.clerkUserId; 
    delete dataToSave._id; // The API route will use _id from URL param

    const success = await onSave(dataToSave);
    setIsSubmitting(false);
    if (success) {
        // onClose(); // The parent component (AccountsSection) handles closing
    }
  };

  if (!isOpen || !account) return null;

  const modalTitle = `Edit ${account.fullName || account.email}'s Account`;
  const accountType = account.role; // Determine type from actual account data

  const roleOptions = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'admin', label: 'Admin' }, // Admin can change roles
    // { value: 'guest', label: 'Guest' }, // Typically guest role is pre-onboarding
  ];

  const accountStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending_review', label: 'Pending Review' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-1">
        <InputField
          label="Full Name"
          id="fullName"
          value={formData.fullName || ''}
          onChange={handleChange}
        />
        <InputField
          label="Email Address"
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          disabled // Typically email is tied to Clerk auth, admin might not change it here
          title="Email is managed via Clerk and usually not editable here."
        />
        <InputField
            label="Image URL"
            id="imageUrl"
            value={formData.imageUrl || ''}
            onChange={handleChange}
        />
        <SelectField
          label="Role"
          id="role"
          value={formData.role || ''}
          onChange={handleChange}
          options={roleOptions}
          required
        />
        <SelectField
          label="Account Status"
          id="accountStatus"
          value={formData.accountStatus || ''}
          onChange={handleChange}
          options={accountStatusOptions}
          required
        />
         <CheckboxField
            label="Onboarded"
            id="onboarded"
            checked={formData.onboarded || false}
            onChange={handleChange}
        />

        {accountType === 'citizen' && (
          <>
            <InputField
              label="Age"
              id="age"
              type="number"
              value={formData.age || ''}
              onChange={handleChange}
            />
            <TextareaField
              label="Disabilities / Special Needs"
              id="disabilities"
              value={formData.disabilities || ''}
              onChange={handleChange}
            />
          </>
        )}
        
        {/* Shared fields / Volunteer specific (if any besides role/status) */}
        {/* For example, if volunteers had a specific skills field */}
        {/* {accountType === 'volunteer' && (
           <TextareaField
              label="Skills (comma-separated)"
              id="skills" // if you add skills to schema
              value={formData.skills || ''}
              onChange={handleChange}
            />
        )} */}

        <TextareaField
          label={`Phone Numbers (comma-separated)`}
          id="phoneNumbers"
          value={formData.phoneNumbers || ''}
          onChange={handleChange}
          rows={2}
        />
        <TextareaField
          label={`${accountType === 'citizen' ? 'Frequent Places' : 'Service Areas'} (comma-separated)`}
          id="addresses"
          value={formData.addresses || ''}
          onChange={handleChange}
          rows={2}
        />
        
        {/* Location editing can be complex, simple inputs for now if needed */}
        {/* <h4>Location Coordinates:</h4>
        <div className="grid grid-cols-2 gap-4">
            <InputField label="Latitude" id="latitude" type="number" step="any" value={formData.location?.latitude || ''} onChange={(e) => setFormData(p => ({...p, location: {...p.location, latitude: e.target.value }}))} />
            <InputField label="Longitude" id="longitude" type="number" step="any" value={formData.location?.longitude || ''} onChange={(e) => setFormData(p => ({...p, location: {...p.location, longitude: e.target.value }}))} />
        </div> */}


        <div className="pt-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountEditModal;