import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig'; // Ensure this path is correct

export const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAlert, setCurrentAlert] = useState(null); // For editing

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/alerts/`);
      console.log(response.data)
      setAlerts(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = async (alertData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', alertData.title);
      formData.append('description', alertData.description);
      formData.append('places', alertData.places); // Comma-separated string
      formData.append('disasterDateTime', alertData.disasterDateTime);
      if (alertData.image) {
        formData.append('image', alertData.image);
      }

      const response = await apiClient.post('/alerts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAlerts(prevAlerts => [response.data, ...prevAlerts]);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (id, alertData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', alertData.title);
      formData.append('description', alertData.description);
      formData.append('places', alertData.places); // Comma-separated string
      formData.append('disasterDateTime', alertData.disasterDateTime);
      if (alertData.image) {
        formData.append('image', alertData.image);
      } else if (alertData.imageUrl !== undefined) {
        formData.append('imageUrl', alertData.imageUrl); // To keep or clear existing image
      }

      const response = await apiClient.put(`/alerts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAlerts(prevAlerts =>
        prevAlerts?.map(alert => (alert._id === id ? response.data : alert))
      );
      setCurrentAlert(null);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/alerts/${id}`);
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert._id !== id));
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/alerts/${id}`);
      setCurrentAlert(response.data);
      return response.data;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      setCurrentAlert(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <AlertContext.Provider
      value={{
        alerts,
        loading,
        error,
        fetchAlerts,
        createAlert,
        updateAlert,
        deleteAlert,
        fetchAlertById,
        currentAlert,
        setCurrentAlert,
        setError
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};