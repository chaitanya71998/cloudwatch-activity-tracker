import { useEffect, useCallback } from 'react';
import { 
  initializeRUM, 
  trackEvent, 
  trackPageView, 
  trackButtonClick, 
  trackUserActivity,
  trackError,
  trackPerformance
} from '../lib/cloudwatch';

// Configuration - In production, these should come from environment variables
const CLOUDWATCH_CONFIG = {
  applicationId: 'demo-app-id', // Replace with actual RUM application ID
  applicationVersion: '1.0.0',
  applicationRegion: 'us-east-1', // Replace with your AWS region
  identityPoolId: 'us-east-1:demo-identity-pool-id', // Replace with actual Cognito Identity Pool ID
  endpoint: 'https://dataplane.rum.us-east-1.amazonaws.com' // Replace with your region's endpoint
};

export const useCloudWatch = () => {
  // Initialize CloudWatch RUM on hook mount
  useEffect(() => {
    initializeRUM(CLOUDWATCH_CONFIG);
    
    // Track initial page load
    trackPageView(window.location.pathname);
    
    // Track session start
    trackUserActivity('session_start', {
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });

    // Set up global error handler
    const handleError = (event) => {
      trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event) => {
      trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Track page visibility changes
    const handleVisibilityChange = () => {
      trackUserActivity('visibility_change', {
        hidden: document.hidden
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track page views (for SPA navigation)
  const trackPage = useCallback((pageName, additionalData = {}) => {
    trackPageView(pageName, additionalData);
  }, []);

  // Track button clicks with enhanced data
  const trackButton = useCallback((buttonId, buttonText, additionalData = {}) => {
    trackButtonClick(buttonId, buttonText, {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      ...additionalData
    });
  }, []);

  // Track custom events
  const trackCustomEvent = useCallback((eventType, eventData = {}) => {
    trackEvent(eventType, eventData);
  }, []);

  // Track user interactions
  const trackActivity = useCallback((activityType, activityData = {}) => {
    trackUserActivity(activityType, activityData);
  }, []);

  // Track performance metrics
  const trackMetric = useCallback((metricName, value, unit = 'ms') => {
    trackPerformance(metricName, value, unit);
  }, []);

  // Track form submissions
  const trackFormSubmission = useCallback((formId, formData = {}) => {
    trackEvent('form_submission', {
      formId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...formData
    });
  }, []);

  // Track search actions
  const trackSearch = useCallback((query, results = null) => {
    trackEvent('search', {
      query,
      results: results ? results.length : null,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }, []);

  // Track scroll depth
  const trackScrollDepth = useCallback((depth) => {
    trackEvent('scroll_depth', {
      depth,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }, []);

  return {
    trackPage,
    trackButton,
    trackCustomEvent,
    trackActivity,
    trackMetric,
    trackFormSubmission,
    trackSearch,
    trackScrollDepth
  };
};

