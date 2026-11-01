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
    },
    expiresAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Compound index for fast tenant/child timeline lookups
LocationRecordSchema.index({ tenantId: 1, childId: 1, timestamp: -1 });

// Automatic MongoDB TTL index: Documents auto-delete when expiresAt timestamp is reached
LocationRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save safeguard: Ensure expiresAt is set (defaults to 24h for free accounts if unset)
LocationRecordSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const base = this.timestamp || new Date();
    this.expiresAt = new Date(base.getTime() + 24 * 60 * 60 * 1000); // 24-hour default
  }
  next();
});

module.exports = mongoose.model('LocationRecord', LocationRecordSchema);
