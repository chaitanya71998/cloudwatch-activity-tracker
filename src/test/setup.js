import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock AWS RUM to avoid initialization errors in tests
global.AwsRum = class MockAwsRum {
  constructor() {
    this.initialized = true;
  }
  
  recordEvent(eventType, eventData) {
    console.log('Mock RUM event:', eventType, eventData);
  }
  
  recordPageView(pageName) {
    console.log('Mock RUM page view:', pageName);
  }
};

// Mock AWS SDK clients
vi.mock('@aws-sdk/client-cloudwatch-logs', () => ({
  CloudWatchLogsClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({})
  })),
  PutLogEventsCommand: vi.fn(),
  CreateLogStreamCommand: vi.fn()
}));

vi.mock('aws-rum-web', () => ({
  AwsRum: global.AwsRum
}));

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    timing: {
      loadEventEnd: 1000,
      navigationStart: 0
    },
    navigation: {}
  },
  writable: true
});

// Mock screen object
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080
  },
  writable: true
});

