import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCloudWatch } from '../hooks/useCloudWatch';

// Mock the cloudwatch utilities
vi.mock('../lib/cloudwatch', () => ({
  initializeRUM: vi.fn(),
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  trackButtonClick: vi.fn(),
  trackUserActivity: vi.fn(),
  trackError: vi.fn(),
  trackPerformance: vi.fn()
}));

describe('useCloudWatch Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window properties
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/test',
        href: 'http://localhost:3000/test'
      },
      writable: true
    });

    Object.defineProperty(window, 'innerWidth', {
      value: 1920,
      writable: true
    });

    Object.defineProperty(window, 'innerHeight', {
      value: 1080,
      writable: true
    });

    Object.defineProperty(document, 'referrer', {
      value: 'http://example.com',
      writable: true
    });

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Test Browser)',
      writable: true
    });
  });

  it('should initialize CloudWatch RUM on mount', () => {
    const { initializeRUM, trackPageView, trackUserActivity } = require('../lib/cloudwatch');
    
    renderHook(() => useCloudWatch());

    expect(initializeRUM).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: 'demo-app-id',
        applicationVersion: '1.0.0',
        applicationRegion: 'us-east-1'
      })
    );

    expect(trackPageView).toHaveBeenCalledWith('/test');
    expect(trackUserActivity).toHaveBeenCalledWith('session_start', expect.any(Object));
  });

  it('should provide tracking functions', () => {
    const { result } = renderHook(() => useCloudWatch());

    expect(result.current).toHaveProperty('trackPage');
    expect(result.current).toHaveProperty('trackButton');
    expect(result.current).toHaveProperty('trackCustomEvent');
    expect(result.current).toHaveProperty('trackActivity');
    expect(result.current).toHaveProperty('trackMetric');
    expect(result.current).toHaveProperty('trackFormSubmission');
    expect(result.current).toHaveProperty('trackSearch');
    expect(result.current).toHaveProperty('trackScrollDepth');
  });

  it('should track button clicks with enhanced data', () => {
    const { trackButtonClick } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackButton('test-button', 'Test Button', { category: 'test' });
    });

    expect(trackButtonClick).toHaveBeenCalledWith(
      'test-button',
      'Test Button',
      expect.objectContaining({
        category: 'test',
        viewport: '1920x1080'
      })
    );
  });

  it('should track custom events', () => {
    const { trackEvent } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackCustomEvent('custom_event', { data: 'test' });
    });

    expect(trackEvent).toHaveBeenCalledWith('custom_event', { data: 'test' });
  });

  it('should track form submissions', () => {
    const { trackEvent } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackFormSubmission('contact-form', { fields: 3 });
    });

    expect(trackEvent).toHaveBeenCalledWith(
      'form_submission',
      expect.objectContaining({
        formId: 'contact-form',
        fields: 3,
        timestamp: expect.any(String),
        url: 'http://localhost:3000/test'
      })
    );
  });

  it('should track search actions', () => {
    const { trackEvent } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackSearch('test query', [1, 2, 3]);
    });

    expect(trackEvent).toHaveBeenCalledWith(
      'search',
      expect.objectContaining({
        query: 'test query',
        results: 3,
        timestamp: expect.any(String),
        url: 'http://localhost:3000/test'
      })
    );
  });

  it('should track scroll depth', () => {
    const { trackEvent } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackScrollDepth(75);
    });

    expect(trackEvent).toHaveBeenCalledWith(
      'scroll_depth',
      expect.objectContaining({
        depth: 75,
        timestamp: expect.any(String),
        url: 'http://localhost:3000/test'
      })
    );
  });

  it('should track performance metrics', () => {
    const { trackPerformance } = require('../lib/cloudwatch');
    const { result } = renderHook(() => useCloudWatch());

    act(() => {
      result.current.trackMetric('custom_metric', 100, 'count');
    });

    expect(trackPerformance).toHaveBeenCalledWith('custom_metric', 100, 'count');
  });

  it('should set up error handlers', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const documentAddEventListenerSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => useCloudWatch());

    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(documentAddEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const documentRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useCloudWatch());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(documentRemoveEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
  });
});

