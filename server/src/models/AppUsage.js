const mongoose = require('mongoose');

const AppUsageSchema = new mongoose.Schema(
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
    packageName: {
      type: String,
      required: true
    },
    appName: {
      type: String,
      required: true
    },
    usageDuration: {
      type: Number, // in minutes
      required: true,
      default: 0
    },
    sessionCount: {
      type: Number,
      default: 1
    },
    date: {
      type: String, // YYYY-MM-DD format for easy daily aggregation
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

AppUsageSchema.index({ tenantId: 1, childId: 1, date: 1 });

module.exports = mongoose.model('AppUsage', AppUsageSchema);
