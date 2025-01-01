import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import MapView from './components/MapView';
import ProtectedRoute from './components/ProtectedRoute';
import EventDetail from './components/EventDetail';
import SavedEvents from './components/SavedEvents';
import FriendsHub from './components/FriendsHub';

const App: React.FC = () => {
  return (
    // Using the BrowserRouter component to wrap the Routes component
    <Router>
      <Routes>
        {/* The root route redirects to the login page */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* The protected routes are wrapped in the ProtectedRoute component */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-events"
          element={
            <ProtectedRoute>
              <SavedEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends-hub"
          element={
            <ProtectedRoute>
              <FriendsHub />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
