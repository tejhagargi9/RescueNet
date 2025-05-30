// frontend/src/components/VolunteerSetup.jsx
import React, { useEffect, useRef } from 'react';
import { requestNotificationPermissionAndGetToken } from '../firebase';
import apiClient from '../api/axiosConfig';
import { useAuthContext } from '../context/AuthContext'; // Your AuthContext

const VolunteerSetup = () => {
  const { isSignedIn, currentUser, isLoading: authLoading } = useAuthContext();
  const locationIntervalRef = useRef(null);

  useEffect(() => {
    const setupVolunteerFeatures = async () => {
      // Check if user is signed in, loaded, is a volunteer, and has an ID
      if (isSignedIn && currentUser && currentUser.userType === 'volunteer' && currentUser._id) {

        // 1. Request permission and get FCM token
        const token = await requestNotificationPermissionAndGetToken();
        if (token) {
          try {
            // The backend /users/fcm-token route should use auth middleware
            // to identify the user from the token (e.g. JWT from Clerk)
            await apiClient.post('/users/fcm-token', { fcmToken: token });
            console.log('FCM token sent to backend for volunteer:', currentUser._id);
          } catch (error) {
            console.error('Failed to send FCM token to backend:', error.response?.data?.message || error.message);
          }
        }

        // 2. Update location periodically
        const updateLocation = () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                  // Backend /users/location also needs auth middleware
                  await apiClient.post('/users/location', { latitude, longitude });
                  console.log('Volunteer location updated for:', currentUser._id);
                } catch (error) {
                  console.error('Failed to update volunteer location:', error.response?.data?.message || error.message);
                }
              },
              (err) => console.error('Error getting volunteer location:', err.message),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } // Added timeout and maximumAge
            );
          }
        };

        updateLocation(); // Initial update

        // Clear existing interval if any before setting a new one
        if (locationIntervalRef.current) {
          clearInterval(locationIntervalRef.current);
        }
        locationIntervalRef.current = setInterval(updateLocation, 5 * 60 * 1000); // Update every 5 minutes

      } else if (locationIntervalRef.current) {
        // If user logs out or is no longer a volunteer, clear the interval
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
    };

    if (!authLoading) { // Only run setup once auth state is resolved
      setupVolunteerFeatures();
    }

    // Cleanup interval on component unmount
    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isSignedIn, currentUser, authLoading]); // Re-run if these dependencies change

  return null; // This component is for side effects, renders nothing
};

export default VolunteerSetup;