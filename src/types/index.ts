// Vehicle Types
export interface Vehicle {
  id: string;
  numberPlate: string;
  type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  createdAt: string;
  updatedAt: string;
  sessions: Session[];
}

export interface VehicleEntry {
  numberPlate: string;
  type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  staffId: string;
  ownerName?: string;
  ownerPhone?: string;
}

// Slot Types
export interface Slot {
  id: string;
  location: string;
  type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  sessions: Session[];
}

export interface SlotStatistics {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: string;
}

// Staff Types
export interface Staff {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// Billing Types
export interface Billing {
  id: string;
  sessionId: string;
  type: 'HOURLY' | 'DAY_PASS';
  amount: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

// Session Types
export interface Session {
  id: string;
  vehicleId: string;
  slotId: string;
  staffId: string;
  entryTime: string;
  exitTime: string | null;
  status: 'ACTIVE' | 'COMPLETED';
  billingType: 'HOURLY' | 'DAY_PASS';
  createdAt: string;
  updatedAt: string;
  vehicle?: Vehicle;
  slot?: Slot;
  staff?: Staff;
  billing?: Billing;
}

export interface SessionByVehicle {
  sessions: Session[];
  totalSessions: number;
}

// Summary Types for Dashboard
export interface ParkingStatistics {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  maintenanceSlots: number;
  occupancyRate: number;
  totalVehicles: number;
  activeVehicles: number;
  totalRevenue: number;
  unpaidBills: number;
}

export interface SlotsByType {
  CAR: SlotStatistics;
  BIKE: SlotStatistics;
  EV: SlotStatistics;
  HANDICAP_ACCESSIBLE: SlotStatistics;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Query Types
export interface VehicleFilter {
  type?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  status?: 'ACTIVE' | 'COMPLETED';
  numberPlate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SlotFilter {
  type?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  location?: string;
}

export interface SessionFilter {
  vehicleId?: string;
  slotId?: string;
  staffId?: string;
  status?: 'ACTIVE' | 'COMPLETED';
  billingType?: 'HOURLY' | 'DAY_PASS';
  dateFrom?: string;
  dateTo?: string;
  isPaid?: boolean;
}