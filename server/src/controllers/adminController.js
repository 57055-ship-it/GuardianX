const User = require('../models/User');
const Tenant = require('../models/Tenant');
const ChildProfile = require('../models/ChildProfile');
const Device = require('../models/Device');
const LocationRecord = require('../models/LocationRecord');
const SOSEvent = require('../models/SOSEvent');
const Geofence = require('../models/Geofence');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const SaaSSetting = require('../models/SaaSSetting');
const { DEFAULT_FALLBACK_PLANS } = require('../services/entitlementService');

/**
 * Helper to record administrative audit events.
 */
async function recordAuditLog(adminUser, action, targetType, targetId, metadata = {}, req = null) {
  try {
    await AuditLog.create({
      adminId: adminUser.id || adminUser._id,
      adminEmail: adminUser.email || '',
      action,
      targetType,
      targetId: targetId || null,
      metadata,
      ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : ''
    });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
}

// GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalParents,
      totalChildren,
      totalFamilies,
      activeSubscriptions,
      trialUsers,
      expiredSubscriptions,
      suspendedUsers,
      activeDevices,
      locationsToday,
      totalSOS,
      totalSafeZones
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'child' }),
      Tenant.countDocuments(),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'trialing' }),
      Subscription.countDocuments({ status: { $in: ['expired', 'cancelled'] } }),
      User.countDocuments({ isActive: false }),
      Device.countDocuments({ isOnline: true }),
      LocationRecord.countDocuments({
        timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      SOSEvent.countDocuments(),
      Geofence.countDocuments()
    ]);

    // Aggregate plan distribution across tenants
    const planDistributionRaw = await Tenant.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    const planDistribution = planDistributionRaw.map((item) => ({
      plan: item._id || 'FREE',
      count: item.count
    }));

    // Aggregate active vs suspended accounts
    const accountStatusRaw = await User.aggregate([
      { $group: { _id: '$isActive', count: { $sum: 1 } } }
    ]);
    const accountStatus = {
      active: accountStatusRaw.find((a) => a._id === true)?.count || 0,
      suspended: accountStatusRaw.find((a) => a._id === false)?.count || 0
    };

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalParents,
        totalChildren,
        totalFamilies,
        activeSubscriptions,
        trialUsers,
        expiredSubscriptions,
        suspendedUsers,
        activeDevices,
        locationsToday,
        totalSOS,
        totalSafeZones,
        billingConfigured: false,
        billingMessage: 'Billing integration not configured (Manual / Provider-agnostic mode)'
      },
      charts: {
        planDistribution,
        accountStatus
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: 'Failed to generate dashboard statistics.',
      error: error.message
    });
  }
};

// GET /api/admin/parents
exports.getParents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const planFilter = req.query.plan || '';
    const statusFilter = req.query.status || '';

    const query = { role: 'parent' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (statusFilter === 'active') query.isActive = true;
    if (statusFilter === 'suspended') query.isActive = false;

    const skip = (page - 1) * limit;

    const [parents, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .populate('tenantId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    // Enrich parents with children & device counts
    const enrichedParents = await Promise.all(
      parents.map(async (parent) => {
        const tenantId = parent.tenantId?._id || parent.tenantId;
        const [childrenCount, devicesCount, subscription] = await Promise.all([
          tenantId ? ChildProfile.countDocuments({ tenantId }) : 0,
          tenantId ? Device.countDocuments({ tenantId }) : 0,
          tenantId ? Subscription.findOne({ tenantId }).populate('planId') : null
        ]);

        return {
          ...parent,
          childrenCount,
          devicesCount,
          plan: parent.tenantId?.plan || 'FREE',
          subscriptionStatus: subscription?.status || parent.tenantId?.subscriptionStatus || 'active',
          subscription
        };
      })
    );

    return res.status(200).json({
      success: true,
      parents: enrichedParents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch parents.',
      error: error.message
    });
  }
};

// GET /api/admin/parents/:id
exports.getParentById = async (req, res) => {
  try {
    const parent = await User.findOne({ _id: req.params.id, role: 'parent' })
      .select('-passwordHash')
      .populate('tenantId');

    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent account not found.' });
    }

    const tenantId = parent.tenantId?._id || parent.tenantId;

    const [children, devices, subscription, geofenceCount] = await Promise.all([
      tenantId ? ChildProfile.find({ tenantId }).populate('deviceId') : [],
      tenantId ? Device.find({ tenantId }) : [],
      tenantId ? Subscription.findOne({ tenantId }).populate('planId') : null,
      tenantId ? Geofence.countDocuments({ tenantId }) : 0
    ]);

    return res.status(200).json({
      success: true,
      parent,
      tenant: parent.tenantId,
      subscription,
      children,
      devices,
      usageSummary: {
        childrenCount: children.length,
        devicesCount: devices.length,
        geofenceCount
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch parent details.',
      error: error.message
    });
  }
};

// POST /api/admin/parents/:id/plan
exports.assignPlanToParent = async (req, res) => {
  try {
    const { planSlug } = req.body;
    if (!planSlug) {
      return res.status(400).json({ success: false, message: 'planSlug is required.' });
    }

    const parent = await User.findOne({ _id: req.params.id, role: 'parent' });
    if (!parent || !parent.tenantId) {
      return res.status(404).json({ success: false, message: 'Parent or associated Family not found.' });
    }

    let plan = await Plan.findOne({ slug: planSlug.toLowerCase() });
    if (!plan) {
      const fallback = DEFAULT_FALLBACK_PLANS[planSlug.toUpperCase()];
      if (!fallback) {
        return res.status(400).json({ success: false, message: `Invalid plan slug '${planSlug}'.` });
      }
      plan = await Plan.create({
        name: fallback.name,
        slug: fallback.slug,
        description: `${fallback.name} auto-provisioned`,
        price: 0,
        limits: fallback.limits,
        features: fallback.features
      });
    }

    const tenant = await Tenant.findById(parent.tenantId);
    tenant.plan = plan.slug.toUpperCase();
    tenant.planId = plan._id;
    tenant.childrenLimit = plan.limits.maxChildren || 1;
    await tenant.save();

    let subscription = await Subscription.findOne({ tenantId: tenant._id });
    if (subscription) {
      subscription.planId = plan._id;
      subscription.status = 'active';
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        tenantId: tenant._id,
        parentId: parent._id,
        planId: plan._id,
        status: 'active',
        startDate: new Date()
      });
    }
    tenant.subscriptionId = subscription._id;
    await tenant.save();

    await recordAuditLog(req.user, 'PLAN_ASSIGNED', 'User', parent._id, {
      parentEmail: parent.email,
      planName: plan.name,
      planSlug: plan.slug
    }, req);

    return res.status(200).json({
      success: true,
      message: `Plan '${plan.name}' assigned to parent ${parent.email} successfully.`,
      tenant,
      subscription
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to assign plan.',
      error: error.message
    });
  }
};

// PUT /api/admin/parents/:id/suspension
exports.toggleParentSuspension = async (req, res) => {
  try {
    const { suspend, reason } = req.body;
    const parent = await User.findOne({ _id: req.params.id, role: 'parent' });
    if (!parent) {
      return res.status(404).json({ success: false, message: 'Parent account not found.' });
    }

    parent.isActive = !suspend;
    await parent.save();

    if (parent.tenantId) {
      await Tenant.findByIdAndUpdate(parent.tenantId, {
        status: suspend ? 'suspended' : 'active'
      });
    }

    const action = suspend ? 'PARENT_SUSPENDED' : 'PARENT_REACTIVATED';
    await recordAuditLog(req.user, action, 'User', parent._id, {
      parentEmail: parent.email,
      reason: reason || 'Administrative action'
    }, req);

    return res.status(200).json({
      success: true,
      message: `Parent account ${parent.email} has been ${suspend ? 'suspended' : 'reactivated'}.`,
      parent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update parent suspension status.',
      error: error.message
    });
  }
};

// GET /api/admin/children
exports.getGlobalChildren = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [children, total] = await Promise.all([
      ChildProfile.find()
        .populate('parentId', 'name email')
        .populate('tenantId', 'name plan')
        .populate('deviceId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ChildProfile.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      children,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch global children list.',
      error: error.message
    });
  }
};

// GET /api/admin/families
exports.getGlobalFamilies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [families, total] = await Promise.all([
      Tenant.find()
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Tenant.countDocuments()
    ]);

    const enrichedFamilies = await Promise.all(
      families.map(async (family) => {
        const [childrenCount, devicesCount] = await Promise.all([
          ChildProfile.countDocuments({ tenantId: family._id }),
          Device.countDocuments({ tenantId: family._id })
        ]);
        return {
          ...family,
          childrenCount,
          devicesCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      families: enrichedFamilies,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch families.',
      error: error.message
    });
  }
};

// GET /api/admin/plans
exports.getPlans = async (req, res) => {
  try {
    let plans = await Plan.find().sort({ displayOrder: 1, createdAt: 1 });
    
    // Auto-seed default plans if database has zero plans
    if (plans.length === 0) {
      const defaultPlanDocs = Object.values(DEFAULT_FALLBACK_PLANS).map((p, idx) => ({
        name: p.name,
        slug: p.slug,
        description: `Standard ${p.name} tier`,
        price: idx === 0 ? 0 : idx === 1 ? 9.99 : idx === 2 ? 19.99 : 29.99,
        currency: 'USD',
        limits: p.limits,
        features: p.features,
        displayOrder: idx
      }));
      plans = await Plan.insertMany(defaultPlanDocs);
    }

    return res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch plans.',
      error: error.message
    });
  }
};

// POST /api/admin/plans
exports.createPlan = async (req, res) => {
  try {
    const { name, slug, description, price, currency, billingInterval, trialDays, limits, features } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Plan name and slug are required.' });
    }

    const existing = await Plan.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Plan with slug '${slug}' already exists.` });
    }

    const plan = await Plan.create({
      name,
      slug: slug.toLowerCase(),
      description: description || '',
      price: price || 0,
      currency: currency || 'USD',
      billingInterval: billingInterval || 'monthly',
      trialDays: trialDays || 14,
      limits: limits || DEFAULT_FALLBACK_PLANS.FREE.limits,
      features: features || DEFAULT_FALLBACK_PLANS.FREE.features
    });

    await recordAuditLog(req.user, 'PLAN_CREATED', 'Plan', plan._id, { planName: plan.name, slug: plan.slug }, req);

    return res.status(201).json({
      success: true,
      message: 'Plan created successfully.',
      plan
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create plan.',
      error: error.message
    });
  }
};

// PUT /api/admin/plans/:id
exports.updatePlan = async (req, res) => {
  try {
    const { name, description, price, currency, trialDays, limits, features, active } = req.body;

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
        ...(trialDays !== undefined && { trialDays }),
        ...(limits && { limits }),
        ...(features && { features }),
        ...(active !== undefined && { active })
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    await recordAuditLog(req.user, 'PLAN_UPDATED', 'Plan', plan._id, { planName: plan.name, slug: plan.slug }, req);

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully.',
      plan
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update plan.',
      error: error.message
    });
  }
};

// GET /api/admin/subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      Subscription.find()
        .populate('parentId', 'name email')
        .populate('tenantId', 'name')
        .populate('planId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Subscription.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      subscriptions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions.',
      error: error.message
    });
  }
};

// GET /api/admin/usage
exports.getPlatformUsage = async (req, res) => {
  try {
    const parents = await User.find({ role: 'parent' })
      .select('name email tenantId')
      .populate('tenantId')
      .limit(50)
      .lean();

    const usageList = await Promise.all(
      parents.map(async (parent) => {
        const tenantId = parent.tenantId?._id;
        if (!tenantId) return null;

        const [childrenCount, safeZonesCount, devicesCount] = await Promise.all([
          ChildProfile.countDocuments({ tenantId }),
          Geofence.countDocuments({ tenantId }),
          Device.countDocuments({ tenantId })
        ]);

        const planName = parent.tenantId?.plan || 'FREE';
        const fallbackLimits = DEFAULT_FALLBACK_PLANS[planName] ? DEFAULT_FALLBACK_PLANS[planName].limits : DEFAULT_FALLBACK_PLANS.FREE.limits;

        return {
          parentId: parent._id,
          parentName: parent.name,
          parentEmail: parent.email,
          familyName: parent.tenantId?.name || 'Family',
          plan: planName,
          children: { count: childrenCount, max: fallbackLimits.maxChildren },
          safeZones: { count: safeZonesCount, max: fallbackLimits.maxSafeZones },
          devices: { count: devicesCount, max: fallbackLimits.maxDevices }
        };
      })
    );

    return res.status(200).json({
      success: true,
      usage: usageList.filter(Boolean)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch platform usage.',
      error: error.message
    });
  }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action) query.action = req.query.action;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs.',
      error: error.message
    });
  }
};

// GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SaaSSetting.find();
    if (settings.length === 0) {
      settings = await SaaSSetting.insertMany([
        { key: 'DEFAULT_PLAN', value: 'FREE', description: 'Default plan assigned upon Parent registration' },
        { key: 'DEFAULT_TRIAL_DAYS', value: 14, description: 'Default trial period duration in days' },
        { key: 'DEFAULT_CURRENCY', value: 'USD', description: 'Default currency symbol' },
        { key: 'MAINTENANCE_MODE', value: false, description: 'Global platform maintenance toggle' },
        { key: 'REGISTRATION_ENABLED', value: true, description: 'Public parent registration toggle' }
      ]);
    }
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch settings.',
      error: error.message
    });
  }
};

// PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Setting key and value are required.' });
    }

    const setting = await SaaSSetting.findOneAndUpdate(
      { key: key.toUpperCase() },
      { value },
      { new: true, upsert: true }
    );

    await recordAuditLog(req.user, 'SETTINGS_UPDATED', 'SaaSSetting', setting._id, { key, value }, req);

    return res.status(200).json({
      success: true,
      message: `Setting '${key}' updated successfully.`,
      setting
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update setting.',
      error: error.message
    });
  }
};
