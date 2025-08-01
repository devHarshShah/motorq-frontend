import { Slot, SlotStatistics, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class SlotsService {
  static async getStatistics(): Promise<SlotStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots/statistics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<SlotStatistics> = await response.json();
      return data.data || data as SlotStatistics;
    } catch (error) {
      console.error('Error fetching slot statistics:', error);
      throw error;
    }
  }

  static async getAllSlots(): Promise<Slot[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Slot[]> = await response.json();
      return data.data || data as Slot[];
    } catch (error) {
      console.error('Error fetching all slots:', error);
      throw error;
    }
  }

  static async getAvailableSlotsByType(type: 'car' | 'motorcycle' | 'truck'): Promise<Slot[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots/available/${type}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Slot[]> = await response.json();
      return data.data || data as Slot[];
    } catch (error) {
      console.error('Error fetching available slots by type:', error);
      throw error;
    }
  }

  static async updateSlotMaintenanceStatus(slotId: string, status: 'AVAILABLE' | 'MAINTENANCE'): Promise<Slot> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots/${slotId}/maintenance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Slot> = await response.json();
      return data.data || data as Slot;
    } catch (error) {
      console.error('Error updating slot maintenance status:', error);
      throw error;
    }
  }

  static async manuallyAssignSlotToSession(
    slotId: string, 
    vehicleNumberPlate: string, 
    staffId: string, 
    billingType: 'HOURLY' | 'DAY_PASS',
    overrideSlotId?: string
  ): Promise<any> {
    try {
      const requestBody: any = { 
        vehicleNumberPlate, 
        staffId, 
        billingType 
      };

      if (overrideSlotId) {
        requestBody.overrideSlotId = overrideSlotId;
      }

      const response = await fetch(`${API_BASE_URL}/slots/${slotId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error manually assigning slot to session:', error);
      throw error;
    }
  }
}