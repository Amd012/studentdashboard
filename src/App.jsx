/**
 * App Component
 * Root component with AuthProvider, BrowserRouter, and Analytics
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { usePageTracking } from './hooks/useAnalytics';
import AppRoutes from './routes/AppRoutes';

/**
 * Analytics tracker - fires on every route change
 */
function AnalyticsTracker() {
  usePageTracking();
  return null;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnalyticsTracker />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}