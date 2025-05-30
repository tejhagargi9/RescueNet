// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded } from "@clerk/clerk-react";

import Navbar from './components/Navbar';
import OnboardingFlow from './components/OnboardingFlow';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DisasterPreparednessApp from './pages/DisastersInfoPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AlertProvider } from './context/AlertContext';
import { IncidentProvider } from './context/IncidentContext';
import CommunitiesPage from './pages/CommunitiesPage';
import { ReportProvider } from './context/ReportContext';
import ViewReportsMapPage from './pages/ViewReportsMapPage';
import CreateReportPage from './pages/CreateReportPage';

// New imports for SOS feature
import VolunteerSetup from './components/VolunteerSetup'; // <= NEW
import VolunteerSOSAlertsPage from './pages/VolunteerSOSAlertsPage'; // <= NEW
import TriggerSOSButton from './components/TriggerSOSButton'; // Import if you want a dedicated page for it

function AppContent() {
  const { isSignedIn, isOnboarded, isLoading, userRole } // userRole from AuthContext can be used for role-based rendering
    = useAuthContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isSignedIn && !isOnboarded) {
      // OnboardingFlow logic seems to handle this well if it's a modal
    }
  }, [isSignedIn, isOnboarded, isLoading, navigate, userRole]);

  return (
    <>
      {/* VolunteerSetup will run its effects based on AuthContext values */}
      {/* It doesn't render anything, so it can be placed high up */}
      <VolunteerSetup /> {/* <= ADDED HERE */}

      <Navbar />
      <OnboardingFlow onComplete={() => console.log("Onboarding completed/closed.")} />

      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Protected Routes managed by ProtectedRoute component */}
        <Route element={<ProtectedRoute />}>
          {/* Common Protected Routes */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/track" element={<ViewReportsMapPage />} />

          {/* Citizen Specific Routes (Example) */}
          {/* Assuming userRole from AuthContext is 'citizen' or 'volunteer' */}
          {/* You might want finer-grained protected routes based on role */}
          <Route path="/citizen/sos-trigger" element={<TriggerSOSButton />} />
          <Route path="/sos" element={<CreateReportPage />} />


          {/* Volunteer Specific Routes */}
          <Route path="/volunteer/sos-alerts" element=<VolunteerSOSAlertsPage /> />
          <Route path="/volunteer/sos-alerts/:alertId" element={<VolunteerSOSAlertsPage />} />

          {/* Admin Specific Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="/disasterPrepare" element={<DisasterPreparednessApp />} />

        {/* Fallback for any other route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider now wraps everything directly */}
        <AlertProvider>
          <IncidentProvider>
            <ReportProvider>
              <ClerkLoaded> {/* ClerkLoaded should be inside AuthProvider if AuthProvider depends on Clerk state */}
                <AppContent />
              </ClerkLoaded>
            </ReportProvider>
          </IncidentProvider>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;