'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  IconRefresh,
  IconCheck,
  IconCheckbox,
  IconAlertTriangle,
  IconAlertCircle,
  IconAlertOctagon,
  IconCar,
  IconBike,
  IconPlugConnected,
  IconAccessible,
} from '@tabler/icons-react';
import { DurationAlert } from '@/types';
import { NotificationsService } from '@/services/notifications.service';
import { NotificationItem } from './notification-item';
import { cn } from '@/lib/utils';

interface NotificationDropdownProps {
  notifications: DurationAlert[];
  isLoading: boolean;
  isConnected: boolean;
  onMarkAsRead: (sessionId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  isLoading,
  isConnected,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
  onClose
}: NotificationDropdownProps) {
  const unreadNotifications = notifications.filter(n => n.isNotified);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  const getSeverityStats = () => {
    const stats = { warning: 0, danger: 0, critical: 0 };
    notifications.forEach(notification => {
      const severity = NotificationsService.getAlertSeverity(notification.currentDurationHours);
      stats[severity]++;
    });
    return stats;
  };

  const severityStats = getSeverityStats();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="space-y-1">
          <h4 className="text-sm font-medium leading-none">
            Duration Alerts
          </h4>
          <p className="text-xs text-muted-foreground">
            {notifications.length === 0 
              ? 'No active alerts'
              : `${notifications.length} active alert${notifications.length === 1 ? '' : 's'}`
            }
            {hasUnreadNotifications && (
              <span className="text-orange-600 dark:text-orange-400">
                {' '} • {unreadNotifications.length} unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
            title="Refresh notifications"
          >
            <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>

          {hasUnreadNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 w-8 p-0"
              title="Mark all as read"
            >
              <IconCheckbox className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected 
                ? "bg-green-500 dark:bg-green-400" 
                : "bg-gray-400 dark:bg-gray-500"
            )}
          />
          {isConnected ? "Live updates connected" : "Disconnected"}
        </div>
      </div>

      {notifications.length > 0 && (
        <>
          {/* Severity Summary */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-xs">
              {severityStats.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <IconAlertOctagon className="mr-1 h-3 w-3" />
                  {severityStats.critical} Critical
                </Badge>
              )}
              {severityStats.danger > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  <IconAlertCircle className="mr-1 h-3 w-3" />
                  {severityStats.danger} High
                </Badge>
              )}
              {severityStats.warning > 0 && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300 dark:text-yellow-400 dark:border-yellow-600">
                  <IconAlertTriangle className="mr-1 h-3 w-3" />
                  {severityStats.warning} Medium
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-muted-foreground">
            <IconCheck className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">No duration alerts</p>
            <p className="text-xs mt-1">
              All vehicles are within the 6-hour limit
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="h-full max-h-96">
          <div className="p-1">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={notification.sessionId}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onClose={onClose}
                className={index !== notifications.length - 1 ? "border-b" : ""}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              View All Sessions
            </Button>
          </div>
        </>
      )}
    </div>
  );
}