import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import FullScreenSpinner from '../FullScreenSpinner/FullScreenSpinner';

const PrivateRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();
  if (isLoading) {
    return <FullScreenSpinner />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
