'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { NotificationsService } from '@/services/notifications.service';
import { DurationAlert, NotificationStreamEvent } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<DurationAlert[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [alerts, count] = await Promise.all([
        NotificationsService.getNotifications(),
        NotificationsService.getNotificationsCount()
      ]);
      
      setNotifications(alerts);
      setNotificationCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (sessionId: string) => {
    try {
      await NotificationsService.markAsRead(sessionId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.sessionId === sessionId 
            ? { ...notification, isNotified: false }
            : notification
        )
      );

      // Update count
      setNotificationCount(prev => Math.max(0, prev - 1));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.isNotified);
      
      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map(n => NotificationsService.markAsRead(n.sessionId))
      );

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isNotified: false }))
      );
      
      setNotificationCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  }, [notifications]);

  // Setup Server-Sent Events connection
  const setupEventSource = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const es = NotificationsService.createEventSource();
    
    es.onopen = () => {
      setIsConnected(true);
      console.log('Connected to notification stream');
    };

    es.onmessage = (event) => {
      try {
        const data: NotificationStreamEvent = JSON.parse(event.data);
        
        if (data.type === 'initial' || data.type === 'update') {
          setNotifications(data.alerts);
          setNotificationCount(data.count);

          // Show toast for new notifications (only for updates, not initial load)
          if (data.type === 'update') {
            const newAlerts = data.alerts.filter(alert => 
              alert.isNotified && 
              alert.notifiedAt && 
              new Date(alert.notifiedAt).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
            );

            newAlerts.forEach(alert => {
              const severity = NotificationsService.getAlertSeverity(alert.currentDurationHours);
              const message = `Vehicle ${alert.vehicleNumberPlate} has been parked for ${NotificationsService.formatDuration(alert.currentDurationHours)}`;
              
              if (severity === 'critical') {
                toast.error(message, {
                  description: `Slot: ${alert.slotLocation}`,
                  duration: 10000,
                });
              } else if (severity === 'danger') {
                toast.warning(message, {
                  description: `Slot: ${alert.slotLocation}`,
                  duration: 8000,
                });
              } else {
                toast.warning(message, {
                  description: `Slot: ${alert.slotLocation}`,
                  duration: 6000,
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Error parsing notification stream data:', error);
      }
    };

    es.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsConnected(false);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (es.readyState === EventSource.CLOSED) {
          setupEventSource();
        }
      }, 5000);
    };

    es.onclose = () => {
      setIsConnected(false);
      console.log('Notification stream closed');
    };

    setEventSource(es);
  }, [eventSource]);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Trigger manual check (for admin/testing)
  const triggerManualCheck = useCallback(async () => {
    try {
      const alerts = await NotificationsService.triggerManualCheck();
      setNotifications(alerts);
      setNotificationCount(alerts.length);
      toast.success('Manual notification check completed');
    } catch (error) {
      console.error('Error triggering manual check:', error);
      toast.error('Failed to trigger manual check');
    }
  }, []);

  // Get notifications by severity
  const getNotificationsBySeverity = useCallback((severity: 'warning' | 'danger' | 'critical') => {
    return notifications.filter(notification => 
      NotificationsService.getAlertSeverity(notification.currentDurationHours) === severity
    );
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => notification.isNotified);
  }, [notifications]);

  // Initialize on mount
  useEffect(() => {
    fetchNotifications();
    setupEventSource();

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Cleanup effect for eventSource
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return {
    notifications,
    notificationCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh,
    triggerManualCheck,
    getNotificationsBySeverity,
    getUnreadNotifications,
  };
}