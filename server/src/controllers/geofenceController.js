const Geofence = require('../models/Geofence');

exports.createGeofence = async (req, res) => {
  try {
    const { childId, name, latitude, longitude, radius, isActive } = req.body;

    if (!childId || !name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'childId, name, latitude, and longitude are required.'
      });
    }

    const { canCreateSafeZone } = require('../services/entitlementService');
    const check = await canCreateSafeZone(req.tenantId);
    if (!check.allowed) {
      return res.status(403).json({
        success: false,
        message: check.message
      });
    }

    const geofence = await Geofence.create({
      tenantId: req.tenantId,
      childId,
      name,
      latitude,
      longitude,
      radius: radius || 200,
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Geofence created successfully.',
      geofence
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create geofence.',
      error: error.message
    });
  }
};

exports.getGeofences = async (req, res) => {
  try {
    const { childId } = req.query;
    const query = { tenantId: req.tenantId };

    if (childId) {
      query.childId = childId;
    }

    const geofences = await Geofence.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: geofences.length,
      geofences
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch geofences.',
      error: error.message
    });
  }
};

exports.updateGeofence = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, radius, isActive } = req.body;

    const geofence = await Geofence.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      {
        ...(name && { name }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(radius !== undefined && { radius }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true }
    );

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Geofence updated.',
      geofence
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update geofence.',
      error: error.message
    });
  }
};

exports.deleteGeofence = async (req, res) => {
  try {
    const { id } = req.params;

    const geofence = await Geofence.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId
    });

    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Geofence deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete geofence.',
      error: error.message
    });
  }
};
