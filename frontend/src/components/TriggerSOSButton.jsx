// frontend/src/components/citizen/TriggerSOSButton.jsx
import React, { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Your configured axios instance
import { AlertTriangle, Loader2, Send } from 'lucide-react';

const TriggerSOSButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTriggerSOS = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Assuming your apiClient is configured with auth headers if needed
          const response = await apiClient.post('/sos/trigger', {
            latitude,
            longitude,
            message: "User triggered SOS button." // Optional: add a way for user to input message
          });
          setSuccessMessage(response.data.message || "SOS triggered successfully!");
        } catch (err) {
          setError(err.response?.data?.message || err.message || "Failed to trigger SOS.");
        } finally {
          setLoading(false);
        }
      },
      (locError) => {
        setError(`Failed to get location: ${locError.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="p-4 text-center">
      <button
        onClick={handleTriggerSOS}
        disabled={loading}
        className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center mx-auto text-lg"
      >
        {loading ? (
          <Loader2 className="animate-spin mr-2 h-6 w-6" />
        ) : (
          <AlertTriangle className="mr-2 h-6 w-6" />
        )}
        {loading ? 'Sending SOS...' : 'TRIGGER SOS'}
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
    </div>
  );
};

export default TriggerSOSButton;