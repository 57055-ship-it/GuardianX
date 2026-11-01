const mongoose = require('mongoose');
const AppUsage = require('../models/AppUsage');
const ScreenTime = require('../models/ScreenTime');
const Alert = require('../models/Alert');
const ChildProfile = require('../models/ChildProfile');

// POST /api/usage/record (Record app usage batch or single entry)
exports.recordAppUsage = async (req, res) => {
  try {
    const { childId, packageName, appName, usageDuration, sessionCount, date, usages } = req.body;
    let targetChildId = childId || (req.user && req.user.childId ? req.user.childId.toString() : null);
    const usageDate = date || new Date().toISOString().split('T')[0];

    // Resolve canonical ChildProfile ID (whether passed as ChildProfile._id or child User._id)
    const lookupIds = [];
    if (targetChildId && mongoose.Types.ObjectId.isValid(targetChildId)) {
      lookupIds.push(new mongoose.Types.ObjectId(targetChildId));
    }
    if (req.user && req.user.childId && mongoose.Types.ObjectId.isValid(req.user.childId)) {
      lookupIds.push(new mongoose.Types.ObjectId(req.user.childId));
    }
    if (req.user && (req.user._id || req.user.id) && mongoose.Types.ObjectId.isValid(req.user._id || req.user.id)) {
      lookupIds.push(new mongoose.Types.ObjectId(req.user._id || req.user.id));
    }

    if (lookupIds.length > 0) {
      const childProfile = await ChildProfile.findOne({
        tenantId: req.tenantId,
        $or: [
          { _id: { $in: lookupIds } },
          { userId: { $in: lookupIds } }
        ]
      });
      if (childProfile) {
        targetChildId = childProfile._id.toString();
      }
    }

    if (!targetChildId) {
      return res.status(400).json({
        success: false,
        message: 'childId is required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetChildId)) {
      return res.status(400).json({
        success: false,
        message: 'childId must be a valid ObjectId.'
      });
    }

    let recordedCount = 0;

    // Handle batch usages array (snapshot of today's app usage stats from Android device)
    if (Array.isArray(usages)) {
      if (usages.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No usage records to process.',
          count: 0,
          totalMinutes: 0
        });
      }

      for (const item of usages) {
        if (!item || typeof item !== 'object') {
          console.warn('[usageController] Skipping invalid record: not an object');
          continue;
        }

        const rawPkg = item.packageName;
        if (!rawPkg || typeof rawPkg !== 'string' || !rawPkg.trim()) {
          console.warn('[usageController] Skipping record: packageName is required and must be non-empty string');
          continue;
        }

        const rawApp = item.appName;
        if (!rawApp || typeof rawApp !== 'string' || !rawApp.trim()) {
          console.warn(`[usageController] Skipping record (${rawPkg}): appName is required and must be non-empty string`);
          continue;
        }

        const rawDuration = item.usageDuration !== undefined ? item.usageDuration : item.durationMinutes;
        if (rawDuration === undefined || rawDuration === null) {
          console.warn(`[usageController] Skipping record (${rawPkg}): usageDuration is required`);
          continue;
        }

        const duration = Number(rawDuration);
        if (isNaN(duration) || duration < 0) {
          console.warn(`[usageController] Skipping record (${rawPkg}): usageDuration must be a non-negative number`);
          continue;
        }

        await AppUsage.findOneAndUpdate(
          {
            tenantId: req.tenantId,
            childId: targetChildId,
            packageName: rawPkg.trim(),
            date: usageDate
          },
          {
            $set: {
              appName: rawApp.trim(),
              usageDuration: Math.round(duration),
              sessionCount: Number(item.sessionCount || 1)
            }
          },
          { upsert: true, new: true }
        );
        recordedCount++;
      }
    } else {
      // Single entry mode validation
      if (!packageName || typeof packageName !== 'string' || !packageName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'packageName is required.'
        });
      }

      if (!appName || typeof appName !== 'string' || !appName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'appName is required.'
        });
      }

      if (usageDuration === undefined || usageDuration === null) {
        return res.status(400).json({
          success: false,
          message: 'usageDuration is required.'
        });
      }

      const duration = Number(usageDuration);
      if (isNaN(duration) || duration < 0) {
        return res.status(400).json({
          success: false,
          message: 'usageDuration must be a non-negative number.'
        });
      }

      await AppUsage.findOneAndUpdate(
        {
          tenantId: req.tenantId,
          childId: targetChildId,
          packageName: packageName.trim(),
          date: usageDate
        },
        {
          $set: {
            appName: appName.trim(),
            usageDuration: Math.round(duration),
            sessionCount: Number(sessionCount || 1)
          }
        },
        { upsert: true, new: true }
      );
      recordedCount = 1;
    }

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
        $set: { totalDuration: totalMinutes }
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
      message: `App usage recorded successfully (${recordedCount} items).`,
      count: recordedCount,
      totalMinutes,
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

// GET /api/usage/app-usage/:childId
exports.getAppUsage = async (req, res) => {
  try {
    const { childId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: 'childId must be a valid ObjectId.'
      });
    }

    // Resolve ChildProfile to match either ChildProfile._id or Child User._id
    const childProfile = await ChildProfile.findOne({
      tenantId: req.tenantId,
      $or: [
        { _id: childId },
        { userId: childId }
      ]
    });

    const candidateIds = [new mongoose.Types.ObjectId(childId)];
    if (childProfile) {
      if (!candidateIds.some(id => id.equals(childProfile._id))) {
        candidateIds.push(childProfile._id);
      }
      if (childProfile.userId && !candidateIds.some(id => id.equals(childProfile.userId))) {
        candidateIds.push(childProfile.userId);
      }
    }

    const date = req.query.date || new Date().toISOString().split('T')[0];

    let usages = await AppUsage.find({
      tenantId: req.tenantId,
      childId: { $in: candidateIds },
      date
    }).sort({ usageDuration: -1 });

    // If no usages found for specific date, check latest available date for this child
    let effectiveDate = date;
    if (usages.length === 0 && !req.query.date) {
      const latestUsage = await AppUsage.findOne({
        tenantId: req.tenantId,
        childId: { $in: candidateIds }
      }).sort({ createdAt: -1 });

      if (latestUsage && latestUsage.date) {
        effectiveDate = latestUsage.date;
        usages = await AppUsage.find({
          tenantId: req.tenantId,
          childId: { $in: candidateIds },
          date: effectiveDate
        }).sort({ usageDuration: -1 });
      }
    }

    // Check blocked apps set from ChildProfile
    const blockedSet = new Set(
      ((childProfile && Array.isArray(childProfile.blockedApps)) ? childProfile.blockedApps : [])
        .map(b => b.packageName)
    );

    // Format normalized response so both mobile (usages / usageDuration)
    // and web (appUsage / durationMinutes) consume seamlessly
    const appUsage = usages.map((u) => ({
      _id: u._id,
      id: u._id,
      appName: u.appName,
      packageName: u.packageName,
      durationMinutes: u.usageDuration,
      usageDuration: u.usageDuration,
      sessionCount: u.sessionCount,
      date: u.date,
      isBlocked: blockedSet.has(u.packageName)
    }));

    const enrichedUsages = usages.map((u) => {
      const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
      obj.isBlocked = blockedSet.has(u.packageName);
      return obj;
    });

    return res.status(200).json({
      success: true,
      date: effectiveDate,
      count: usages.length,
      usages: enrichedUsages, // Mobile AppUsageModel contract
      appUsage, // Web AppUsageItem contract
      blockedApps: childProfile?.blockedApps || [],
      isIOSUnavailable: false
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch app usage.',
      error: error.message
    });
  }
};

// POST /api/usage/block-app (Block or unblock an app for a child)
exports.toggleBlockApp = async (req, res) => {
  try {
    const { childId, packageName, appName } = req.body;
    const shouldBlock = req.body.isBlocked !== undefined
      ? (req.body.isBlocked === true || req.body.isBlocked === 'true')
      : (req.body.block === true || req.body.block === 'true');

    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid childId is required.'
      });
    }
    if (!packageName || typeof packageName !== 'string' || !packageName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'packageName is required.'
      });
    }

    const trimmedPkg = packageName.trim();
    const friendlyName = (appName || trimmedPkg).trim();

    const childProfile = await ChildProfile.findOne({
      tenantId: req.tenantId,
      $or: [
        { _id: childId },
        { userId: childId }
      ]
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Child profile not found.'
      });
    }

    if (!Array.isArray(childProfile.blockedApps)) {
      childProfile.blockedApps = [];
    }

    if (shouldBlock) {
      const exists = childProfile.blockedApps.some((b) => b.packageName === trimmedPkg);
      if (!exists) {
        childProfile.blockedApps.push({
          packageName: trimmedPkg,
          appName: friendlyName,
          blockedAt: new Date()
        });
      }
      await AppUsage.updateMany(
        { tenantId: req.tenantId, childId: childProfile._id, packageName: trimmedPkg },
        { $set: { isBlocked: true } }
      );

      // Create an Alert for the family
      await Alert.create({
        tenantId: req.tenantId,
        childId: childProfile._id,
        type: 'app_blocked',
        title: 'App Blocked by Parent',
        message: `${friendlyName} has been blocked for ${childProfile.name}.`,
        severity: 'info'
      });
    } else {
      childProfile.blockedApps = childProfile.blockedApps.filter(
        (b) => b.packageName !== trimmedPkg
      );
      await AppUsage.updateMany(
        { tenantId: req.tenantId, childId: childProfile._id, packageName: trimmedPkg },
        { $set: { isBlocked: false } }
      );
    }

    await childProfile.save();

    return res.status(200).json({
      success: true,
      message: shouldBlock
        ? `${friendlyName} is now blocked.`
        : `${friendlyName} has been unblocked.`,
      packageName: trimmedPkg,
      appName: friendlyName,
      isBlocked: shouldBlock,
      blockedApps: childProfile.blockedApps
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update app blocking status.',
      error: error.message
    });
  }
};

// GET /api/usage/blocked-apps/:childId
exports.getBlockedApps = async (req, res) => {
  try {
    const { childId } = req.params;
    if (!childId || !mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid childId is required.'
      });
    }

    const childProfile = await ChildProfile.findOne({
      tenantId: req.tenantId,
      $or: [
        { _id: childId },
        { userId: childId }
      ]
    });

    if (!childProfile) {
      return res.status(404).json({
        success: false,
        message: 'Child profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      count: (childProfile.blockedApps || []).length,
      blockedApps: childProfile.blockedApps || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked apps.',
      error: error.message
    });
  }
};

// GET /api/usage/screen-time/:childId
exports.getScreenTime = async (req, res) => {
  try {
    const { childId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(childId)) {
      return res.status(400).json({
        success: false,
        message: 'childId must be a valid ObjectId.'
      });
    }

    const childProfile = await ChildProfile.findOne({
      tenantId: req.tenantId,
      $or: [
        { _id: childId },
        { userId: childId }
      ]
    });

    const candidateIds = [new mongoose.Types.ObjectId(childId)];
    if (childProfile) {
      if (!candidateIds.some(id => id.equals(childProfile._id))) {
        candidateIds.push(childProfile._id);
      }
      if (childProfile.userId && !candidateIds.some(id => id.equals(childProfile.userId))) {
        candidateIds.push(childProfile.userId);
      }
    }

    const date = req.query.date || new Date().toISOString().split('T')[0];

    let screenTime = await ScreenTime.findOne({
      tenantId: req.tenantId,
      childId: { $in: candidateIds },
      date
    });

    let duration = screenTime ? screenTime.totalDuration : 0;
    if (duration === 0) {
      const usages = await AppUsage.find({
        tenantId: req.tenantId,
        childId: { $in: candidateIds },
        date
      });
      if (usages.length > 0) {
        duration = usages.reduce((acc, curr) => acc + (curr.usageDuration || 0), 0);
      }
    }

    return res.status(200).json({
      success: true,
      date,
      totalDuration: duration, // Mobile UsageRepository contract
      totalScreenTimeMinutes: duration // Web usageApi contract
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch screen time.',
      error: error.message
    });
  }
};
