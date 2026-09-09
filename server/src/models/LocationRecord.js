const mongoose = require('mongoose');

const LocationRecordSchema = new mongoose.Schema(
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
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    accuracy: {
      type: Number,
      default: 0
    },
    speed: {
      type: Number,
      default: 0
    },
    altitude: {
      type: Number,
      default: 0
    },
    heading: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

LocationRecordSchema.index({ tenantId: 1, childId: 1, timestamp: -1 });

module.exports = mongoose.model('LocationRecord', LocationRecordSchema);
