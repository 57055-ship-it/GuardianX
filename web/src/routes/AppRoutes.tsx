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

// Super Admin Imports
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminParentsPage } from '../pages/admin/AdminParentsPage';
import { AdminParentDetailPage } from '../pages/admin/AdminParentDetailPage';
import { AdminChildrenPage } from '../pages/admin/AdminChildrenPage';
import { AdminFamiliesPage } from '../pages/admin/AdminFamiliesPage';
import { AdminPlansPage } from '../pages/admin/AdminPlansPage';
import { AdminSubscriptionsPage } from '../pages/admin/AdminSubscriptionsPage';
import { AdminUsagePage } from '../pages/admin/AdminUsagePage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={
          <AdminAuthProvider>
            <AdminLoginPage />
          </AdminAuthProvider>
        }
      />

      {/* Super Admin Control Plane Routes */}
      <Route
        path="/admin"
        element={
          <AdminAuthProvider>
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          </AdminAuthProvider>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="parents" element={<AdminParentsPage />} />
        <Route path="parents/:id" element={<AdminParentDetailPage />} />
        <Route path="children" element={<AdminChildrenPage />} />
        <Route path="families" element={<AdminFamiliesPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="usage" element={<AdminUsagePage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

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
