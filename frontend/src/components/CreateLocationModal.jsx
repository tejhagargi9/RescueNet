// src/components/reports/CreateLocationModal.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, X, MapPin, Search, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import apiClient from '../api/axiosConfig'; // Ensure this path is correct for your axios instance

const CreateLocationModal = ({ isOpen, onClose, onReportSubmit, filterCategories }) => {
  const [placeName, setPlaceName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(Object.keys(filterCategories)[0] || 'other');
  const [message, setMessage] = useState('');

  const [isFetchingCoords, setIsFetchingCoords] = useState(false);
  const [coordError, setCoordError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form when modal is opened/closed or filterCategories change
  useEffect(() => {
    if (isOpen) {
      setPlaceName('');
      setLatitude('');
      setLongitude('');
      // Ensure selectedFilter is a valid key, default to first if available
      const filterKeys = Object.keys(filterCategories);
      setSelectedFilter(filterKeys.length > 0 ? filterKeys[0] : 'other');
      setMessage('');
      setCoordError(null);
      setSubmitError(null);
      setIsFetchingCoords(false);
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen, filterCategories]);

  const handleGetCoordinates = async () => {
    if (!placeName.trim()) {
      setCoordError("Please enter a place name.");
      return;
    }
    setIsFetchingCoords(true);
    setCoordError(null);
    setLatitude('');
    setLongitude('');
    try {
      // Ensure your apiClient is configured correctly. If your backend API base is e.g., /api
      // and AI routes are under /api/ai, this path should be relative to that.
      // Example: if apiClient baseURL is 'http://localhost:3000/api', then '/ai/getAIResponse' is correct.
      const response = await apiClient.post('/ai/getAIResponse', { prompt: placeName });

      if (response.data && typeof response.data.latitude === 'number' && typeof response.data.longitude === 'number') {
        setLatitude(response.data.latitude.toString());
        setLongitude(response.data.longitude.toString());
      } else if (response.data && response.data.error) {
        setCoordError(response.data.error);
      } else {
        setCoordError("Unexpected response from coordinate service. No coordinates found.");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setCoordError(error.response.data.error);
      } else if (error.message) {
        setCoordError(`Failed to fetch coordinates: ${error.message}`);
      } else {
        setCoordError("Failed to fetch coordinates. Check console for details.");
      }
    } finally {
      setIsFetchingCoords(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!latitude || !longitude || !selectedFilter || !message.trim()) {
      setSubmitError("Latitude, Longitude, Category, and Message are required.");
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      setSubmitError("Latitude and Longitude must be valid numbers.");
      return;
    }

    setIsSubmitting(true);
    const reportData = {
      latitude: lat,
      longitude: lon,
      filter: selectedFilter,
      message: message.trim(),
      // placeName: placeName.trim() || "N/A", // Optional: if your backend handles it
    };

    try {
      const success = await onReportSubmit(reportData);
      if (success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose(); // Close modal after successful submission
        }, 1500);
      } else {
        // Error should be set by addReport in context, or provide a generic one here
        setSubmitError("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report via modal:", error);
      setSubmitError("An unexpected error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="createLocationModalTitle"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 m-4 relative transform transition-all duration-300 ease-in-out animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 id="createLocationModalTitle" className="text-2xl font-semibold text-slate-800 mb-6 text-center">
          Create New Location Report
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="placeName" className="block text-sm font-medium text-slate-700 mb-1">
              Place Name / Address (for coordinates)
            </label>
            <div className="flex items-stretch space-x-2">
              <input
                type="text"
                id="placeName"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g., Central Park, New Delhi"
                className="flex-grow block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50"
                disabled={isFetchingCoords}
              />
              <button
                type="button"
                onClick={handleGetCoordinates}
                disabled={isFetchingCoords || !placeName.trim()}
                className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
              >
                {isFetchingCoords ? (
                  <Loader2 size={20} className="animate-spin mr-2" />
                ) : (
                  <Search size={18} className="mr-1.5 flex-shrink-0" />
                )}
                <span className="truncate">{isFetchingCoords ? 'Fetching...' : 'Get Coordinates'}</span>
              </button>
            </div>
            {coordError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1 flex-shrink-0" /> {coordError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 28.6139"
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 77.2090"
                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reportCategory" className="block text-sm font-medium text-slate-700 mb-1">
              Report Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="reportCategory"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="block w-full appearance-none px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white pr-8 disabled:bg-slate-50"
                required
                disabled={isSubmitting}
              >
                {Object.entries(filterCategories).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message / Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the situation, number of people affected, specific needs..."
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50"
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div className="pt-2">
            {submitError && (
              <p className="mb-3 text-sm text-red-600 flex items-center justify-center bg-red-50 p-2.5 rounded-md">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" /> {submitError}
              </p>
            )}
            {submitSuccess && (
              <p className="mb-3 text-sm text-green-700 flex items-center justify-center bg-green-50 p-2.5 rounded-md">
                <CheckCircle size={18} className="mr-2 flex-shrink-0" /> Report submitted successfully! Closing soon...
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess || !latitude || !longitude || !message.trim()}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <MapPin size={18} className="mr-2 flex-shrink-0" />
              )}
              {isSubmitting ? 'Submitting Report...' : submitSuccess ? 'Submitted!' : 'Submit Location Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLocationModal;