import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import { AwsRum } from 'aws-rum-web';

// CloudWatch RUM configuration
let rumClient = null;

export const initializeRUM = (config) => {
  try {
    rumClient = new AwsRum(
      config.applicationId,
      config.applicationVersion,
      config.applicationRegion,
      {
        sessionSampleRate: 1,
        identityPoolId: config.identityPoolId,
        endpoint: config.endpoint,
        telemetries: ['performance', 'errors', 'http'],
        allowCookies: true,
        enableXRay: false
      }
    );
    console.log('CloudWatch RUM initialized successfully');
  } catch (error) {
    console.error('Failed to initialize CloudWatch RUM:', error);
  }
};

// Track custom events (button clicks, user actions)
export const trackEvent = (eventType, eventData) => {
  if (rumClient) {
    try {
      rumClient.recordEvent(eventType, eventData);
      console.log(`Event tracked: ${eventType}`, eventData);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  } else {
    console.warn('RUM client not initialized. Event not tracked:', eventType, eventData);
  }
};

// Track page views
export const trackPageView = (pageName, additionalData = {}) => {
  if (rumClient) {
    try {
      rumClient.recordPageView(pageName);
      // Also record as custom event for additional context
      trackEvent('page_view', {
        page: pageName,
        timestamp: new Date().toISOString(),
        ...additionalData
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }
};

// Track button clicks specifically
export const trackButtonClick = (buttonId, buttonText, additionalData = {}) => {
  trackEvent('button_click', {
    buttonId,
    buttonText,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...additionalData
  });
};

// Track user activity (session start, engagement, etc.)
export const trackUserActivity = (activityType, activityData = {}) => {
  trackEvent('user_activity', {
    activityType,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    sessionId: generateSessionId(),
    ...activityData
  });
};

// Generate a simple session ID (in production, you might want a more robust solution)
const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// CloudWatch Logs configuration (optional, for custom logging)
let logsClient = null;

export const initializeCloudWatchLogs = (config) => {
  try {
    logsClient = new CloudWatchLogsClient({
      region: config.region,
      credentials: config.credentials
    });
    console.log('CloudWatch Logs client initialized');
  } catch (error) {
    console.error('Failed to initialize CloudWatch Logs:', error);
  }
};

// Send custom logs to CloudWatch Logs
export const sendCustomLog = async (logGroupName, logStreamName, message, level = 'INFO') => {
  if (!logsClient) {
    console.warn('CloudWatch Logs client not initialized');
    return;
  }

  try {
    const logEvent = {
      message: JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }),
      timestamp: Date.now()
    };

    const command = new PutLogEventsCommand({
      logGroupName,
      logStreamName,
      logEvents: [logEvent]
    });

    await logsClient.send(command);
    console.log('Custom log sent to CloudWatch');
  } catch (error) {
    console.error('Failed to send custom log:', error);
  }
};

// Error tracking
export const trackError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    ...context
  };

  trackEvent('error', errorData);
  
  // Also log to console for development
  console.error('Tracked error:', errorData);
};

// Performance tracking
export const trackPerformance = (metricName, value, unit = 'ms') => {
  trackEvent('performance', {
    metricName,
    value,
    unit,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
};

