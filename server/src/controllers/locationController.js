const LocationRecord = require('../models/LocationRecord');
const Geofence = require('../models/Geofence');
const Alert = require('../models/Alert');
const { getDistanceInMeters } = require('../utils/geoUtils');

// POST /api/location (Record new location update)
exports.recordLocation = async (req, res) => {
  try {
    const { childId, latitude, longitude, accuracy } = req.body;
    const targetChildId = childId || req.user.childId;

    if (!targetChildId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'childId, latitude, and longitude are required.'
      });
    }

    const record = await LocationRecord.create({
      tenantId: req.tenantId,
      childId: targetChildId,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      timestamp: new Date()
    });

    // Evaluate active geofences for this child
    const geofences = await Geofence.find({
      tenantId: req.tenantId,
      childId: targetChildId,
      isActive: true
    });

    for (const geofence of geofences) {
      const distance = getDistanceInMeters(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;

      // Check last recent geofence alert to avoid spam
      const lastAlert = await Alert.findOne({
        tenantId: req.tenantId,
        childId: targetChildId,
        type: { $in: ['geofence_entered', 'geofence_exited'] },
        title: { $regex: geofence.name, $options: 'i' }
      }).sort({ createdAt: -1 });

      if (isInside && (!lastAlert || lastAlert.type === 'geofence_exited')) {
        await Alert.create({
          tenantId: req.tenantId,
          childId: targetChildId,
          type: 'geofence_entered',
          title: `Entered Safe Zone: ${geofence.name}`,
          message: `Child entered safe zone "${geofence.name}".`,
          severity: 'info'
        });
      } else if (!isInside && lastAlert && lastAlert.type === 'geofence_entered') {
        await Alert.create({
          tenantId: req.tenantId,
          childId: targetChildId,
          type: 'geofence_exited',
          title: `Exited Safe Zone: ${geofence.name}`,
          message: `Child left safe zone "${geofence.name}".`,
          severity: 'high'
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Location recorded successfully.',
      location: record
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record location.',
      error: error.message
    });
  }
};

// GET /api/location/:childId/latest
exports.getLatestLocation = async (req, res) => {
  try {
    const { childId } = req.params;

    const location = await LocationRecord.findOne({
      tenantId: req.tenantId,
      childId
    }).sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location records found for this child.'
      });
    }

    return res.status(200).json({
      success: true,
      location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch latest location.',
      error: error.message
    });
  }
};

// GET /api/location/:childId/history
exports.getLocationHistory = async (req, res) => {
  try {
    const { childId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    const history = await LocationRecord.find({
      tenantId: req.tenantId,
      childId
    })
      .sort({ timestamp: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch location history.',
      error: error.message
    });
  }
};
