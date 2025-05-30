// src/components/reports/CreateReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useReports } from '../context/ReportContext';
// import { useAuth } from '../../context/MockAuthContext'; // If you use auth for userId
import { Send, MapPin, AlertTriangle, CheckCircle, Loader2, Compass } from 'lucide-react';

const CreateReportPage = () => {
  const { addReport, loading, error, setError } = useReports();
  // const { currentUser } = useAuth(); // If you want to associate the report with a user

  const [message, setMessage] = useState('');
  const [latitude, setLatitude] = useState(null);

  const [longitude, setLongitude] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, fetching, success, error
  const [locationError, setLocationError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(''); // '', 'success', 'error'

  useEffect(() => {
    // Clear previous errors when component mounts or user starts typing
    setError(null);
    setSubmissionStatus('');
  }, [setError]);

  const handleGetLocation = () => {
    setLocationStatus('fetching');
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationStatus('success');
        },
        (err) => {
          console.error("Error getting location:", err);
          let errMsg = "Could not retrieve location. ";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errMsg += "Please allow location access.";
              break;
            case err.POSITION_UNAVAILABLE:
              errMsg += "Location information is unavailable.";
              break;
            case err.TIMEOUT:
              errMsg += "The request to get user location timed out.";
              break;
            default:
              errMsg += "An unknown error occurred.";
              break;
          }
          setLocationError(errMsg);
          setLocationStatus('error');
          setLatitude(null);
          setLongitude(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLocationStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous context errors
    setSubmissionStatus('');

    if (!message.trim()) {
      setError("Message cannot be empty."); // Use context error or local state
      return;
    }
    if (latitude === null || longitude === null) {
      setError("Location is required. Please fetch your location.");
      return;
    }

    const reportData = {
      message,
      latitude,
      longitude,
      filter: 'danger',
    };

    const success = await addReport(reportData);
    if (success) {
      setSubmissionStatus('success');
      setMessage('');
      // Optionally, reset location too or navigate away
      // setLatitude(null);
      // setLongitude(null);
      // setLocationStatus('idle');
      setTimeout(() => setSubmissionStatus(''), 3000); // Clear success message after 3s
    } else {
      setSubmissionStatus('error'); // Error is already set in context by addReport
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-6 flex items-center justify-center">
          <AlertTriangle className="mr-3 h-8 w-8 text-red-500" />
          Submit Emergency Report
        </h1>

        {submissionStatus === 'success' && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded" role="alert">
            <p className="font-bold flex items-center"><CheckCircle className="mr-2" />Report Submitted Successfully!</p>
          </div>
        )}
        {error && submissionStatus !== 'success' && ( // Show context error if no success message
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Your Message:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows="4"
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Describe your situation: who you are, what's wrong, current status..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Location:
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locationStatus === 'fetching'}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {locationStatus === 'fetching' ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : (
                <Compass className="mr-2 h-5 w-5" />
              )}
              {locationStatus === 'fetching' ? 'Fetching Location...' : 'Get Current Location'}
            </button>
            {locationStatus === 'error' && <p className="mt-2 text-sm text-red-600">{locationError}</p>}
            {locationStatus === 'success' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                <p className="flex items-center font-semibold"><MapPin size={16} className="mr-2" /> Location Acquired:</p>
                <p>Latitude: <span className="font-mono">{latitude?.toFixed(6)}</span></p>
                <p>Longitude: <span className="font-mono">{longitude?.toFixed(6)}</span></p>
              </div>
            )}
            {(locationStatus === 'idle' && !latitude) && (
              <p className="mt-2 text-xs text-slate-500">Click the button above to automatically detect your GPS coordinates.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || locationStatus !== 'success'}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {loading ? 'Submitting Report...' : 'Send Distress Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateReportPage;