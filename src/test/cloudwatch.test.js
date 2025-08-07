import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  initializeRUM, 
  trackEvent, 
  trackPageView, 
  trackButtonClick, 
  trackUserActivity,
  trackError,
  trackPerformance
} from '../lib/cloudwatch';

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

global.console = mockConsole;

describe('CloudWatch Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset global RUM client
    global.rumClient = null;
  });

  describe('initializeRUM', () => {
    it('should initialize RUM client with correct configuration', () => {
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };

      initializeRUM(config);
      
      expect(mockConsole.log).toHaveBeenCalledWith('CloudWatch RUM initialized successfully');
    });

    it('should handle initialization errors gracefully', () => {
      // Mock AwsRum to throw an error
      const originalAwsRum = global.AwsRum;
      global.AwsRum = class {
        constructor() {
          throw new Error('Initialization failed');
        }
      };

      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };

      initializeRUM(config);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Failed to initialize CloudWatch RUM:', 
        expect.any(Error)
      );

      // Restore original
      global.AwsRum = originalAwsRum;
    });
  });

  describe('trackEvent', () => {
    it('should track events when RUM client is initialized', () => {
      // Initialize RUM first
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };
      initializeRUM(config);

      const eventType = 'test_event';
      const eventData = { key: 'value' };

      trackEvent(eventType, eventData);

      expect(mockConsole.log).toHaveBeenCalledWith(
        `Event tracked: ${eventType}`, 
        eventData
      );
    });

    it('should warn when RUM client is not initialized', () => {
      const eventType = 'test_event';
      const eventData = { key: 'value' };

      trackEvent(eventType, eventData);

      expect(mockConsole.warn).toHaveBeenCalledWith(
        'RUM client not initialized. Event not tracked:', 
        eventType, 
        eventData
      );
    });
  });

  describe('trackButtonClick', () => {
    it('should track button clicks with correct data structure', () => {
      // Initialize RUM first
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };
      initializeRUM(config);

      const buttonId = 'test-button';
      const buttonText = 'Click Me';
      const additionalData = { category: 'test' };

      trackButtonClick(buttonId, buttonText, additionalData);

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Event tracked: button_click',
        expect.objectContaining({
          buttonId,
          buttonText,
          category: 'test',
          timestamp: expect.any(String),
          url: expect.any(String),
          userAgent: expect.any(String)
        })
      );
    });
  });

  describe('trackUserActivity', () => {
    it('should track user activity with session information', () => {
      // Initialize RUM first
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };
      initializeRUM(config);

      const activityType = 'session_start';
      const activityData = { source: 'test' };

      trackUserActivity(activityType, activityData);

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Event tracked: user_activity',
        expect.objectContaining({
          activityType,
          source: 'test',
          timestamp: expect.any(String),
          url: expect.any(String),
          sessionId: expect.any(String)
        })
      );
    });
  });

  describe('trackError', () => {
    it('should track errors with stack trace information', () => {
      // Initialize RUM first
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };
      initializeRUM(config);

      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      trackError(error, context);

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Event tracked: error',
        expect.objectContaining({
          message: 'Test error',
          name: 'Error',
          stack: expect.any(String),
          component: 'TestComponent',
          timestamp: expect.any(String),
          url: expect.any(String)
        })
      );

      expect(mockConsole.error).toHaveBeenCalledWith(
        'Tracked error:',
        expect.any(Object)
      );
    });
  });

  describe('trackPerformance', () => {
    it('should track performance metrics with correct format', () => {
      // Initialize RUM first
      const config = {
        applicationId: 'test-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1',
        identityPoolId: 'test-pool-id',
        endpoint: 'https://test-endpoint.com'
      };
      initializeRUM(config);

      const metricName = 'page_load_time';
      const value = 1500;
      const unit = 'ms';

      trackPerformance(metricName, value, unit);

      expect(mockConsole.log).toHaveBeenCalledWith(
        'Event tracked: performance',
        expect.objectContaining({
          metricName,
          value,
          unit,
          timestamp: expect.any(String),
          url: expect.any(String)
        })
      );
    });
  });
});

