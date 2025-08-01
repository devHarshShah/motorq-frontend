import { Session, SessionByVehicle, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export class SessionsService {
  static async getSessions(): Promise<Session[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Session[]> = await response.json();
      return data.data || data as Session[];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  }

  static async getActiveSessions(): Promise<Session[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/active`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Session[]> = await response.json();
      return data.data || data as Session[];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  }

  static async getSessionById(sessionId: string): Promise<Session> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Session> = await response.json();
      return data.data || data as Session;
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw error;
    }
  }

  static async getSessionsByVehicle(numberPlate: string): Promise<SessionByVehicle> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/vehicle/${numberPlate}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<SessionByVehicle> = await response.json();
      return data.data || data as SessionByVehicle;
    } catch (error) {
      console.error('Error fetching sessions by vehicle:', error);
      throw error;
    }
  }

  static async endParkingSession(sessionId: string, options?: { useSlabPricing?: boolean }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/end`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options || {}),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error ending parking session:', error);
      throw error;
    }
  }
}