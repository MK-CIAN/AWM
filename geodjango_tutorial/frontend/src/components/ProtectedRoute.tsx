import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Axios from '../services/Axios';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        await Axios.get('user-info/'); // API to verify user session
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token'); // Clear invalid token
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
