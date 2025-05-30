// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import apiClient from '../api/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded: isClerkLoaded, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true); // Renamed for clarity: specific to profile loading
  const [error, setError] = useState(null); // General error for auth/profile

  const fetchUserProfile = useCallback(async () => {
    if (isSignedIn && clerkUser) {
      setIsProfileLoading(true); // Use specific profile loading
      setError(null);
      try {
        const response = await apiClient.get('/users/me');
        setCurrentUser(response.data);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('onBoarded', response.data.onboarded.toString());
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.response?.data?.message || "Failed to load user data.");
      } finally {
        setIsProfileLoading(false); // Use specific profile loading
      }
    } else {
      setCurrentUser(null);
      setIsProfileLoading(false);
      localStorage.removeItem('userRole');
      localStorage.removeItem('onBoarded');
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isClerkLoaded) {
      fetchUserProfile();
    }
  }, [isClerkLoaded, isSignedIn, fetchUserProfile]);

  const updateUserProfile = async (data) => {
    // This function should not alter AuthContext's isProfileLoading
    try {
      const response = await apiClient.put('/users/me', data);
      setCurrentUser(response.data);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('onBoarded', response.data.onboarded.toString());
      return response.data;
    } catch (err) {
      console.error("Failed to update user profile:", err);
      // Consider if this should set the global error or throw
      setError(err.response?.data?.message || "Failed to update profile.");
      throw err;
    }
  };

  const fetchAllUsers = useCallback(async () => {
    // REMOVED: setIsLoading(true) and setError(null) from AuthContext state
    try {
      const response = await apiClient.get('/users/allUsers');
      console.log("all users from AuthContext: ", response.data); // Keep for debugging if needed
      return response.data;
    } catch (err) {
      console.error("Failed to fetch all users (AuthContext):", err);
      // REMOVED: setError(...) from AuthContext state
      throw err; // Re-throw for the calling component to handle
    }
    // REMOVED: finally { setIsLoading(false); }
  }, []); // apiClient is stable, no other deps from context needed here

  const deleteUserAccount = async () => {
    // This action fundamentally changes auth state, so using a loading state might be okay,
    // but ensure it leads to a sign-out flow rather than unmounting/remounting the dashboard.
    // For now, let's assume it's handled correctly leading to sign out.
    // If this also causes the glitch, it would need similar decoupling or careful handling.
    setIsProfileLoading(true); // Or a more specific `isDeletingAccountLoading`
    try {
      await apiClient.delete('/users/me');
      setCurrentUser(null);
      await clerkSignOut();
      localStorage.clear();
    } catch (err) {
      console.error("Failed to delete user account:", err);
      setError(err.response?.data?.message || "Failed to delete account.");
      throw err;
    } finally {
      setIsProfileLoading(false);
    }
  };

  const value = {
    currentUser,
    isSignedIn,
    clerkUser,
    // isLoading now primarily reflects auth readiness and profile loading
    isLoading: isProfileLoading || !isClerkLoaded,
    error, // This is the global auth/profile error
    fetchUserProfile,
    updateUserProfile,
    deleteUserAccount,
    fetchAllUsers,
    userRole: currentUser?.role,
    isOnboarded: currentUser?.onboarded,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};