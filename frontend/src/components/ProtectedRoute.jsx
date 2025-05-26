import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuthContext();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />; // Or to a specific sign-in page
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;