/**
 * Layout Component
 * Wraps all authenticated pages with Sidebar, Header, BottomNav, and main content area
 */

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/students': 'Student Management',
  '/attendance': 'Attendance',
  '/leaves': 'Leave Management',
  '/announcements': 'Announcements',
};

export default function Layout() {
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar (always visible) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
}