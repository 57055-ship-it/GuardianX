const SOSEvent = require('../models/SOSEvent');
const Alert = require('../models/Alert');
const LocationRecord = require('../models/LocationRecord');

exports.createSOSEvent = async (req, res) => {
  try {
    const { childId, latitude, longitude } = req.body;
    const targetChildId = childId || req.user.childId;

    if (!targetChildId) {
      return res.status(400).json({ success: false, message: 'childId is required.' });
    }

    let lat = latitude;
    let lng = longitude;

    // Fallback to latest known location if not provided
    if (lat === undefined || lng === undefined) {
      const latestLoc = await LocationRecord.findOne({
        tenantId: req.tenantId,
        childId: targetChildId
      }).sort({ timestamp: -1 });

      if (latestLoc) {
        lat = latestLoc.latitude;
        lng = latestLoc.longitude;
      } else {
        lat = 0;
        lng = 0;
      }
    }

    const sosEvent = await SOSEvent.create({
      tenantId: req.tenantId,
      childId: targetChildId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date(),
      status: 'active'
    });

    // Create high priority critical Alert for Parent
    const alert = await Alert.create({
      tenantId: req.tenantId,
      childId: targetChildId,
      type: 'sos',
      title: '🚨 EMERGENCY SOS TRIGGERED!',
      message: `Emergency distress signal triggered by child! Location: (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      severity: 'critical'
    });

    return res.status(201).json({
      success: true,
      message: 'SOS distress signal transmitted to parent!',
      sosEvent,
      alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to transmit SOS signal.',
      error: error.message
    });
  }
};

exports.getSOSEvents = async (req, res) => {
  try {
    const { childId } = req.params;

    const events = await SOSEvent.find({
      tenantId: req.tenantId,
      childId
    }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS events.',
      error: error.message
    });
  }
};

exports.resolveSOSEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await SOSEvent.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { status: 'resolved' },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'SOS event not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'SOS event marked as resolved.',
      event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve SOS event.',
      error: error.message
    });
  }
};
