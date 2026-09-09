export interface User {
  id: string;
  _id?: string;
  tenantId: string;
  role: 'parent' | 'child' | 'admin';
  name: string;
  email: string;
  avatar?: string;
  isActive?: boolean;
}

export interface Tenant {
  id: string;
  _id?: string;
  name: string;
  plan: 'FREE' | 'FAMILY' | 'PREMIUM';
  childrenLimit: number;
  subscriptionStatus?: string;
  ownerId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  tokens: AuthTokens;
  user: User;
  tenant?: Tenant | null;
}

export interface ChildDevice {
  id: string;
  _id?: string;
  deviceName: string;
  platform: 'android' | 'ios' | 'web';
  deviceIdentifier: string;
  batteryLevel: number;
  isOnline: boolean;
  lastSeen: string;
}

export interface ChildProfile {
  id: string;
  _id: string;
  tenantId: string;
  name: string;
  profileStatus: 'unpaired' | 'paired';
  userId?: string;
  deviceId?: string;
  device?: ChildDevice | null;
  createdAt: string;
  updatedAt: string;
}

export interface PairingCode {
  code: string;
  expiresAt: string;
  childId: string;
}

export interface LocationRecord {
  id: string;
  _id?: string;
  childId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  address?: string;
  timestamp: string;
}

export interface Geofence {
  id: string;
  _id: string;
  tenantId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: 'safe' | 'danger';
  isActive: boolean;
  createdAt?: string;
}

export interface AppUsageItem {
  appName: string;
  packageName?: string;
  durationMinutes: number;
  category?: string;
  iconUrl?: string;
}

export interface AppUsageRecord {
  id: string;
  _id?: string;
  childId: string;
  date: string;
  totalScreenTimeMinutes: number;
  appUsage: AppUsageItem[];
  isIOSUnavailable?: boolean;
}

export interface Alert {
  id: string;
  _id: string;
  tenantId: string;
  childId?: string;
  type: 'sos' | 'geofence_exit' | 'geofence_enter' | 'low_battery' | 'offline' | 'screen_time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  childName?: string;
}

export interface SOSEvent {
  id: string;
  _id: string;
  tenantId: string;
  childId: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'resolved';
  triggeredAt: string;
  resolvedAt?: string;
  childName?: string;
}

export interface FamilyRoutine {
  id: string;
  _id: string;
  tenantId: string;
  title: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  isActive: boolean;
}

export interface TodayHadith {
  title: string;
  text: string;
  source: string;
  reflection: string;
}

export interface SafetyInsightFactor {
  category: string;
  score: number;
  weight: number;
  detail: string;
}

export interface SafetyInsights {
  safetyScore: number;
  level: string;
  factors: SafetyInsightFactor[];
  insights: string[];
}

export interface DailyReport {
  date: string;
  childName: string;
  screenTimeMinutes: number;
  locationCount: number;
  alertsCount: number;
  sosCount: number;
  safetyScore: number;
  summaryText: string;
}

export interface FamilyDetailsResponse {
  success: boolean;
  family: Tenant;
  childrenCount: number;
  entitlements: {
    maxChildren: number;
    locationHistoryDays: number;
    advancedReports: boolean;
    geofenceLimit: number;
  };
}
