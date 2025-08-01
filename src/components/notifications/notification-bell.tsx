'use client';

import { useState } from 'react';
import { IconBell, IconBellRinging } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationDropdown } from './notification-dropdown';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    notificationCount, 
    isLoading, 
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh,
    getUnreadNotifications
  } = useNotifications();

  const unreadCount = getUnreadNotifications().length;
  const hasNotifications = notificationCount > 0;
  const hasUnreadNotifications = unreadCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 rounded-full",
            hasUnreadNotifications && "text-orange-600 dark:text-orange-400",
            className
          )}
          aria-label={`Notifications${hasNotifications ? ` (${notificationCount})` : ''}`}
        >
          {hasUnreadNotifications ? (
            <IconBellRinging className="h-5 w-5" />
          ) : (
            <IconBell className="h-5 w-5" />
          )}
          
          {/* Notification Count Badge */}
          {hasNotifications && (
            <Badge
              variant={hasUnreadNotifications ? "destructive" : "secondary"}
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs",
                "flex items-center justify-center",
                notificationCount > 99 ? "px-1" : ""
              )}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        sideOffset={8}
      >
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          isConnected={isConnected}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRefresh={refresh}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}