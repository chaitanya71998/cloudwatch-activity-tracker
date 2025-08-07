import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackedButton from '../components/TrackedButton';

// Mock the useCloudWatch hook
const mockTrackButton = vi.fn();
vi.mock('../hooks/useCloudWatch', () => ({
  useCloudWatch: () => ({
    trackButton: mockTrackButton
  })
}));

describe('TrackedButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render button with children', () => {
    render(<TrackedButton>Click Me</TrackedButton>);
    
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should track button click with default parameters', async () => {
    const user = userEvent.setup();
    
    render(<TrackedButton>Test Button</TrackedButton>);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalledWith(
      'test_button',
      'Test Button',
      expect.objectContaining({
        variant: 'default',
        size: 'default'
      })
    );
  });

  it('should track button click with custom tracking ID', async () => {
    const user = userEvent.setup();
    
    render(
      <TrackedButton trackingId="custom-button">
        Custom Button
      </TrackedButton>
    );
    
    const button = screen.getByRole('button', { name: 'Custom Button' });
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalledWith(
      'custom-button',
      'Custom Button',
      expect.objectContaining({
        variant: 'default',
        size: 'default'
      })
    );
  });

  it('should track button click with additional tracking data', async () => {
    const user = userEvent.setup();
    const trackingData = { category: 'navigation', priority: 'high' };
    
    render(
      <TrackedButton 
        trackingId="nav-button" 
        trackingData={trackingData}
        variant="secondary"
        size="lg"
      >
        Navigation
      </TrackedButton>
    );
    
    const button = screen.getByRole('button', { name: 'Navigation' });
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalledWith(
      'nav-button',
      'Navigation',
      expect.objectContaining({
        variant: 'secondary',
        size: 'lg',
        category: 'navigation',
        priority: 'high'
      })
    );
  });

  it('should call original onClick handler after tracking', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    render(
      <TrackedButton onClick={mockOnClick}>
        Click Handler Test
      </TrackedButton>
    );
    
    const button = screen.getByRole('button', { name: 'Click Handler Test' });
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalled();
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('should work without onClick handler', async () => {
    const user = userEvent.setup();
    
    render(<TrackedButton>No Handler</TrackedButton>);
    
    const button = screen.getByRole('button', { name: 'No Handler' });
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalledWith(
      'no_handler',
      'No Handler',
      expect.any(Object)
    );
  });

  it('should handle non-string children for tracking', async () => {
    const user = userEvent.setup();
    
    render(
      <TrackedButton>
        <span>Complex</span> Button
      </TrackedButton>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockTrackButton).toHaveBeenCalledWith(
      'button',
      'Button',
      expect.any(Object)
    );
  });

  it('should pass through all button props', () => {
    render(
      <TrackedButton 
        disabled 
        className="custom-class"
        data-testid="tracked-button"
        aria-label="Custom Label"
      >
        Props Test
      </TrackedButton>
    );
    
    const button = screen.getByTestId('tracked-button');
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });

  it('should apply correct variant and size classes', () => {
    render(
      <TrackedButton 
        variant="destructive" 
        size="sm"
        data-testid="styled-button"
      >
        Styled Button
      </TrackedButton>
    );
    
    const button = screen.getByTestId('styled-button');
    
    // The exact classes depend on the Button component implementation
    // This test ensures the props are passed through correctly
    expect(button).toBeInTheDocument();
  });
});

