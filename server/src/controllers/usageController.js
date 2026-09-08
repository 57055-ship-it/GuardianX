const AppUsage = require('../models/AppUsage');
const ScreenTime = require('../models/ScreenTime');
const Alert = require('../models/Alert');

// POST /api/usage (Record app usage batch or single entry)
exports.recordAppUsage = async (req, res) => {
  try {
    const { childId, packageName, appName, usageDuration, sessionCount, date } = req.body;
    const targetChildId = childId || req.user.childId;
    const usageDate = date || new Date().toISOString().split('T')[0];

    if (!targetChildId || !packageName || !appName || usageDuration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'childId, packageName, appName, and usageDuration are required.'
      });
    }

    // Upsert app usage entry for the date
    const appUsage = await AppUsage.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        childId: targetChildId,
        packageName,
        date: usageDate
      },
      {
        $set: { appName },
        $inc: { usageDuration: Number(usageDuration), sessionCount: Number(sessionCount || 1) }
      },
      { upsert: true, new: true }
    );

    // Calculate updated total screen time for the day
    const allUsages = await AppUsage.find({
      tenantId: req.tenantId,
      childId: targetChildId,
      date: usageDate
    });

    const totalMinutes = allUsages.reduce((acc, curr) => acc + (curr.usageDuration || 0), 0);

    const screenTime = await ScreenTime.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        childId: targetChildId,
        date: usageDate
      },
      {
        totalDuration: totalMinutes
      },
      { upsert: true, new: true }
    );

    // Check threshold alert (e.g. > 180 mins = 3h)
    if (totalMinutes >= 180) {
      const existingAlert = await Alert.findOne({
        tenantId: req.tenantId,
        childId: targetChildId,
        type: 'screen_time_threshold',
        createdAt: { $gt: new Date(new Date().setHours(0, 0, 0, 0)) }
      });

      if (!existingAlert) {
        await Alert.create({
          tenantId: req.tenantId,
          childId: targetChildId,
          type: 'screen_time_threshold',
          title: 'Daily Screen Time Threshold Exceeded',
          message: `Child has exceeded 3 hours of screen time today (${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m).`,
          severity: 'medium'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'App usage recorded.',
      appUsage,
      screenTime
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record app usage.',
      error: error.message
    });
  }
};

// GET /api/usage/:childId
exports.getAppUsage = async (req, res) => {
  try {
    const { childId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const usages = await AppUsage.find({
      tenantId: req.tenantId,
      childId,
      date
    }).sort({ usageDuration: -1 });

    return res.status(200).json({
      success: true,
      date,
      count: usages.length,
      usages
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch app usage.',
      error: error.message
    });
  }
};

// GET /api/screen-time/:childId
exports.getScreenTime = async (req, res) => {
  try {
    const { childId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const screenTime = await ScreenTime.findOne({
      tenantId: req.tenantId,
      childId,
      date
    });

    return res.status(200).json({
      success: true,
      date,
      totalDuration: screenTime ? screenTime.totalDuration : 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch screen time.',
      error: error.message
    });
  }
};
