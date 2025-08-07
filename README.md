# CloudWatch Activity Tracker

A React application demonstrating comprehensive AWS CloudWatch integration for tracking user activity, including button clicks, page visits, and user engagement metrics.

## Features

- **Real-time Activity Tracking**: Track button clicks, page views, and user interactions
- **AWS CloudWatch RUM Integration**: Automatic performance monitoring and error tracking
- **Custom Event Tracking**: Send custom business events to CloudWatch
- **Session Analytics**: Monitor session duration, engagement levels, and user behavior
- **Performance Metrics**: Track page load times and application performance
- **Error Monitoring**: Automatic JavaScript error tracking and reporting

## Architecture

This application uses:
- **AWS CloudWatch RUM**: For automatic client-side monitoring and real user monitoring
- **AWS CloudWatch Logs**: For custom event logging (optional)
- **React Hooks**: Custom `useCloudWatch` hook for easy tracking integration
- **Tracked Components**: Reusable components with built-in tracking capabilities

## Prerequisites

Before running this application, you need:

1. **AWS Account** with appropriate permissions
2. **AWS CloudWatch RUM Application** set up in your AWS Console
3. **Amazon Cognito Identity Pool** for authentication
4. **Node.js** (version 18 or higher)
5. **pnpm** package manager

## AWS Setup

### 1. Create CloudWatch RUM Application

1. Go to AWS CloudWatch Console
2. Navigate to "Application monitoring" > "Real User Monitoring"
3. Click "Create app monitor"
4. Configure your application:
   - **Name**: Your application name
   - **Application domain**: Your domain (use `localhost:5173` for development)
   - **Data retention**: Choose your preferred retention period
5. Note down the **Application ID** and **Identity Pool ID**

### 2. Configure Cognito Identity Pool

The RUM application automatically creates a Cognito Identity Pool. Ensure it has the necessary permissions to send data to CloudWatch.

### 3. Set up CloudWatch Logs (Optional)

If you want to use custom logging:
1. Create a Log Group in CloudWatch Logs
2. Create a Log Stream within the Log Group
3. Configure IAM permissions for your Cognito Identity Pool

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cloudwatch-tracker-app
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and replace the placeholder values with your actual AWS configuration:
   ```env
   VITE_CLOUDWATCH_APPLICATION_ID=your-actual-rum-application-id
   VITE_CLOUDWATCH_APPLICATION_VERSION=1.0.0
   VITE_CLOUDWATCH_REGION=us-east-1
   VITE_CLOUDWATCH_IDENTITY_POOL_ID=us-east-1:your-actual-identity-pool-id
   VITE_CLOUDWATCH_ENDPOINT=https://dataplane.rum.us-east-1.amazonaws.com
   ```

4. **Start the development server**:
   ```bash
   pnpm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:5173`

## Usage

### Basic Tracking

The application automatically tracks:
- Page loads and navigation
- JavaScript errors
- Performance metrics
- Session data

### Custom Event Tracking

Use the `useCloudWatch` hook in your components:

```jsx
import { useCloudWatch } from './hooks/useCloudWatch';

function MyComponent() {
  const { trackButton, trackCustomEvent } = useCloudWatch();

  const handleClick = () => {
    trackButton('my-button', 'Click Me', { category: 'user-action' });
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

### Tracked Components

Use the pre-built `TrackedButton` component:

```jsx
import TrackedButton from './components/TrackedButton';

<TrackedButton
  trackingId="signup-button"
  trackingData={{ campaign: 'homepage', priority: 'high' }}
  onClick={handleSignup}
>
  Sign Up
</TrackedButton>
```

## Available Tracking Methods

- `trackPage(pageName, additionalData)` - Track page views
- `trackButton(buttonId, buttonText, additionalData)` - Track button clicks
- `trackCustomEvent(eventType, eventData)` - Track custom events
- `trackActivity(activityType, activityData)` - Track user activities
- `trackMetric(metricName, value, unit)` - Track performance metrics
- `trackFormSubmission(formId, formData)` - Track form submissions
- `trackSearch(query, results)` - Track search actions
- `trackScrollDepth(depth)` - Track scroll behavior

## Viewing Data in AWS

### CloudWatch RUM Dashboard

1. Go to AWS CloudWatch Console
2. Navigate to "Application monitoring" > "Real User Monitoring"
3. Click on your application
4. View dashboards for:
   - Page load performance
   - JavaScript errors
   - User sessions
   - Custom events

### CloudWatch Logs

1. Go to AWS CloudWatch Console
2. Navigate to "Logs" > "Log groups"
3. Find your log group
4. View log streams and events

### CloudWatch Metrics

Custom metrics appear in the CloudWatch Metrics console under the "AWS/RUM" namespace.

## Development

### Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── ActivityDashboard.jsx  # Main dashboard component
│   └── TrackedButton.jsx     # Button with tracking
├── hooks/
│   └── useCloudWatch.js      # CloudWatch integration hook
├── lib/
│   └── cloudwatch.js        # CloudWatch utility functions
├── App.jsx                   # Main application component
└── main.jsx                  # Application entry point
```

### Adding New Tracking

1. **Custom Events**: Use `trackCustomEvent()` for business-specific events
2. **Component Tracking**: Wrap components with tracking logic
3. **Performance Metrics**: Use `trackMetric()` for custom performance data
4. **Error Tracking**: Errors are automatically tracked, but you can add context

### Testing

Run the test suite:
```bash
pnpm run test
```

## Deployment

### Build for Production

```bash
pnpm run build
```

### Deploy to AWS

The application can be deployed to:
- **AWS S3 + CloudFront**: For static hosting
- **AWS Amplify**: For full-stack deployment
- **Vercel/Netlify**: For quick deployment

Make sure to:
1. Update the RUM application domain in AWS Console
2. Configure CORS settings if needed
3. Set production environment variables

## Security Considerations

- **API Keys**: Never expose AWS credentials in client-side code
- **Cognito Identity Pool**: Use unauthenticated access with minimal permissions
- **Data Privacy**: Ensure compliance with privacy regulations
- **Rate Limiting**: CloudWatch RUM has built-in rate limiting

## Troubleshooting

### Common Issues

1. **RUM not initializing**: Check Application ID and Identity Pool ID
2. **Events not appearing**: Verify AWS region and endpoint configuration
3. **CORS errors**: Ensure domain is configured in RUM application settings
4. **Permission errors**: Check Cognito Identity Pool IAM roles

### Debug Mode

Enable debug logging by adding to your environment:
```env
VITE_DEBUG_CLOUDWATCH=true
```

## Cost Optimization

- **Sampling**: Adjust session sample rate in RUM configuration
- **Event Filtering**: Only track essential events
- **Data Retention**: Set appropriate retention periods
- **Log Groups**: Use log retention policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the AWS CloudWatch RUM documentation
- Review the troubleshooting section
- Open an issue in this repository

