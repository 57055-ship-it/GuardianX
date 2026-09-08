const ChildProfile = require('../models/ChildProfile');
const Tenant = require('../models/Tenant');
const Device = require('../models/Device');
const { ENTITLEMENTS } = require('../middleware/entitlementMiddleware');

exports.createChild = async (req, res) => {
  try {
    const { name, dateOfBirth } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Child name is required.' });
    }

    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }

    const currentChildrenCount = await ChildProfile.countDocuments({ tenantId: req.tenantId });
    const maxLimit = ENTITLEMENTS[tenant.plan]?.maxChildren || 1;

    if (currentChildrenCount >= maxLimit) {
      return res.status(403).json({
        success: false,
        message: `Child profile limit reached (${currentChildrenCount}/${maxLimit}) for ${tenant.plan} plan. Please upgrade your plan to add more children.`
      });
    }

    const child = await ChildProfile.create({
      tenantId: req.tenantId,
      parentId: req.user.id,
      name,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      profileStatus: 'unpaired'
    });

    return res.status(201).json({
      success: true,
      message: 'Child profile created successfully.',
      child
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create child profile.',
      error: error.message
    });
  }
};

exports.getChildren = async (req, res) => {
  try {
    const children = await ChildProfile.find({ tenantId: req.tenantId })
      .populate('deviceId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: children.length,
      children
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch children.',
      error: error.message
    });
  }
};

exports.getChildById = async (req, res) => {
  try {
    const child = await ChildProfile.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    }).populate('deviceId');

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    return res.status(200).json({
      success: true,
      child
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch child profile.',
      error: error.message
    });
  }
};

exports.updateChild = async (req, res) => {
  try {
    const { name, dateOfBirth } = req.body;

    const child = await ChildProfile.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { name, ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }) },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Child profile updated.',
      child
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update child profile.',
      error: error.message
    });
  }
};

exports.deleteChild = async (req, res) => {
  try {
    const child = await ChildProfile.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId
    });

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    // Clean up associated device
    if (child.deviceId) {
      await Device.findByIdAndDelete(child.deviceId);
    }

    return res.status(200).json({
      success: true,
      message: 'Child profile deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete child profile.',
      error: error.message
    });
  }
};
