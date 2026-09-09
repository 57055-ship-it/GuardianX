const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const ChildProfile = require('../models/ChildProfile');
const Geofence = require('../models/Geofence');
const Device = require('../models/Device');

// Fallback plan values when no Plan document is bound
const DEFAULT_FALLBACK_PLANS = {
  FREE: {
    slug: 'free',
    name: 'Free Plan',
    limits: {
      maxChildren: 1,
      maxDevices: 2,
      maxParents: 2,
      maxSafeZones: 2,
      locationHistoryDays: 1,
      maxLocationUpdates: 500,
      maxReportsPerMonth: 5
    },
    features: {
      screenTimeEnabled: true,
      appUsageEnabled: true,
      locationEnabled: true,
      locationHistoryEnabled: false,
      safeZonesEnabled: true,
      sosEnabled: true,
      reportsEnabled: true,
      advancedReportsEnabled: false,
      familyRoutineEnabled: true,
      notificationsEnabled: true
    }
  },
  BASIC: {
    slug: 'basic',
    name: 'Basic Plan',
    limits: {
      maxChildren: 2,
      maxDevices: 4,
      maxParents: 2,
      maxSafeZones: 5,
      locationHistoryDays: 7,
      maxLocationUpdates: 2000,
      maxReportsPerMonth: 20
    },
    features: {
      screenTimeEnabled: true,
      appUsageEnabled: true,
      locationEnabled: true,
      locationHistoryEnabled: true,
      safeZonesEnabled: true,
      sosEnabled: true,
      reportsEnabled: true,
      advancedReportsEnabled: false,
      familyRoutineEnabled: true,
      notificationsEnabled: true
    }
  },
  FAMILY: {
    slug: 'family',
    name: 'Family Plan',
    limits: {
      maxChildren: 5,
      maxDevices: 10,
      maxParents: 4,
      maxSafeZones: 10,
      locationHistoryDays: 30,
      maxLocationUpdates: 10000,
      maxReportsPerMonth: 50
    },
    features: {
      screenTimeEnabled: true,
      appUsageEnabled: true,
      locationEnabled: true,
      locationHistoryEnabled: true,
      safeZonesEnabled: true,
      sosEnabled: true,
      reportsEnabled: true,
      advancedReportsEnabled: true,
      familyRoutineEnabled: true,
      notificationsEnabled: true
    }
  },
  PREMIUM: {
    slug: 'premium',
    name: 'Premium Plan',
    limits: {
      maxChildren: 10,
      maxDevices: 20,
      maxParents: 10,
      maxSafeZones: 25,
      locationHistoryDays: 90,
      maxLocationUpdates: 50000,
      maxReportsPerMonth: 200
    },
    features: {
      screenTimeEnabled: true,
      appUsageEnabled: true,
      locationEnabled: true,
      locationHistoryEnabled: true,
      safeZonesEnabled: true,
      sosEnabled: true,
      reportsEnabled: true,
      advancedReportsEnabled: true,
      familyRoutineEnabled: true,
      notificationsEnabled: true
    }
  }
};

/**
 * Resolves the full Plan definition and limits for a given tenant ID.
 */
async function getTenantPlanDetails(tenantId) {
  const tenant = await Tenant.findById(tenantId).populate('planId');
  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (tenant.status === 'suspended') {
    throw new Error('Tenant account is suspended.');
  }

  let planDoc = tenant.planId;

  if (!planDoc) {
    const slug = (tenant.plan || 'FREE').toLowerCase();
    planDoc = await Plan.findOne({ slug, active: true });
  }

  if (!planDoc) {
    const planName = (tenant.plan || 'FREE').toUpperCase();
    const fallback = DEFAULT_FALLBACK_PLANS[planName] || DEFAULT_FALLBACK_PLANS.FREE;
    return {
      tenant,
      planName: fallback.name,
      planSlug: fallback.slug,
      limits: fallback.limits,
      features: fallback.features
    };
  }

  return {
    tenant,
    planName: planDoc.name,
    planSlug: planDoc.slug,
    limits: planDoc.limits || DEFAULT_FALLBACK_PLANS.FREE.limits,
    features: planDoc.features || DEFAULT_FALLBACK_PLANS.FREE.features
  };
}

/**
 * Evaluates whether a tenant can create a new child profile based on their plan limits.
 */
async function canCreateChild(tenantId) {
  const { limits, planName } = await getTenantPlanDetails(tenantId);
  const currentCount = await ChildProfile.countDocuments({ tenantId });

  const maxAllowed = limits.maxChildren ?? 1;

  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed,
      message: `Child limit reached (${currentCount}/${maxAllowed}) for your ${planName}. Please upgrade your plan to add more children.`
    };
  }

  return { allowed: true, currentCount, maxAllowed };
}

/**
 * Evaluates whether a tenant can create a new geofence/safe zone.
 */
async function canCreateSafeZone(tenantId) {
  const { limits, planName, features } = await getTenantPlanDetails(tenantId);

  if (features.safeZonesEnabled === false) {
    return {
      allowed: false,
      message: `Safe Zones feature is not included in your current plan (${planName}). Please upgrade to access.`
    };
  }

  const currentCount = await Geofence.countDocuments({ tenantId });
  const maxAllowed = limits.maxSafeZones ?? 2;

  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed,
      message: `Safe Zone limit reached (${currentCount}/${maxAllowed}) for your ${planName}. Please upgrade your plan to add more safe zones.`
    };
  }

  return { allowed: true, currentCount, maxAllowed };
}

/**
 * Evaluates whether a tenant can register another child device.
 */
async function canCreateDevice(tenantId) {
  const { limits, planName } = await getTenantPlanDetails(tenantId);
  const currentCount = await Device.countDocuments({ tenantId });
  const maxAllowed = limits.maxDevices ?? 2;

  if (currentCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount,
      maxAllowed,
      message: `Device limit reached (${currentCount}/${maxAllowed}) for your ${planName}. Please upgrade your plan to add more devices.`
    };
  }

  return { allowed: true, currentCount, maxAllowed };
}

/**
 * Evaluates a specific feature toggle (e.g. locationHistoryEnabled, advancedReportsEnabled).
 */
async function checkFeatureAccess(tenantId, featureKey) {
  const { features, planName } = await getTenantPlanDetails(tenantId);

  if (features[featureKey] === false) {
    return {
      allowed: false,
      message: `Feature '${featureKey}' is locked on your current plan (${planName}). Upgrade your subscription to unlock.`
    };
  }

  return { allowed: true };
}

module.exports = {
  getTenantPlanDetails,
  canCreateChild,
  canCreateSafeZone,
  canCreateDevice,
  checkFeatureAccess,
  DEFAULT_FALLBACK_PLANS
};
