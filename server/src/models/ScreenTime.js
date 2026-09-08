const mongoose = require('mongoose');

const ScreenTimeSchema = new mongoose.Schema(
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
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    totalDuration: {
      type: Number, // in minutes
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

ScreenTimeSchema.index({ tenantId: 1, childId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ScreenTime', ScreenTimeSchema);
