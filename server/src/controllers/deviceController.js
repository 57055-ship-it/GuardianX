const Device = require('../models/Device');
const ChildProfile = require('../models/ChildProfile');
const Alert = require('../models/Alert');

exports.updateHeartbeat = async (req, res) => {
  try {
    const { childId, batteryLevel, isOnline, deviceName, platform } = req.body;
    let targetId = childId || (req.user ? req.user.childId || req.user.id : null);

    if (!targetId) {
      return res.status(400).json({ success: false, message: 'childId is required.' });
    }

    // Resolve ChildProfile whether targetId is ChildProfile._id or User._id
    let childProfile = await ChildProfile.findOne({
      $or: [
        { _id: targetId },
        { userId: targetId },
        ...(req.user ? [{ userId: req.user.id }] : []),
        ...(req.user && req.user.childId ? [{ _id: req.user.childId }] : [])
      ]
    });

    const actualChildId = childProfile ? childProfile._id : targetId;
    const actualTenantId = childProfile ? childProfile.tenantId : req.tenantId;

    let device = await Device.findOne({
      $or: [
        { childId: actualChildId },
        ...(req.body.deviceIdentifier ? [{ deviceIdentifier: req.body.deviceIdentifier }] : [])
      ]
    });

    if (!device) {
      device = new Device({
        tenantId: actualTenantId,
        childId: actualChildId,
        deviceIdentifier: req.body.deviceIdentifier || `dev_${actualChildId}`
      });
    }

    if (batteryLevel !== undefined && batteryLevel !== null) {
      device.batteryLevel = parseInt(batteryLevel, 10);
    }
    if (isOnline !== undefined) device.isOnline = isOnline;
    if (deviceName) device.deviceName = deviceName;
    if (platform) device.platform = platform;
    device.lastSeen = new Date();

    await device.save();

    // Link device record to child profile
    if (childProfile) {
      childProfile.deviceId = device._id;
      childProfile.profileStatus = 'paired';
      await childProfile.save();
    }

    // Check low battery trigger
    if (batteryLevel !== undefined && batteryLevel <= 15) {
      const existingAlert = await Alert.findOne({
        tenantId: req.tenantId,
        childId: targetChildId,
        type: 'low_battery',
        createdAt: { $gt: new Date(Date.now() - 3600000) } // past 1 hour
      });

      if (!existingAlert) {
        await Alert.create({
          tenantId: req.tenantId,
          childId: targetChildId,
          type: 'low_battery',
          title: 'Low Battery Alert',
          message: `Child's device battery is critically low (${batteryLevel}%).`,
          severity: 'medium'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Device status updated.',
      device
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update device status.',
      error: error.message
    });
  }
};

exports.getDeviceStatus = async (req, res) => {
  try {
    const { childId } = req.params;

    const device = await Device.findOne({
      tenantId: req.tenantId,
      childId
    });

    if (!device) {
      return res.status(404).json({ success: false, message: 'Device status not found.' });
    }

    return res.status(200).json({
      success: true,
      device
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch device status.',
      error: error.message
    });
  }
};
