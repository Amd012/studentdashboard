/**
 * Application Routes
 * Defines all routes with proper authentication guards
 * Supports lazy loading for optimized performance
 * Security: Unknown routes return 404, no redirect loops
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';

// Lazy load pages for code splitting
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Students = lazy(() => import('../pages/Students'));
const Attendance = lazy(() => import('../pages/Attendance'));
const Leaves = lazy(() => import('../pages/Leaves'));
const Announcements = lazy(() => import('../pages/Announcements'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * Loading spinner for lazy-loaded routes
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>
  );
}

/**
 * Unauthorized page - 403 Forbidden
 */
function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">You don't have permission to access this page.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Your role does not have the required privileges.</p>
        <a href="/dashboard" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes with layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* 404 - Must be last. Unknown routes return 404, NOT redirected to dashboard */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}