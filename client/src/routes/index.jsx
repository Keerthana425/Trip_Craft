import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';

// Pages
import Landing from '../pages/Landing';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import CreateTrip from '../pages/CreateTrip';
import TripDetails from '../pages/TripDetails';
import ExpenseTracker from '../pages/ExpenseTracker';
import AIAssistant from '../pages/AIAssistant';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/assistant" element={<AIAssistant />} />
      </Route>

      {/* Fallback Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
