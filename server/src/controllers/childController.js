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

    const { canCreateChild } = require('../services/entitlementService');
    const check = await canCreateChild(req.tenantId);
    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        message: check.message
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

    const childrenWithDevices = await Promise.all(
      children.map(async (childDoc) => {
        const child = childDoc.toObject();
        if (!child.deviceId) {
          const device = await Device.findOne({
            tenantId: req.tenantId,
            $or: [
              { childId: child._id },
              ...(child.userId ? [{ childId: child.userId }] : [])
            ]
          });
          if (device) {
            child.deviceId = device;
            child.profileStatus = 'paired';
            ChildProfile.findByIdAndUpdate(child._id, {
              deviceId: device._id,
              profileStatus: 'paired'
            }).exec();
          }
        if (child.deviceId && typeof child.deviceId === 'object') {
          child.device = child.deviceId;
          child.profileStatus = 'paired';
        }
        return child;
      })
    );

    return res.status(200).json({
      success: true,
      count: childrenWithDevices.length,
      children: childrenWithDevices
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
    const childDoc = await ChildProfile.findOne({
      _id: req.params.id,
      tenantId: req.tenantId
    }).populate('deviceId');

    if (!childDoc) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    const child = childDoc.toObject();
    if (!child.deviceId) {
      const device = await Device.findOne({
        tenantId: req.tenantId,
        $or: [
          { childId: child._id },
          ...(child.userId ? [{ childId: child.userId }] : [])
        ]
      });
      if (device) {
        child.deviceId = device;
        child.profileStatus = 'paired';
        ChildProfile.findByIdAndUpdate(child._id, {
          deviceId: device._id,
          profileStatus: 'paired'
        }).exec();
      }
    }
    if (child.deviceId && typeof child.deviceId === 'object') {
      child.device = child.deviceId;
      child.profileStatus = 'paired';
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
