const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { childId, isRead, severity } = req.query;
    const query = { tenantId: req.tenantId };

    if (childId) query.childId = childId;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (severity) query.severity = severity;

    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(100);
    const unreadCount = await Alert.countDocuments({
      tenantId: req.tenantId,
      ...(childId && { childId }),
      isRead: false
    });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      unreadCount,
      alerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts.',
      error: error.message
    });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const { childId, type, title, message, severity } = req.body;

    if (!childId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'childId, type, title, and message are required.'
      });
    }

    const alert = await Alert.create({
      tenantId: req.tenantId,
      childId,
      type,
      title,
      message,
      severity: severity || 'info'
    });

    return res.status(201).json({
      success: true,
      message: 'Alert created.',
      alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create alert.',
      error: error.message
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      { isRead: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert marked as read.',
      alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update alert.',
      error: error.message
    });
  }
};
