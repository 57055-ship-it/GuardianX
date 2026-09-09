const LocationRecord = require('../models/LocationRecord');
const Geofence = require('../models/Geofence');
const Alert = require('../models/Alert');
const ChildProfile = require('../models/ChildProfile');
const { getDistanceInMeters } = require('../utils/geoUtils');

// STALE_THRESHOLD: 5 minutes in milliseconds
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

// POST /api/location (Record real GPS location update)
exports.recordLocation = async (req, res) => {
  try {
    const { childId, latitude, longitude, accuracy, speed, altitude, heading, timestamp } = req.body;

    // Security & Authorization Scoping
    let targetChildId = childId;
    if (req.user.role === 'child') {
      targetChildId = req.user.childId || req.user.id;
    }

    if (!targetChildId) {
      return res.status(400).json({
        success: false,
        message: 'childId is required.'
      });
    }

    // Strict GPS Coordinates Validation
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    const accNum = Number(accuracy ?? 0);

    if (
      latitude === undefined ||
      longitude === undefined ||
      isNaN(latNum) ||
      isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180 ||
      accNum < 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates or accuracy value.'
      });
    }

    // Verify targetChildId belongs to tenant
    const childProfile = await ChildProfile.findOne({
      _id: targetChildId,
      tenantId: req.tenantId
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Associated child profile not found.'
      });
    }

    const recordTimestamp = timestamp ? new Date(timestamp) : new Date();

    const record = await LocationRecord.create({
      tenantId: req.tenantId,
      childId: childProfile._id,
      latitude: latNum,
      longitude: lngNum,
      accuracy: accNum,
      speed: Number(speed ?? 0),
      altitude: Number(altitude ?? 0),
      heading: Number(heading ?? 0),
      timestamp: recordTimestamp
    });

    // Evaluate active geofences for this child
    const geofences = await Geofence.find({
      tenantId: req.tenantId,
      isActive: true
    });

    for (const geofence of geofences) {
      const distance = getDistanceInMeters(
        latNum,
        lngNum,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;

      const lastAlert = await Alert.findOne({
        tenantId: req.tenantId,
        childId: childProfile._id,
        type: { $in: ['geofence_entered', 'geofence_exited'] },
        title: { $regex: geofence.name, $options: 'i' }
      }).sort({ createdAt: -1 });

      if (isInside && (!lastAlert || lastAlert.type === 'geofence_exited')) {
        await Alert.create({
          tenantId: req.tenantId,
          childId: childProfile._id,
          type: 'geofence_entered',
          title: `Entered Safe Zone: ${geofence.name}`,
          message: `${childProfile.name} entered safe zone "${geofence.name}".`,
          severity: 'info'
        });
      } else if (!isInside && lastAlert && lastAlert.type === 'geofence_entered') {
        await Alert.create({
          tenantId: req.tenantId,
          childId: childProfile._id,
          type: 'geofence_exited',
          title: `Exited Safe Zone: ${geofence.name}`,
          message: `${childProfile.name} left safe zone "${geofence.name}".`,
          severity: 'high'
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Real location recorded successfully.',
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

    // Verify child belongs to authenticated tenant
    const childProfile = await ChildProfile.findOne({
      _id: childId,
      tenantId: req.tenantId
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Child profile not found or unauthorized.'
      });
    }

    const location = await LocationRecord.findOne({
      tenantId: req.tenantId,
      childId: childProfile._id
    }).sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'No location records found for this child.'
      });
    }

    const ageMs = Date.now() - new Date(location.timestamp).getTime();
    const isStale = ageMs > STALE_THRESHOLD_MS;

    return res.status(200).json({
      success: true,
      location,
      isStale,
      ageSeconds: Math.floor(ageMs / 1000)
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
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    // Verify child belongs to authenticated tenant
    const childProfile = await ChildProfile.findOne({
      _id: childId,
      tenantId: req.tenantId
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Child profile not found or unauthorized.'
      });
    }

    const history = await LocationRecord.find({
      tenantId: req.tenantId,
      childId: childProfile._id
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
