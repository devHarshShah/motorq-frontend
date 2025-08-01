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
}