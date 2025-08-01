import { Vehicle, VehicleEntry, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class VehiclesService {
  static async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Vehicle> = await response.json();
      return data.data || data as Vehicle;
    } catch (error) {
      console.error('Error creating vehicle entry:', error);
      throw error;
    }
  }
}