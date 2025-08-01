'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconCheck,
  IconCar,
  IconBike,
  IconPlugConnected,
  IconAccessible,
  IconClock,
  IconMapPin,
  IconUser,
  IconAlertTriangle,
  IconAlertCircle,
  IconAlertOctagon,
} from '@tabler/icons-react';
import { DurationAlert } from '@/types';
import { NotificationsService } from '@/services/notifications.service';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: DurationAlert;
  onMarkAsRead: (sessionId: string) => Promise<void>;
  onClose: () => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
  className
}: NotificationItemProps) {
  const severity = NotificationsService.getAlertSeverity(notification.currentDurationHours);
  const formattedDuration = NotificationsService.formatDuration(notification.currentDurationHours);
  const vehicleTypeColor = NotificationsService.getVehicleTypeColor(notification.vehicleType);

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return <IconCar className="h-4 w-4" />;
      case 'BIKE':
        return <IconBike className="h-4 w-4" />;
      case 'EV':
        return <IconPlugConnected className="h-4 w-4" />;
      case 'HANDICAP_ACCESSIBLE':
        return <IconAccessible className="h-4 w-4" />;
      default:
        return <IconCar className="h-4 w-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <IconAlertOctagon className="h-4 w-4 text-red-500" />;
      case 'danger':
        return <IconAlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning':
      default:
        return <IconAlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge variant="destructive" className="text-xs">
            12+ hrs
          </Badge>
        );
      case 'danger':
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
            8+ hrs
          </Badge>
        );
      case 'warning':
      default:
        return (
          <Badge variant="outline" className="text-yellow-700 border-yellow-300 dark:text-yellow-400 dark:border-yellow-600 text-xs">
            6+ hrs
          </Badge>
        );
    }
  };

  const formatEntryTime = (entryTime: string) => {
    const date = new Date(entryTime);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onMarkAsRead(notification.sessionId);
  };

  return (
    <div
      className={cn(
        "group relative p-3 hover:bg-muted/50 transition-colors",
        notification.isNotified && "bg-orange-50/50 dark:bg-orange-950/20",
        className
      )}
    >
      {/* Severity Indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b">
        <div
          className={cn(
            "h-full w-full rounded-r",
            severity === 'critical' && "bg-red-500",
            severity === 'danger' && "bg-orange-500",
            severity === 'warning' && "bg-yellow-500"
          )}
        />
      </div>

      <div className="ml-2">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {getSeverityIcon(severity)}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {notification.vehicleNumberPlate}
                </p>
                <Badge className={cn("text-xs", vehicleTypeColor)}>
                  <span className="mr-1">{getVehicleIcon(notification.vehicleType)}</span>
                  {notification.vehicleType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {getSeverityBadge(severity)}
            {notification.isNotified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Mark as read"
              >
                <IconCheck className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Duration Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            <span className="font-medium text-foreground">
              {formattedDuration}
            </span>
            <span>parked</span>
          </div>
        </div>

        {/* Details Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <IconMapPin className="h-3 w-3" />
            <span>{notification.slotLocation}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <IconUser className="h-3 w-3" />
            <span>{notification.staffName}</span>
          </div>
        </div>

        {/* Entry Time */}
        <div className="text-xs text-muted-foreground mt-1">
          Entered: {formatEntryTime(notification.entryTime)}
        </div>
      </div>

      {/* Unread Indicator */}
      {notification.isNotified && (
        <div className="absolute top-3 right-3">
          <div className="h-2 w-2 bg-orange-500 rounded-full" />
        </div>
      )}
    </div>
  );
}