// src/components/SOSModal.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:3000/api/reports'; // API URL

const SOSModal = ({ onClose, onSubmit }) => {
  const [details, setDetails] = useState('');
  const [location, setLocation] = useState(null); // Stores { latitude, longitude }
  const [locationError, setLocationError] = useState(null);
  // permissionStatus can be: 'checking', 'prompt', 'granted', 'denied'
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [isFetchingInitialLocation, setIsFetchingInitialLocation] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const watchIdRef = useRef(null); // To store the ID from watchPosition for cleanup

  const handleSuccess = (position) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    setLocationError(null);
    setIsFetchingInitialLocation(false);
    setPermissionStatus('granted'); // Ensure status is updated if it was 'prompt'
  };

  const handleError = (error) => {
    console.error("Geolocation error:", error);
    setIsFetchingInitialLocation(false);
    setLocation(null); // Clear location on error
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError('Location permission denied. Please enable it in browser settings.');
        setPermissionStatus('denied');
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError('Location information is unavailable.');
        break;
      case error.TIMEOUT:
        setLocationError('The request to get user location timed out.');
        break;
      default:
        setLocationError('An unknown error occurred while fetching location.');
        break;
    }
  };

  const startLocationWatch = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setPermissionStatus('denied');
      return;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsFetchingInitialLocation(true);
    setLocationError(null); 

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    let permStatusObject = null;

    const onPermissionChange = () => {
      if (permStatusObject) {
        setPermissionStatus(permStatusObject.state);
        if (permStatusObject.state === 'granted') {
          startLocationWatch();
        } else {
          setLocation(null);
          if (permStatusObject.state === 'denied') {
              setLocationError('Location permission denied.');
          }
          if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        }
      }
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        permStatusObject = status;
        setPermissionStatus(status.state);
        if (status.state === 'granted') {
          startLocationWatch();
        } else if (status.state === 'prompt') {
            setIsFetchingInitialLocation(false); 
        } else if (status.state === 'denied') {
            setLocationError('Location permission denied. Please enable it in browser settings.');
            setIsFetchingInitialLocation(false);
        }
        status.onchange = onPermissionChange;
      }).catch(err => {
        console.error("Error querying permissions: ", err);
        setPermissionStatus('prompt'); 
        setIsFetchingInitialLocation(false);
      });
    } else if (navigator.geolocation) {
      setPermissionStatus('prompt');
      setIsFetchingInitialLocation(false);
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setPermissionStatus('denied');
      setIsFetchingInitialLocation(false);
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (permStatusObject && typeof permStatusObject.removeEventListener === 'function') {
        permStatusObject.removeEventListener('change', onPermissionChange);
      } else if (permStatusObject) {
        permStatusObject.onchange = null;
      }
    };
  }, []);

  const handleAllowLocationClick = () => {
    startLocationWatch();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const reportData = {
      message: details,
      latitude: location?.latitude,
      longitude: location?.longitude,
      // If you have currentUser info, you might pass it to the modal as a prop
      // and include it here, e.g.:
      // userId: currentUser?._id,
      // userName: currentUser?.name
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        let errorMsg = `SOS submission failed. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (jsonError) {
          // Backend didn't send JSON error, use the status text if available
          errorMsg = `${errorMsg} ${response.statusText || ''}`.trim();
        }
        throw new Error(errorMsg);
      }

      // const responseData = await response.json(); // Process if needed
      // console.log('SOS submitted successfully:', responseData);

      if (onSubmit) {
        onSubmit({ details, location, success: true, data: reportData });
      }
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Error submitting SOS:", error);
      const errorMessage = error.message || 'An unexpected error occurred while sending SOS.';
      setSubmitError(errorMessage);
      if (onSubmit) {
        onSubmit({ details, location, success: false, error: errorMessage, data: reportData });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLocationStatus = () => {
    if (permissionStatus === 'checking') {
      return <span className="text-xs text-gray-500 italic">Checking permission...</span>;
    }

    if (permissionStatus === 'granted') {
      if (isFetchingInitialLocation) {
        return <span className="text-xs text-gray-500 italic">Fetching location...</span>;
      }
      if (location) {
        return (
          <span className="text-xs text-gray-600">
            Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
          </span>
        );
      }
      if (locationError) { 
        return <span className="text-xs text-red-500">{locationError}</span>;
      }
      return <span className="text-xs text-gray-500 italic">Awaiting location data...</span>;
    }

    if (permissionStatus === 'prompt' || (permissionStatus === 'denied' && !locationError)) {
      return (
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAllowLocationClick}
          className="px-3 py-1 text-xs bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600"
        >
          Allow Location
        </motion.button>
      );
    }

    if (locationError) { 
      return <span className="text-xs text-red-500">{locationError}</span>;
    }

    return null; 
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full transform scale-100"
      >
        <h2 className="text-3xl font-extrabold text-center text-red-600 mb-6">Emergency SOS</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="details" className="block text-gray-700 text-sm font-semibold mb-2">
              Enter all the details
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out resize-none"
              placeholder="Please describe the emergency, your current location, number of people affected, contact information, and any specific needs or dangers..."
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          {submitError && (
            <div className="my-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              <strong>Error:</strong> {submitError}
            </div>
          )}

          {/* Footer for buttons and location */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 space-y-3 sm:space-y-0">
            {/* Location Status */}
            <div className="text-center sm:text-left">
                {renderLocationStatus()}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center sm:justify-end space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-full shadow-md hover:bg-gray-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                aria-label="Cancel SOS form"
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Submit SOS request"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send SOS'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SOSModal;