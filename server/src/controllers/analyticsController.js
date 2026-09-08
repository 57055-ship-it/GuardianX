const ScreenTime = require('../models/ScreenTime');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const SOSEvent = require('../models/SOSEvent');

exports.getSafetyInsights = async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId query param required.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const insights = [];

    // 1. Screen time anomaly check
    const todayScreenTime = await ScreenTime.findOne({
      tenantId: req.tenantId,
      childId,
      date: todayStr
    });

    const dates = [];
    for (let i = 7; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const pastScreenTimes = await ScreenTime.find({
      tenantId: req.tenantId,
      childId,
      date: { $in: dates }
    });

    const totalPast = pastScreenTimes.reduce((acc, curr) => acc + curr.totalDuration, 0);
    const avgPast = pastScreenTimes.length > 0 ? Math.round(totalPast / 7) : 120;
    const currentMins = todayScreenTime ? todayScreenTime.totalDuration : 0;

    if (currentMins > 0 && avgPast > 0 && currentMins >= avgPast * 1.4) {
      const pctIncrease = Math.round(((currentMins - avgPast) / avgPast) * 100);
      insights.push({
        type: 'high_screen_time',
        severity: 'medium',
        title: 'Elevated Screen Time Detected',
        rationale: `Today's screen time is ${Math.floor(currentMins / 60)}h ${currentMins % 60}m, which is ${pctIncrease}% above the child's weekly daily average of ${Math.floor(avgPast / 60)}h ${avgPast % 60}m.`
      });
    }

    // 2. Device offline check
    const device = await Device.findOne({ tenantId: req.tenantId, childId });
    if (device && device.lastSeen) {
      const hoursOffline = (Date.now() - new Date(device.lastSeen).getTime()) / (1000 * 60 * 60);
      if (hoursOffline >= 4) {
        insights.push({
          type: 'device_offline',
          severity: 'high',
          title: 'Unusual Device Inactivity',
          rationale: `Device has been offline/inactive for ${hoursOffline.toFixed(1)} hours (last seen ${new Date(device.lastSeen).toLocaleTimeString()}).`
        });
      }
    }

    // 3. Safe zone exits check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const safeZoneExits = await Alert.countDocuments({
      tenantId: req.tenantId,
      childId,
      type: 'geofence_exited',
      createdAt: { $gte: startOfDay }
    });

    if (safeZoneExits >= 3) {
      insights.push({
        type: 'frequent_safe_zone_exits',
        severity: 'high',
        title: 'Frequent Safe Zone Exits',
        rationale: `Child has exited designated safe zones ${safeZoneExits} times today, which is higher than usual.`
      });
    }

    // 4. SOS distress check
    const sosCount = await SOSEvent.countDocuments({
      tenantId: req.tenantId,
      childId,
      timestamp: { $gte: startOfDay }
    });

    if (sosCount > 0) {
      insights.push({
        type: 'sos_distress',
        severity: 'critical',
        title: 'Emergency SOS Signal Triggered',
        rationale: `Child activated the emergency SOS distress button ${sosCount} time(s) today.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'normal_status',
        severity: 'info',
        title: 'Normal Safety Patterns',
        rationale: "All safety indicators are within normal parameters. Child's activity and screen time match weekly benchmarks."
      });
    }

    return res.status(200).json({
      success: true,
      childId,
      insightsCount: insights.length,
      insights
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute safety insights.',
      error: error.message
    });
  }
};
