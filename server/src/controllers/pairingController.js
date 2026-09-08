const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PairingCode = require('../models/PairingCode');
const ChildProfile = require('../models/ChildProfile');
const Device = require('../models/Device');
const User = require('../models/User');

const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// POST /api/pairing/create (Parent creates temporary pairing code)
exports.createPairingCode = async (req, res) => {
  try {
    const { childId } = req.body;
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId is required.' });
    }

    const child = await ChildProfile.findOne({ _id: childId, tenantId: req.tenantId });
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found.' });
    }

    // Deactivate previous unused pairing codes for this child
    await PairingCode.updateMany(
      { tenantId: req.tenantId, childId, used: false },
      { used: true }
    );

    const codeStr = generateRandomCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const pairingCode = await PairingCode.create({
      tenantId: req.tenantId,
      parentId: req.user.id,
      childId: child._id,
      code: codeStr,
      expiresAt,
      used: false
    });

    return res.status(201).json({
      success: true,
      message: 'Pairing code generated successfully.',
      pairingCode: {
        code: pairingCode.code,
        expiresAt: pairingCode.expiresAt,
        childId: pairingCode.childId
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate pairing code.',
      error: error.message
    });
  }
};

// POST /api/pairing/join (Child enters pairing code to link device)
exports.joinPairingCode = async (req, res) => {
  try {
    const { code, deviceName, deviceIdentifier, platform } = req.body;

    if (!code || !deviceIdentifier) {
      return res.status(400).json({
        success: false,
        message: 'Pairing code and deviceIdentifier are required.'
      });
    }

    const pairingCode = await PairingCode.findOne({
      code: code.trim().toUpperCase(),
      used: false
    });

    if (!pairingCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or already used pairing code.'
      });
    }

    if (new Date() > new Date(pairingCode.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Pairing code has expired. Please request a new code from parent.'
      });
    }

    const childProfile = await ChildProfile.findOne({
      _id: pairingCode.childId,
      tenantId: pairingCode.tenantId
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Associated child profile not found.'
      });
    }

    // 1. Create or Find User account for Child
    const childEmail = `child_${childProfile._id}@guardianx.local`;
    let childUser = await User.findOne({ email: childEmail });

    if (!childUser) {
      const defaultPasswordHash = await bcrypt.hash('ChildPass123!', 10);
      childUser = await User.create({
        tenantId: pairingCode.tenantId,
        role: 'child',
        name: childProfile.name,
        email: childEmail,
        passwordHash: defaultPasswordHash
      });
    }

    // 2. Create/Update Device record
    let device = await Device.findOne({
      tenantId: pairingCode.tenantId,
      childId: childProfile._id,
      deviceIdentifier
    });

    if (!device) {
      device = await Device.create({
        tenantId: pairingCode.tenantId,
        childId: childProfile._id,
        deviceName: deviceName || `${childProfile.name}'s Device`,
        platform: platform || 'android',
        deviceIdentifier,
        batteryLevel: 100,
        isOnline: true,
        lastSeen: new Date()
      });
    } else {
      device.isOnline = true;
      device.lastSeen = new Date();
      await device.save();
    }

    // 3. Update Child Profile
    childProfile.userId = childUser._id;
    childProfile.deviceId = device._id;
    childProfile.profileStatus = 'paired';
    await childProfile.save();

    // 4. Mark code as used
    pairingCode.used = true;
    await pairingCode.save();

    // 5. Generate Child JWT Tokens
    const payload = {
      id: childUser._id,
      tenantId: childUser.tenantId,
      role: 'child',
      childId: childProfile._id,
      email: childUser.email,
      name: childUser.name
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'guardianx_super_secret_jwt_access_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET || 'guardianx_super_secret_jwt_refresh_key_2026',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Device paired successfully!',
      tokens: { accessToken, refreshToken },
      child: {
        id: childUser._id,
        childProfileId: childProfile._id,
        tenantId: childProfile.tenantId,
        name: childProfile.name
      },
      device
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Device pairing failed.',
      error: error.message
    });
  }
};
