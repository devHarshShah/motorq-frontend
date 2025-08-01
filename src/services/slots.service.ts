export interface SlotStatistics {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class SlotsService {
  static async getStatistics(): Promise<SlotStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/slots/statistics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SlotStatistics = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching slot statistics:', error);
      throw error;
    }
  }
}