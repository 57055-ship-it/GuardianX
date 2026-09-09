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

export interface ChildProfile {
  id: string;
  _id: string;
  tenantId: string | Tenant;
  parentId?: string | User;
  name: string;
  profileStatus: 'unpaired' | 'paired';
  userId?: string;
  deviceId?: any;
  createdAt: string;
  updatedAt: string;
}
