/**
 * Protected Route Component
 * Wraps routes that require authentication
 * Optionally restricts access based on user roles
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && userData && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Role-based guard component
 * Only renders children if user has the required role
 */
export function RoleGuard({ children, allowedRoles = [] }) {
  const { userData } = useAuth();

  if (!userData) return null;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return null;
  }

  return children;
}

export default ProtectedRoute;