import React, { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Axios from "../services/Axios";

// ProtectedRoute component to protect routes that require authentication
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        await Axios.get("user-info/"); // API to verify user session
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("token"); // Clear invalid token
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <p>Loading...</p>;

  // If user is authenticated, render the children components
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
