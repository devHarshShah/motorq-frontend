import { Vehicle, VehicleEntry, ApiResponse } from '@/types';

export interface VehicleSearchResult {
  id: string;
  numberPlate: string;
  type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  isActive: boolean;
  totalSessions: number;
  activeSession?: {
    slot: {
      location: string;
      type: string;
    };
    entryTime: string;
    billing: {
      amount: number;
      isPaid: boolean;
    }[];
  } | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class VehiclesService {
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Vehicle[]> = await response.json();
      return data.data || data as Vehicle[];
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  static async createVehicleEntry(vehicleData: VehicleEntry): Promise<Vehicle> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Vehicle> = await response.json();
      return data.data || data as Vehicle;
    } catch (error) {
      console.error('Error creating vehicle entry:', error);
      throw error;
    }
  }

  static async searchVehiclesRealtime(
    query: string, 
    limit: number = 10, 
    includeActive: boolean = false
  ): Promise<VehicleSearchResult[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        includeActive: includeActive.toString()
      });

      const response = await fetch(`${API_BASE_URL}/vehicles/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  }
}