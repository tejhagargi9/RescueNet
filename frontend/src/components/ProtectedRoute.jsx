import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoading } = useAuthContext();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      alert('Please sign up or log in to continue.');
      setShowAlert(true);
    }
  }, [isLoading, isSignedIn]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isSignedIn && showAlert) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
