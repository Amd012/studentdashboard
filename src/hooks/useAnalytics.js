/**
 * Google Analytics Hook
 * Tracks page views, route changes, and user interactions
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX';

/**
 * Track page view
 */
export function trackPageView(path, title) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track custom event
 */
export function trackEvent(action, category, label, value) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Hook that automatically tracks page views on route change
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);
}

/**
 * Track form submissions
 */
export function trackFormSubmit(formName) {
  trackEvent('form_submit', 'engagement', formName);
}

/**
 * Track errors
 */
export function trackError(errorType, errorMessage) {
  trackEvent('error', 'exception', `${errorType}: ${errorMessage}`);
}

/**
 * Track user login/logout
 */
export function trackAuth(action) {
  trackEvent('authentication', 'engagement', action);
}

export default usePageTracking;