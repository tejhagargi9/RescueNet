// frontend/src/pages/VolunteerSOSAlertsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import SOSAlertCard from '../components/SOSAlertCard';
import { BellRing, Loader2, AlertTriangle, Frown } from 'lucide-react';

const VolunteerSOSAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alertId: routeAlertId } = useParams(); // For direct navigation to an alert
  const navigate = useNavigate();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/sos/volunteer-alerts');
      setAlerts(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch SOS alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (routeAlertId && alerts.length > 0) {
      const element = document.getElementById(`alert-${routeAlertId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Maybe add some highlighting effect
      } else {
        // If alert ID from route not found in list, maybe it's old or invalid
        // navigate('/sos-alerts', { replace: true }); // or show a message
      }
    }
  }, [routeAlertId, alerts, navigate]);

  const handleAlertUpdate = (updatedAlert) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(a => (a._id === updatedAlert._id ? updatedAlert : a))
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-xl text-slate-700">Loading Your SOS Alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4 bg-red-50">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl text-red-700 font-semibold">Error Loading Alerts</p>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchAlerts} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 flex items-center">
          <BellRing className="mr-3 h-8 w-8 text-red-500" />
          Active SOS Alerts
        </h1>
        <button onClick={fetchAlerts} className="px-4 py-2 text-sm bg-slate-200 hover:bg-slate-300 rounded-md">Refresh</button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-white shadow rounded-lg">
          <Frown size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-xl text-slate-600 font-semibold">No Active SOS Alerts Assigned to You.</p>
          <p className="text-sm text-slate-500">You're all clear for now!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {alerts.map(alert => (
            <div key={alert._id} id={`alert-${alert._id}`}>
              <SOSAlertCard alert={alert} onAlertUpdate={handleAlertUpdate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerSOSAlertsPage;