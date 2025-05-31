import React from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, ClerkLoaded } from "@clerk/clerk-react";

import Navbar from './components/Navbar'; // Your RescueNetNavbar
import OnboardingFlow from './components/OnboardingFlow'; // Your Flow component
import HomePage from './pages/HomePage'; // Your Home component
import AccountPage from './pages/AccountPage';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Optional
import DisasterPreparednessApp from './pages/DisastersInfoPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AlertProvider } from './context/AlertContext';
import { IncidentProvider } from './context/IncidentContext';
import CommunitiesPage from './pages/CommunitiesPage';
import { ReportProvider } from './context/ReportContext';
import ViewReportsMapPage from './pages/ViewReportsMapPage';
import CreateReportPage from './pages/CreateReportPage';
import NotificationToaster from './components/map/NotificationToaster';
import { NotificationProvider } from './context/NotificationContext';
import { DisasterDataProvider } from './context/DisasterDataContext';

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
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/track" element={<ViewReportsMapPage />} />
          <Route path="/sos" element={<CreateReportPage />} />
          <Route path="/account" element={<AccountPage />} />
          {/* Add other protected routes here */}
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
      <AuthProvider>
        <AlertProvider>
          <IncidentProvider>
            <ReportProvider>
              <NotificationProvider>
                <DisasterDataProvider>
                  <ClerkLoaded>
                    <NotificationToaster />
                    <AppContent />
                  </ClerkLoaded>
                </DisasterDataProvider>
              </NotificationProvider>
            </ReportProvider>
          </IncidentProvider>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;