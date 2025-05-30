import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import apiClient from '../api/axiosConfig'; // Ensure this path is correct

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded: isClerkLoaded, signOut: clerkSignOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [currentUser, setCurrentUser] = useState(null); // Our backend user profile
  const [isLoading, setIsLoading] = useState(true); // Loading state for our user profile
  const [error, setError] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    if (isSignedIn && clerkUser) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/users/me');
        setCurrentUser(response.data);
        console.log(currentUser)
        // Store essential info in localStorage if needed, but context is primary
        // These are fine for quick access or non-critical features,
        // but rely on currentUser from context for critical/reactive data.
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('onBoarded', response.data.onboarded.toString());

      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.response?.data?.message || "Failed to load user data.");
        // Consider setting currentUser to null if profile fetch fails catastrophically
        // setCurrentUser(null); // If appropriate for your error handling strategy
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentUser(null);
      setIsLoading(false); // Ensure loading is false if not signed in
      localStorage.removeItem('userRole');
      localStorage.removeItem('onBoarded');
    }
  }, [isSignedIn, clerkUser]); // clerkUser dependency is important

  useEffect(() => {
    if (isClerkLoaded) {
      fetchUserProfile();
    }
    // If !isClerkLoaded, isLoading in context value will be true,
    // consumers should wait.
  }, [isClerkLoaded, isSignedIn, fetchUserProfile]); // isSignedIn added to re-fetch if it changes post-load

  const updateUserProfile = async (data) => {
    // No need to set isLoading(true) here as OnboardingFlow handles its own submitting state
    // unless this function is used elsewhere without its own loading indicator.
    // For now, let's assume OnboardingFlow is the primary user and has its own state.
    // If other parts of app use this and expect loading state, then re-add: setIsLoading(true);
    try {
      const response = await apiClient.put('/users/me', data);
      setCurrentUser(response.data); // Update context state
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('onBoarded', response.data.onboarded.toString());
      // setIsLoading(false); // If setIsLoading(true) was added
      return response.data; // This is good, returns the updated profile
    } catch (err) {
      console.error("Failed to update user profile:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
      // setIsLoading(false); // If setIsLoading(true) was added
      throw err; // Re-throw for the caller to handle
    }
  };

 const fetchAllUsers = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await apiClient.get('/users/allUsers');
    console.log(response)
    console.log("all users: ",response.data)

    return response.data; // You can handle this in the component calling it
  } catch (err) {
    console.error("Failed to fetch all users:", err);
    setError(err.response?.data?.message || "Failed to fetch all users.");
    throw err;
  } finally {
    setIsLoading(false);
  }
}, []);



  const deleteUserAccount = async () => {
    setIsLoading(true); // Appropriate for a global action like account deletion
    try {
      await apiClient.delete('/users/me');
      setCurrentUser(null);
      await clerkSignOut();
      localStorage.clear();
    } catch (err) {
      console.error("Failed to delete user account:", err);
      setError(err.response?.data?.message || "Failed to delete account.");
      throw err; // Re-throw for the caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
  currentUser,
  isSignedIn,
  clerkUser,
  isLoading: isLoading || !isClerkLoaded,
  error,
  fetchUserProfile,
  updateUserProfile,
  deleteUserAccount,
  fetchAllUsers, // <-- Add this
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