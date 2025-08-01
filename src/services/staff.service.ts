import { Staff, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class StaffService {
  static async getStaff(): Promise<Staff[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Staff[]> = await response.json();
      return data.data || data as Staff[];
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  static async getStaffById(id: string): Promise<Staff> {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Staff> = await response.json();
      return data.data || data as Staff;
    } catch (error) {
      console.error('Error fetching staff by id:', error);
      throw error;
    }
  }
}