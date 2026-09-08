const Tenant = require('../models/Tenant');

const ENTITLEMENTS = {
  FREE: {
    maxChildren: 1,
    locationHistory: false,
    advancedReports: false,
    advancedAnalytics: false
  },
  FAMILY: {
    maxChildren: 3,
    locationHistory: true,
    advancedReports: true,
    advancedAnalytics: false
  },
  PREMIUM: {
    maxChildren: 5,
    locationHistory: true,
    advancedReports: true,
    advancedAnalytics: true
  }
};

const checkEntitlement = (featureKey) => {
  return async (req, res, next) => {
    try {
      const tenant = await Tenant.findById(req.tenantId);
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant not found.' });
      }

      const plan = tenant.plan || 'FREE';
      const planEntitlements = ENTITLEMENTS[plan] || ENTITLEMENTS.FREE;

      req.tenantPlan = plan;
      req.planEntitlements = planEntitlements;

      if (featureKey && !planEntitlements[featureKey]) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureKey}' requires a plan upgrade. Current plan: ${plan}.`,
          currentPlan: plan,
          requiredFeature: featureKey
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Entitlement check failed.',
        error: error.message
      });
    }
  };
};

module.exports = {
  checkEntitlement,
  ENTITLEMENTS
};
