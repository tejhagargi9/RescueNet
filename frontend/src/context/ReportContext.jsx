// frontend/src/context/ReportContext.js
import React, { createContext, useState, useCallback, useContext } from 'react';
import apiClient from '../api/axiosConfig'; // Ensure this is your configured apiClient
// import { useAuthContext } from './AuthContext'; // If you need user details from context for reportData

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]); // This will now store SOS alerts for volunteers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const { currentUser } = useAuthContext(); // If needed to pass userId/userName to addReport/triggerSOS

  // Fetches SOS alerts specifically for the logged-in volunteer
  const fetchVolunteerSOSAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // This endpoint should be protected and return alerts for the authenticated volunteer
      const response = await apiClient.get('/sos/volunteer-alerts');
      setReports(response.data); // Assuming response.data is the array of alerts
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Triggers an SOS alert (previously addReport)
  const triggerSOSAlert = async (sosData) => { // sosData contains { latitude, longitude, message }
    setLoading(true);
    setError(null);
    try {
      // if (currentUser && currentUser._id) {
      //   // The backend should get citizenId from req.user.id via auth middleware
      // }
      const response = await apiClient.post('/sos/trigger', sosData);
      // After triggering, a citizen doesn't typically get the alert added to their "reports" list
      // This context is now more for volunteers.
      // Perhaps refetch alerts if this context was also used by citizens to see their own SOS,
      // but the current design is volunteer-centric for viewing alerts.
      // For now, just return success.
      console.log('SOS Triggered:', response.data);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update volunteer's response to an SOS alert
  const updateVolunteerResponse = async (alertId, responseStatus) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(`/sos/alerts/${alertId}/response`, { responseStatus });
      // Update the specific alert in the local state
      setReports(prevReports =>
        prevReports.map(report =>
          report._id === alertId ? response.data.alert : report
        )
      );
      return { success: true, data: response.data.alert };
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  };


  // removeReport was for the old "Report" feature, SOS alerts are not deleted by users.
  // If you need to "dismiss" an alert from a volunteer's view without deleting,
  // that would be a different logic (e.g., a local filter or a 'dismissed' flag).
  // For now, removing it as it doesn't fit the SOS alert flow.
  /*
  const removeReport = async (id) => { ... };
  */

  return (
    <ReportContext.Provider
      value={{
        sosAlerts: reports, // Renamed for clarity
        loading,
        error,
        fetchVolunteerSOSAlerts,
        triggerSOSAlert,
        updateVolunteerResponse, // Added this
        setError,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// Renamed hook for clarity
export const useReports = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider (acting as SOSProvider)');
  }
  return context;
};