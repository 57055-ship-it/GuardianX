const FamilyRoutine = require('../models/FamilyRoutine');
const RoutineCompletion = require('../models/RoutineCompletion');
const Alert = require('../models/Alert');
const HadithService = require('../services/hadithService');

// POST /api/routines (Parent creates routine)
exports.createRoutine = async (req, res) => {
  try {
    const { childId, title, type, scheduledTime, duration, isActive } = req.body;

    if (!childId || !title || !type || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'childId, title, type, and scheduledTime are required.'
      });
    }

    const routine = await FamilyRoutine.create({
      tenantId: req.tenantId,
      childId,
      title,
      type,
      scheduledTime,
      duration: duration || 15,
      isActive: isActive !== undefined ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Family routine created.',
      routine
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create routine.',
      error: error.message
    });
  }
};

// GET /api/routines
exports.getRoutines = async (req, res) => {
  try {
    const { childId } = req.query;
    const targetChildId = childId || req.user.childId;
    const query = { tenantId: req.tenantId };

    if (targetChildId) query.childId = targetChildId;

    const routines = await FamilyRoutine.find(query).sort({ scheduledTime: 1 });
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch completion status for today
    const completions = await RoutineCompletion.find({
      tenantId: req.tenantId,
      ...(targetChildId && { childId: targetChildId }),
      date: todayStr
    });

    const routinesWithStatus = routines.map((r) => {
      const comp = completions.find((c) => c.routineId.toString() === r._id.toString());
      return {
        ...r.toObject(),
        completion: comp || null,
        isCompletedToday: comp ? comp.completionStatus === 'completed' : false
      };
    });

    return res.status(200).json({
      success: true,
      count: routinesWithStatus.length,
      date: todayStr,
      routines: routinesWithStatus
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch routines.',
      error: error.message
    });
  }
};

// POST /api/routines/complete (Child completes routine)
exports.completeRoutine = async (req, res) => {
  try {
    const { routineId, childId } = req.body;
    const targetChildId = childId || req.user.childId;
    const todayStr = new Date().toISOString().split('T')[0];

    if (!routineId || !targetChildId) {
      return res.status(400).json({
        success: false,
        message: 'routineId and childId are required.'
      });
    }

    const routine = await FamilyRoutine.findOne({
      _id: routineId,
      tenantId: req.tenantId
    });

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found.' });
    }

    const completion = await RoutineCompletion.findOneAndUpdate(
      {
        tenantId: req.tenantId,
        childId: targetChildId,
        routineId,
        date: todayStr
      },
      {
        completedAt: new Date(),
        completionStatus: 'completed'
      },
      { upsert: true, new: true }
    );

    // Notify Parent
    await Alert.create({
      tenantId: req.tenantId,
      childId: targetChildId,
      type: 'routine_completed',
      title: `Routine Completed: ${routine.title}`,
      message: `Child completed routine "${routine.title}".`,
      severity: 'info'
    });

    return res.status(200).json({
      success: true,
      message: 'Routine marked as completed!',
      completion
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete routine.',
      error: error.message
    });
  }
};

// GET /api/routines/hadith/today
exports.getHadithContent = async (req, res) => {
  try {
    const hadith = HadithService.getRandomHadith();
    return res.status(200).json({
      success: true,
      hadith
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch Hadith content.',
      error: error.message
    });
  }
};
