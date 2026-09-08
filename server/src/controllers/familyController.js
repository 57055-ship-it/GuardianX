const Tenant = require('../models/Tenant');
const ChildProfile = require('../models/ChildProfile');
const { ENTITLEMENTS } = require('../middleware/entitlementMiddleware');

exports.getFamilyDetails = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Family tenant not found.' });
    }

    const childrenCount = await ChildProfile.countDocuments({ tenantId: req.tenantId });
    const entitlements = ENTITLEMENTS[tenant.plan] || ENTITLEMENTS.FREE;

    return res.status(200).json({
      success: true,
      family: tenant,
      childrenCount,
      entitlements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch family details.',
      error: error.message
    });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { plan } = req.body; // FREE, FAMILY, PREMIUM
    if (!['FREE', 'FAMILY', 'PREMIUM'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan choice.' });
    }

    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Family tenant not found.' });
    }

    tenant.plan = plan;
    tenant.childrenLimit = ENTITLEMENTS[plan].maxChildren;
    tenant.subscriptionStatus = 'active';
    await tenant.save();

    return res.status(200).json({
      success: true,
      message: `Plan updated to ${plan} successfully.`,
      family: tenant,
      entitlements: ENTITLEMENTS[plan]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update subscription plan.',
      error: error.message
    });
  }
};
