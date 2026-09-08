const mongoose = require('mongoose');

const RoutineCompletionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChildProfile',
      required: true,
      index: true
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyRoutine',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    completionStatus: {
      type: String,
      enum: ['in_progress', 'completed', 'missed'],
      default: 'in_progress'
    }
  },
  { timestamps: true }
);

RoutineCompletionSchema.index({ tenantId: 1, childId: 1, routineId: 1, date: 1 });

module.exports = mongoose.model('RoutineCompletion', RoutineCompletionSchema);
