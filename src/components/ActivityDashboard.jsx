import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import TrackedButton from './TrackedButton';
import { useCloudWatch } from '../hooks/useCloudWatch';
import { Activity, MousePointer, Eye, Clock, TrendingUp } from 'lucide-react';

const ActivityDashboard = () => {
  const { trackCustomEvent, trackActivity, trackMetric } = useCloudWatch();
  const [sessionData, setSessionData] = useState({
    startTime: new Date(),
    clickCount: 0,
    pageViews: 1,
    timeSpent: 0
  });

  // Update time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionData(prev => ({
        ...prev,
        timeSpent: Math.floor((new Date() - prev.startTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track performance metrics periodically
  useEffect(() => {
    const trackPerformanceMetrics = () => {
      if (performance && performance.navigation) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackMetric('page_load_time', loadTime, 'ms');
      }
    };

    trackPerformanceMetrics();
  }, [trackMetric]);

  const handleDemoAction = (actionType) => {
    setSessionData(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1
    }));

    trackCustomEvent('demo_action', {
      actionType,
      sessionDuration: sessionData.timeSpent,
      totalClicks: sessionData.clickCount + 1
    });
  };

  const handleEngagementAction = () => {
    trackActivity('high_engagement', {
      timeSpent: sessionData.timeSpent,
      clickCount: sessionData.clickCount,
      engagementLevel: 'high'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">CloudWatch Activity Tracker</h1>
        <p className="text-muted-foreground">
          Demo application showcasing AWS CloudWatch integration for tracking user activity
        </p>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(sessionData.timeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Started at {sessionData.startTime.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Button Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionData.clickCount}</div>
            <p className="text-xs text-muted-foreground">
              Tracked interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionData.pageViews}</div>
            <p className="text-xs text-muted-foreground">
              Current session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracking Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default" className="text-sm">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              CloudWatch RUM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Actions</CardTitle>
          <CardDescription>
            Click these buttons to generate tracked events that will be sent to AWS CloudWatch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TrackedButton
              trackingId="primary_action"
              trackingData={{ category: 'demo', priority: 'high' }}
              onClick={() => handleDemoAction('primary')}
              className="w-full"
            >
              Primary Action
            </TrackedButton>

            <TrackedButton
              trackingId="secondary_action"
              trackingData={{ category: 'demo', priority: 'medium' }}
              variant="secondary"
              onClick={() => handleDemoAction('secondary')}
              className="w-full"
            >
              Secondary Action
            </TrackedButton>

            <TrackedButton
              trackingId="tertiary_action"
              trackingData={{ category: 'demo', priority: 'low' }}
              variant="outline"
              onClick={() => handleDemoAction('tertiary')}
              className="w-full"
            >
              Tertiary Action
            </TrackedButton>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <TrackedButton
              trackingId="engagement_action"
              trackingData={{ category: 'engagement', type: 'high_value' }}
              variant="default"
              onClick={handleEngagementAction}
              className="flex-1"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Track High Engagement
            </TrackedButton>

            <TrackedButton
              trackingId="custom_event"
              trackingData={{ category: 'custom', timestamp: new Date().toISOString() }}
              variant="destructive"
              onClick={() => trackCustomEvent('custom_demo_event', { 
                source: 'dashboard',
                userInitiated: true 
              })}
              className="flex-1"
            >
              Send Custom Event
            </TrackedButton>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>What's Being Tracked?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Automatic Tracking:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Page loads and navigation</li>
                <li>• JavaScript errors</li>
                <li>• Performance metrics</li>
                <li>• Session duration</li>
                <li>• User agent and device info</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Custom Events:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Button clicks with context</li>
                <li>• User engagement levels</li>
                <li>• Form submissions</li>
                <li>• Custom business events</li>
                <li>• Performance benchmarks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDashboard;

