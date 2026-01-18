
export enum PackageStatus {
  ARRIVED = 'ARRIVED',
  PICKED_UP = 'PICKED_UP',
  RETURNED = 'RETURNED'
}

export interface Package {
  id: string;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  shelfLocation: string; // e.g., A-1-05
  inboundTime: number;
  outboundTime?: number;
  status: PackageStatus;
  courierCompany: string;
}

export interface StationStats {
  totalInboundToday: number;
  pendingPickup: number;
  deliveredToday: number;
  shelfUtilization: number;
}

// Added missing exports required by game logic and board components
export enum Category {
  FOOD = 'FOOD',
  ANIMAL = 'ANIMAL',
  TRANSPORT = 'TRANSPORT',
  SPORTS = 'SPORTS'
}

export interface Position {
  x: number;
  y: number;
}

export interface TileData {
  id: string;
  type: string;
  category: Category;
  label: string;
  icon: string;
}
