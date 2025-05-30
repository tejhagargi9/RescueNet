// context/ReportContext.js
import React, { createContext, useState, useCallback, useContext } from 'react';
import apiClient from '../api/axiosConfig'; // Assuming you have this from previous setup
// If you have an AuthContext to get current user:
// import { useAuth } from './AuthContext'; // Replace with your actual AuthContext path

export const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // const { currentUser } = useAuth(); // Example: Get currentUser if needed

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/reports');
      setReports(response.data.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addReport = async (reportData) => {
    setLoading(true);
    setError(null);
    try {
      // Example: If you want to add userId automatically
      // if (currentUser && currentUser._id) {
      //   reportData.userId = currentUser._id;
      //   reportData.userName = currentUser.name; // Or however you get user's name
      // }

      const response = await apiClient.post('/reports', reportData);
      setReports(prevReports => [response.data.data, ...prevReports]); // Add to top
      return true; // Indicate success
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  const removeReport = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/reports/${id}`);
      setReports(prevReports => prevReports.filter(report => report._id !== id));
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        loading,
        error,
        fetchReports,
        addReport,
        removeReport,
        setError, // Expose setError for clearing
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => useContext(ReportContext);