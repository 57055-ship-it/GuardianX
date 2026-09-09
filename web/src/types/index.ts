export interface User {
  id: string;
  _id?: string;
  tenantId: string;
  role: 'parent' | 'child' | 'admin' | 'super_admin';
  name: string;
  email: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  _id?: string;
  name: string;
  plan: 'FREE' | 'BASIC' | 'FAMILY' | 'PREMIUM' | string;
  childrenLimit: number;
  subscriptionStatus?: string;
  status?: 'active' | 'suspended';
  ownerId?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanLimits {
  maxChildren: number;
  maxDevices: number;
  maxParents: number;
  maxSafeZones: number;
  locationHistoryDays: number;
  maxLocationUpdates: number;
  maxReportsPerMonth: number;
  maxDevicesPerChild?: number;
  storageLimitMb?: number;
}

export interface PlanFeatures {
  screenTimeEnabled: boolean;
  appUsageEnabled: boolean;
  locationEnabled: boolean;
  locationHistoryEnabled: boolean;
  safeZonesEnabled: boolean;
  sosEnabled: boolean;
  reportsEnabled: boolean;
  advancedReportsEnabled: boolean;
  familyRoutineEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface Plan {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly';
  trialDays: number;
  active: boolean;
  displayOrder: number;
  limits: PlanLimits;
  features: PlanFeatures;
  createdAt?: string;
}

export interface Subscription {
  id: string;
  _id: string;
  tenantId: string | Tenant;
  parentId: string | User;
  planId: string | Plan;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'suspended';
  startDate: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  _id: string;
  adminId: string | User;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

export interface SaaSSetting {
  id: string;
  _id: string;
  key: string;
  value: any;
  description: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalParents: number;
  totalChildren: number;
  totalFamilies: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredSubscriptions: number;
  suspendedUsers: number;
  activeDevices: number;
  locationsToday: number;
  totalSOS: number;
  totalSafeZones: number;
  billingConfigured: boolean;
  billingMessage: string;
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
  tenantId: string | Tenant;
  parentId?: string | User;
  name: string;
  profileStatus: 'unpaired' | 'paired';
  userId?: string;
  deviceId?: string | ChildDevice;
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
