import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { FamilyManagementPage } from '../pages/FamilyManagementPage';
import { ChildDetailPage } from '../pages/ChildDetailPage';
import { LiveLocationPage } from '../pages/LiveLocationPage';
import { SafeZonesPage } from '../pages/SafeZonesPage';
import { SOSAlertsPage } from '../pages/SOSAlertsPage';
import { DigitalWellbeingPage } from '../pages/DigitalWellbeingPage';
import { ReportsPage } from '../pages/ReportsPage';
import { FamilyRoutinePage } from '../pages/FamilyRoutinePage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Parent Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/family" element={<FamilyManagementPage />} />
        <Route path="/children/:id" element={<ChildDetailPage />} />
        <Route path="/location" element={<LiveLocationPage />} />
        <Route path="/safe-zones" element={<SafeZonesPage />} />
        <Route path="/alerts" element={<SOSAlertsPage />} />
        <Route path="/usage" element={<DigitalWellbeingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/routines" element={<FamilyRoutinePage />} />
        <Route path="/settings" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

