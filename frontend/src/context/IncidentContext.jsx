import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../api/axiosConfig';

export const IncidentContext = createContext();

export const IncidentProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIncident, setCurrentIncident] = useState(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/incidents`);
      setIncidents(response.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createIncident = async (incidentData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', incidentData.title);
      formData.append('description', incidentData.description);
      formData.append('incidentPlace', incidentData.incidentPlace);
      if (incidentData.image) {
        formData.append('image', incidentData.image);
      }

      const response = await apiClient.post('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIncidents(prevIncidents => [response.data, ...prevIncidents]);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateIncident = async (id, incidentData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', incidentData.title);
      formData.append('description', incidentData.description);
      formData.append('incidentPlace', incidentData.incidentPlace);
      if (incidentData.image) {
        formData.append('image', incidentData.image);
      } else if (incidentData.imageUrl !== undefined) {
        formData.append('imageUrl', incidentData.imageUrl);
      }

      const response = await apiClient.put(`/incidents/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIncidents(prevIncidents =>
        prevIncidents.map(inc => (inc._id === id ? response.data : inc))
      );
      setCurrentIncident(null);
      return true;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteIncident = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/incidents/${id}`);
      setIncidents(prevIncidents => prevIncidents.filter(inc => inc._id !== id));
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/incidents/${id}`);
      setCurrentIncident(response.data);
      return response.data;
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      setCurrentIncident(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <IncidentContext.Provider
      value={{
        incidents,
        loading,
        error,
        fetchIncidents,
        createIncident,
        updateIncident,
        deleteIncident,
        fetchIncidentById,
        currentIncident,
        setCurrentIncident,
        setError
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};