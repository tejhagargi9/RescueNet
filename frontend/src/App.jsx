import React from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded } from "@clerk/clerk-react";

import Navbar from './components/Navbar'; // Your RescueNetNavbar
import OnboardingFlow from './components/OnboardingFlow'; // Your Flow component
import HomePage from './pages/HomePage'; // Your Home component
import AccountPage from './pages/AccountPage';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Optional

// Component to handle redirection after sign in/out and onboarding check
function AppContent() {
  const { isSignedIn, isOnboarded, isLoading, userRole } = useAuthContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isSignedIn && !isOnboarded) {
      // User is signed in but not onboarded, OnboardingFlow should handle visibility
      // No explicit redirect needed here if OnboardingFlow is modal.
      // If OnboardingFlow was a separate page, you'd navigate here.
    }
  }, [isSignedIn, isOnboarded, isLoading, navigate, userRole]);

  return (
    <>
      <Navbar />
      <OnboardingFlow onComplete={() => console.log("Onboarding completed/closed.")} />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<AccountPage />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Example of a route that requires sign-in but not necessarily full onboarding yet */}
        {/* <Route path="/some-feature" element={
          <SignedIn>
            <SomeFeaturePage />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        }/> */}

        {/* Fallback for any other route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider wraps everything that needs auth context */}
        <ClerkLoaded> {/* Ensures Clerk is loaded before rendering content reliant on it */}
          <AppContent />
        </ClerkLoaded>
      </AuthProvider>
    </Router>
  );
}

export default App;