import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityDashboard from '../components/ActivityDashboard';

// Mock the useCloudWatch hook
const mockTrackCustomEvent = vi.fn();
const mockTrackActivity = vi.fn();
const mockTrackMetric = vi.fn();

vi.mock('../hooks/useCloudWatch', () => ({
  useCloudWatch: () => ({
    trackCustomEvent: mockTrackCustomEvent,
    trackActivity: mockTrackActivity,
    trackMetric: mockTrackMetric
  })
}));

// Mock TrackedButton component
vi.mock('../components/TrackedButton', () => ({
  default: ({ children, onClick, trackingId, trackingData, ...props }) => (
    <button 
      onClick={onClick} 
      data-tracking-id={trackingId}
      data-tracking-data={JSON.stringify(trackingData)}
      {...props}
    >
      {children}
    </button>
  )
}));

describe('ActivityDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock Date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the dashboard title and description', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText('CloudWatch Activity Tracker')).toBeInTheDocument();
    expect(screen.getByText(/Demo application showcasing AWS CloudWatch integration/)).toBeInTheDocument();
  });

  it('should display session statistics cards', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText('Session Time')).toBeInTheDocument();
    expect(screen.getByText('Button Clicks')).toBeInTheDocument();
    expect(screen.getByText('Page Views')).toBeInTheDocument();
    expect(screen.getByText('Tracking Status')).toBeInTheDocument();
  });

  it('should show initial session time as 0:00', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should update session time every second', async () => {
    render(<ActivityDashboard />);
    
    // Initially should show 0:00
    expect(screen.getByText('0:00')).toBeInTheDocument();
    
    // Advance time by 5 seconds
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByText('0:05')).toBeInTheDocument();
    });
  });

  it('should show initial click count as 0', () => {
    render(<ActivityDashboard />);
    
    // Find the card with "Button Clicks" and check its value
    const clicksCard = screen.getByText('Button Clicks').closest('div');
    expect(clicksCard).toHaveTextContent('0');
  });

  it('should increment click count when demo buttons are clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ActivityDashboard />);
    
    const primaryButton = screen.getByText('Primary Action');
    await user.click(primaryButton);
    
    // Check if click count increased
    const clicksCard = screen.getByText('Button Clicks').closest('div');
    expect(clicksCard).toHaveTextContent('1');
  });

  it('should render all demo action buttons', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText('Primary Action')).toBeInTheDocument();
    expect(screen.getByText('Secondary Action')).toBeInTheDocument();
    expect(screen.getByText('Tertiary Action')).toBeInTheDocument();
    expect(screen.getByText('Track High Engagement')).toBeInTheDocument();
    expect(screen.getByText('Send Custom Event')).toBeInTheDocument();
  });

  it('should track custom events when demo buttons are clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ActivityDashboard />);
    
    const primaryButton = screen.getByText('Primary Action');
    await user.click(primaryButton);
    
    expect(mockTrackCustomEvent).toHaveBeenCalledWith(
      'demo_action',
      expect.objectContaining({
        actionType: 'primary',
        sessionDuration: expect.any(Number),
        totalClicks: 1
      })
    );
  });

  it('should track high engagement when engagement button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ActivityDashboard />);
    
    const engagementButton = screen.getByText('Track High Engagement');
    await user.click(engagementButton);
    
    expect(mockTrackActivity).toHaveBeenCalledWith(
      'high_engagement',
      expect.objectContaining({
        timeSpent: expect.any(Number),
        clickCount: expect.any(Number),
        engagementLevel: 'high'
      })
    );
  });

  it('should send custom event when custom event button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ActivityDashboard />);
    
    const customEventButton = screen.getByText('Send Custom Event');
    await user.click(customEventButton);
    
    expect(mockTrackCustomEvent).toHaveBeenCalledWith(
      'custom_demo_event',
      expect.objectContaining({
        source: 'dashboard',
        userInitiated: true
      })
    );
  });

  it('should display tracking information sections', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText("What's Being Tracked?")).toBeInTheDocument();
    expect(screen.getByText('Automatic Tracking:')).toBeInTheDocument();
    expect(screen.getByText('Custom Events:')).toBeInTheDocument();
  });

  it('should show tracking status as Active', () => {
    render(<ActivityDashboard />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('CloudWatch RUM')).toBeInTheDocument();
  });

  it('should format time correctly for minutes and seconds', async () => {
    render(<ActivityDashboard />);
    
    // Advance time by 1 minute and 30 seconds
    vi.advanceTimersByTime(90000);
    
    await waitFor(() => {
      expect(screen.getByText('1:30')).toBeInTheDocument();
    });
  });

  it('should show page views as 1 initially', () => {
    render(<ActivityDashboard />);
    
    const pageViewsCard = screen.getByText('Page Views').closest('div');
    expect(pageViewsCard).toHaveTextContent('1');
  });

  it('should track performance metrics on mount', () => {
    render(<ActivityDashboard />);
    
    // Performance tracking should be called during component mount
    expect(mockTrackMetric).toHaveBeenCalledWith(
      'page_load_time',
      expect.any(Number),
      'ms'
    );
  });
});

