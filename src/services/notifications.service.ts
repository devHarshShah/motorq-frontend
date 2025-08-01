export interface DurationAlert {
  sessionId: string;
  vehicleNumberPlate: string;
  slotLocation: string;
  entryTime: string;
  currentDurationHours: number;
  staffName: string;
  vehicleType: string;
  isNotified: boolean;
  notifiedAt?: string;
}

export interface NotificationResponse {
  success: boolean;
  count: number;
  data: DurationAlert[];
}

export interface NotificationCountResponse {
  success: boolean;
  count: number;
}

export class NotificationsService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  static async getNotifications(type?: 'new'): Promise<DurationAlert[]> {
    try {
      const url = type ? `${this.API_BASE_URL}/notifications?type=${type}` : `${this.API_BASE_URL}/notifications`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NotificationResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch notifications'
      );
    }
  }

  static async getNotificationsCount(): Promise<number> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/count`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NotificationCountResponse = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('Error fetching notifications count:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch notifications count'
      );
    }
  }

  static async markAsRead(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/${sessionId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to mark notification as read'
      );
    }
  }

  static async getNotificationsByVehicle(numberPlate: string): Promise<DurationAlert[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/vehicle/${encodeURIComponent(numberPlate)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NotificationResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching notifications by vehicle:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch notifications by vehicle'
      );
    }
  }

  static async triggerManualCheck(): Promise<DurationAlert[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/notifications/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NotificationResponse = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error triggering manual check:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to trigger manual check'
      );
    }
  }

  static createEventSource(): EventSource {
    const eventSource = new EventSource(`${this.API_BASE_URL}/notifications/stream`);
    return eventSource;
  }

  static formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)} hr`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours.toFixed(1)}h`;
    }
  }

  static getVehicleTypeColor(vehicleType: string): string {
    switch (vehicleType) {
      case 'CAR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'BIKE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'EV':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'HANDICAP_ACCESSIBLE':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  static getAlertSeverity(hours: number): 'warning' | 'danger' | 'critical' {
    if (hours >= 12) return 'critical';
    if (hours >= 8) return 'danger';
    return 'warning';
  }
}