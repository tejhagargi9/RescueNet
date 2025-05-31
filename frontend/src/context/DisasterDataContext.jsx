// src/contexts/DisasterDataContext.js
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { MOCK_REPORTS_INITIAL, MOCK_VOLUNTEERS_INITIAL, MOCK_MISSIONS_INITIAL } from '../data/mockData';
import { useNotifications } from './NotificationContext'; // For in-app alerts

const DisasterDataContext = createContext();

export const useDisasterData = () => useContext(DisasterDataContext);

export const DisasterDataProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
      setReports(MOCK_REPORTS_INITIAL.map(r => ({ ...r, timestamp: r.timestamp || new Date().toISOString() })));
      setVolunteers(MOCK_VOLUNTEERS_INITIAL);
      setMissions(MOCK_MISSIONS_INITIAL);
    } catch (e) {
      setError(e);
      console.error("Failed to fetch mock data", e);
      addNotification({ title: "Data Error", message: "Could not load initial disaster data.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Simulate incoming SOS alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance every 15 seconds
        const newSOS = {
          _id: nanoid(),
          latitude: parseFloat((Math.random() * (20 - 18) + 18).toFixed(6)),
          longitude: parseFloat((Math.random() * (75 - 72) + 72).toFixed(6)),
          message: `SIMULATED: New ${['Urgent MedEvac', 'Structure Unstable', 'Trapped Individuals', 'Wildfire Threat'][Math.floor(Math.random() * 4)]} Reported!`,
          filter: 'sos',
          timestamp: new Date().toISOString(),
          people_affected: Math.floor(Math.random() * 10) + 1,
          severity: Math.floor(Math.random() * 3) + 3,
          city: ["Random Area A", "Random Area B", "Remote Sector C", "New Settlement D"][Math.floor(Math.random() * 4)],
        };
        setReports(prev => [newSOS, ...prev]);
        addNotification({ title: "New SOS Alert!", message: `${newSOS.message.substring(0, 50)}...`, type: "warning", duration: 7000 });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [addNotification]);


  const addReport = useCallback(async (reportData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newReport = { _id: nanoid(), ...reportData, timestamp: new Date().toISOString() };
      setReports(prev => [newReport, ...prev]);
      addNotification({ title: "Report Submitted", message: `New '${reportData.filter}' report added.`, type: "success" });
      if (newReport.filter === 'sos') {
        addNotification({ title: "High Priority SOS!", message: `SOS from ${newReport.city || 'unknown location'} needs attention.`, type: "warning", duration: 8000 });
      }
      return true;
    } catch (e) {
      console.error("Failed to add report:", e);
      addNotification({ title: "Submission Error", message: "Could not add report.", type: "error" });
      return false;
    }
  }, [addNotification]);

  const removeReport = useCallback(async (reportId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const reportToRemove = reports.find(r => r._id === reportId);
      setReports(prev => prev.filter(r => r._id !== reportId));
      setMissions(prevMissions => prevMissions.map(mission => ({
        ...mission, related_report_ids: mission.related_report_ids.filter(id => id !== reportId)
      })));
      addNotification({ title: "Report Removed", message: `Report ${reportToRemove ? `'${reportToRemove.message.substring(0, 20)}...'` : reportId} deleted.`, type: "info" });
      return true;
    } catch (e) {
      console.error("Failed to remove report:", e);
      addNotification({ title: "Deletion Error", message: "Could not remove report.", type: "error" });
      return false;
    }
  }, [addNotification, reports]);

  const updateReport = useCallback(async (reportId, updatedData) => {
    // ... (implementation similar to add/remove with notifications)
    setReports(prev => prev.map(r => r._id === reportId ? { ...r, ...updatedData } : r));
    addNotification({ title: "Report Updated", message: `Report details modified.`, type: "info" });
    return true;
  }, [addNotification]);

  // Volunteer CUD (simplified for now)
  const addVolunteer = useCallback(async (volunteerData) => { /* ... */ return {}; }, []);
  const updateVolunteer = useCallback(async (volunteerId, updates) => {
    setVolunteers(prev => prev.map(v => v.id === volunteerId ? { ...v, ...updates } : v));
    return true;
  }, []);

  // Mission CUD (simplified for now)
  const addMission = useCallback(async (missionData) => {
    const newMission = { id: nanoid(), status: 'pending', assigned_volunteer_ids: [], related_report_ids: [], ...missionData, created_at: new Date().toISOString() };
    setMissions(prev => [newMission, ...prev]);
    addNotification({ title: "Mission Created", message: `New mission '${newMission.title}' added.`, type: "success" });
    return newMission;
  }, [addNotification]);

  const updateMission = useCallback(async (missionId, updates) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId) {
        const updatedMission = { ...m, ...updates };
        if (updates.status && updates.status !== m.status) {
          addNotification({ title: "Mission Update", message: `Mission '${m.title}' status changed to ${updates.status}.`, type: "info" });
        }
        if (updates.status === 'completed' && m.status !== 'completed') {
          updatedMission.completed_at = new Date().toISOString();
          setVolunteers(prevVols => prevVols.map(v => {
            if (updatedMission.assigned_volunteer_ids.includes(v.id)) {
              addNotification({ title: "Volunteer Update", message: `Volunteer ${v.name} is now available.`, type: "info" });
              return { ...v, status: 'available', assigned_mission_id: null };
            }
            return v;
          }));
        }
        return updatedMission;
      }
      return m;
    }));
    return true;
  }, [addNotification]);

  const assignVolunteerToMission = useCallback(async (missionId, volunteerId) => {
    let success = false;
    let volunteerName = '';
    let missionTitle = '';

    setMissions(prevMissions => prevMissions.map(m => {
      if (m.id === missionId && !m.assigned_volunteer_ids.includes(volunteerId)) {
        const volunteer = volunteers.find(v => v.id === volunteerId);
        if (volunteer && volunteer.status === 'available') {
          success = true;
          volunteerName = volunteer.name;
          missionTitle = m.title;
          return { ...m, assigned_volunteer_ids: [...m.assigned_volunteer_ids, volunteerId], status: m.status === 'pending' ? 'in_progress' : m.status };
        }
      }
      return m;
    }));

    if (success) {
      updateVolunteer(volunteerId, { status: 'assigned', assigned_mission_id: missionId });
      addNotification({ title: "Volunteer Assigned", message: `Volunteer ${volunteerName} assigned to mission '${missionTitle}'.`, type: "success" });
    } else {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      addNotification({ title: "Assignment Failed", message: `Could not assign volunteer. ${volunteer ? `(Status: ${volunteer.status})` : '(Not Found)'}`, type: "error" });
    }
    return success;
  }, [volunteers, updateVolunteer, addNotification]);


  const value = {
    reports, volunteers, missions, loading, error,
    fetchReports: fetchData, addReport, removeReport, updateReport,
    addVolunteer, updateVolunteer,
    addMission, updateMission, assignVolunteerToMission,
  };

  return (
    <DisasterDataContext.Provider value={value}>
      {children}
    </DisasterDataContext.Provider>
  );
};