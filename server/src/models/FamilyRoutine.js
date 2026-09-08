const mongoose = require('mongoose');

const FamilyRoutineSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['prayer_reminder', 'hadith_session'],
      required: true
    },
    scheduledTime: {
      type: String, // HH:mm format e.g. "05:15"
      required: true
    },
    duration: {
      type: Number, // duration in minutes
      default: 15
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyRoutine', FamilyRoutineSchema);
