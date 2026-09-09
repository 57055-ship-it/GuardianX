import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
      {/* Public Login Route */}
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Protected Admin Control Plane Routes */}
      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<AdminDashboardPage />} />
        <Route path="/parents" element={<AdminParentsPage />} />
        <Route path="/parents/:id" element={<AdminParentDetailPage />} />
        <Route path="/children" element={<AdminChildrenPage />} />
        <Route path="/families" element={<AdminFamiliesPage />} />
        <Route path="/plans" element={<AdminPlansPage />} />
        <Route path="/subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="/usage" element={<AdminUsagePage />} />
        <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
