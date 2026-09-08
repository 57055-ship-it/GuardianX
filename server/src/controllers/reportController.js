const ScreenTime = require('../models/ScreenTime');
const AppUsage = require('../models/AppUsage');
const Alert = require('../models/Alert');
const SOSEvent = require('../models/SOSEvent');
const RoutineCompletion = require('../models/RoutineCompletion');

exports.getDailyReport = async (req, res) => {
  try {
    const { childId } = req.query;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId query param required.' });
    }

    const screenTimeDoc = await ScreenTime.findOne({
      tenantId: req.tenantId,
      childId,
      date
    });

    const usages = await AppUsage.find({
      tenantId: req.tenantId,
      childId,
      date
    }).sort({ usageDuration: -1 });

    const mostUsedApp = usages.length > 0 ? usages[0] : null;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const alertsCount = await Alert.countDocuments({
      tenantId: req.tenantId,
      childId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const safeZoneEvents = await Alert.countDocuments({
      tenantId: req.tenantId,
      childId,
      type: { $in: ['geofence_entered', 'geofence_exited'] },
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const sosCount = await SOSEvent.countDocuments({
      tenantId: req.tenantId,
      childId,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    const routinesCompleted = await RoutineCompletion.countDocuments({
      tenantId: req.tenantId,
      childId,
      date,
      completionStatus: 'completed'
    });

    return res.status(200).json({
      success: true,
      reportType: 'daily',
      date,
      childId,
      data: {
        totalScreenTimeMinutes: screenTimeDoc ? screenTimeDoc.totalDuration : 0,
        mostUsedApp: mostUsedApp
          ? { name: mostUsedApp.appName, duration: mostUsedApp.usageDuration }
          : null,
        topApps: usages.slice(0, 5),
        safeZoneEvents,
        totalAlerts: alertsCount,
        sosEvents: sosCount,
        routinesCompleted
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate daily report.',
      error: error.message
    });
  }
};

exports.getWeeklyReport = async (req, res) => {
  try {
    const { childId } = req.query;
    if (!childId) {
      return res.status(400).json({ success: false, message: 'childId query param required.' });
    }

    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const screenTimeDocs = await ScreenTime.find({
      tenantId: req.tenantId,
      childId,
      date: { $in: dates }
    });

    const dailyScreenTimes = dates.map((d) => {
      const found = screenTimeDocs.find((st) => st.date === d);
      return {
        date: d,
        totalDuration: found ? found.totalDuration : 0
      };
    });

    const totalMinutes = dailyScreenTimes.reduce((acc, curr) => acc + curr.totalDuration, 0);
    const averageScreenTime = Math.round(totalMinutes / 7);

    const usages = await AppUsage.find({
      tenantId: req.tenantId,
      childId,
      date: { $in: dates }
    });

    // Aggregate app usage across week
    const appMap = {};
    usages.forEach((u) => {
      if (!appMap[u.appName]) appMap[u.appName] = 0;
      appMap[u.appName] += u.usageDuration;
    });

    const topWeeklyApps = Object.keys(appMap)
      .map((key) => ({ name: key, duration: appMap[key] }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalAlerts = await Alert.countDocuments({
      tenantId: req.tenantId,
      childId,
      createdAt: { $gte: sevenDaysAgo }
    });

    const totalSOS = await SOSEvent.countDocuments({
      tenantId: req.tenantId,
      childId,
      timestamp: { $gte: sevenDaysAgo }
    });

    const totalRoutines = await RoutineCompletion.countDocuments({
      tenantId: req.tenantId,
      childId,
      date: { $in: dates },
      completionStatus: 'completed'
    });

    return res.status(200).json({
      success: true,
      reportType: 'weekly',
      startDate: dates[0],
      endDate: dates[6],
      childId,
      data: {
        dailyScreenTimes,
        averageScreenTimeMinutes: averageScreenTime,
        topWeeklyApps,
        totalAlerts,
        totalSOS,
        totalRoutinesCompleted: totalRoutines
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate weekly report.',
      error: error.message
    });
  }
};
