const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface BillingRecord {
  id: string;
  sessionId: string;
  type: 'HOURLY' | 'DAY_PASS';
  amount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  session: {
    id: string;
    vehicleId: string;
    slotId: string;
    staffId: string;
    entryTime: string;
    exitTime: string | null;
    status: 'ACTIVE' | 'COMPLETED';
    billingType: 'HOURLY' | 'DAY_PASS';
    vehicle: {
      id: string;
      numberPlate: string;
      type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    };
    slot: {
      id: string;
      location: string;
      type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    };
    staff: {
      id: string;
      name: string;
      employeeId: string;
    };
  };
}

export interface BillingStatistics {
  totalRevenue: number;
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  revenueByType: {
    billingType: string;
    revenue: number;
    count: number;
  }[];
  revenueByVehicleType: {
    vehicleType: string;
    totalRevenue: number;
    totalBills: number;
    paidRevenue: number;
    paidBills: number;
  }[];
}

export interface BillingPreview {
  amount: number;
  durationHours: number;
  vehicleType: string;
  billingType: string;
}

export interface RevenueOverTime {
  period: string;
  revenue: number;
  transactions: number;
  paidRevenue: number;
  paidTransactions: number;
}

export interface PricingConfig {
  HOURLY: Record<string, number>;
  DAY_PASS: Record<string, number>;
  SLAB_PRICING: Record<string, {
    minHours: number;
    maxHours: number;
    rate: number;
  }[]>;
}

export interface UnpaidBillsSummary {
  unpaidBills: BillingRecord[];
  totalUnpaidAmount: number;
  count: number;
}

export interface PeakHourData {
  hour: number;
  entriesCount: number;
  exitsCount: number;
  revenue: number;
  avgOccupancy: number;
  totalDuration: number;
  vehicleBreakdown: {
    vehicleType: string;
    count: number;
  }[];
}

class BillingService {
  // Get all billing records with optional filtering
  static async getBillingRecords(filters?: {
    isPaid?: boolean;
    vehicleType?: string;
    billingType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BillingRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.isPaid !== undefined) {
        queryParams.append('isPaid', filters.isPaid.toString());
      }
      if (filters?.vehicleType) {
        queryParams.append('vehicleType', filters.vehicleType);
      }
      if (filters?.billingType) {
        queryParams.append('billingType', filters.billingType);
      }
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const url = `${API_BASE_URL}/billing${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch billing records: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing records:', error);
      throw error;
    }
  }

  // Get billing statistics and analytics
  static async getBillingStatistics(): Promise<BillingStatistics> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/statistics`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch billing statistics: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing statistics:', error);
      throw error;
    }
  }

  // Get revenue trends over time
  static async getRevenueOverTime(period: 'hour' | 'day' | 'week' | 'month' = 'day', limit: number = 30): Promise<RevenueOverTime[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/billing/revenue-trends?period=${period}&limit=${limit}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch revenue trends: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  }

  // Get unpaid bills summary
  static async getUnpaidBills(): Promise<UnpaidBillsSummary> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/unpaid`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch unpaid bills: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching unpaid bills:', error);
      throw error;
    }
  }

  // Get pricing configuration
  static async getPricingConfig(): Promise<PricingConfig> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/pricing-config`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch pricing config: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing config:', error);
      throw error;
    }
  }

  // Calculate billing preview for active session
  static async calculateBillingPreview(sessionId: string, useSlabPricing: boolean = false): Promise<{
    sessionId: string;
    preview: BillingPreview;
    currentTime: string;
    entryTime: string;
  }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/billing/preview/${sessionId}?useSlabPricing=${useSlabPricing}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to calculate billing preview: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calculating billing preview:', error);
      throw error;
    }
  }

  // Mark billing as paid/unpaid
  static async updatePaymentStatus(billingId: string, isPaid: boolean): Promise<{
    message: string;
    billing: BillingRecord;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/${billingId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaid }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to update payment status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get billing record by ID
  static async getBillingById(billingId: string): Promise<BillingRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/billing/${billingId}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch billing record: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching billing record:', error);
      throw error;
    }
  }

  // Format currency for display
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  }

  // Get peak hour analysis
  static async getPeakHourAnalysis(date?: string): Promise<PeakHourData[]> {
    try {
      const params = new URLSearchParams();
      if (date) {
        params.append('date', date);
      }

      const url = `${API_BASE_URL}/billing/peak-hours${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Failed to fetch peak hour analysis: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching peak hour analysis:', error);
      throw error;
    }
  }

  // Format duration for display  
  static formatDuration(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      
      if (minutes === 0) {
        return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''}`;
      } else {
        return `${wholeHours}h ${minutes}m`;
      }
    }
  }
}

export default BillingService;