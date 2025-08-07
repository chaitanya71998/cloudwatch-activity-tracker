import { Button } from '@/components/ui/button.jsx';
import { useCloudWatch } from '../hooks/useCloudWatch';

const TrackedButton = ({ 
  children, 
  onClick, 
  trackingId, 
  trackingData = {}, 
  variant = "default",
  size = "default",
  className = "",
  ...props 
}) => {
  const { trackButton } = useCloudWatch();

  const handleClick = (event) => {
    // Track the button click
    const buttonText = typeof children === 'string' ? children : 'Button';
    trackButton(trackingId || buttonText.toLowerCase().replace(/\s+/g, '_'), buttonText, {
      variant,
      size,
      ...trackingData
    });

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TrackedButton;

