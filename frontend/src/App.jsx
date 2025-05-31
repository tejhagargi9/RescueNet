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

// Import ChatbotProvider
import { ChatbotProvider } from './context/ChatBotContext'; // Adjust path if necessary

// Component to handle redirection after sign in/out and onboarding check
function AppContent() {
  const { isSignedIn, isOnboarded, isLoading, userRole } = useAuthContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isSignedIn && !isOnboarded) {
      // User is signed in but not onboarded, OnboardingFlow should handle visibility
    }
  }, [isSignedIn, isOnboarded, isLoading, navigate, userRole]);

  return (
    <>
      <Navbar />
      <OnboardingFlow onComplete={() => console.log("Onboarding completed/closed.")} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/track" element={<ViewReportsMapPage />} />
          <Route path="/sos" element={<CreateReportPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="/disasterPrepare" element={<DisasterPreparednessApp />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
      {/* 
        Here you might have a component that renders the Chatbot UI itself, 
        perhaps toggled by a button. This component would use useChatbotContext().
        e.g., <FloatingChatbotButton /> which then renders <Chatbot />
      */}
    </>
  );
}


function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Place ChatbotProvider here */}
        <ChatbotProvider> 
          <AlertProvider>
            <IncidentProvider>
              <ReportProvider>
                <ClerkLoaded>
                  <AppContent />
                </ClerkLoaded>
              </ReportProvider>
            </IncidentProvider>
          </AlertProvider>
        </ChatbotProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;