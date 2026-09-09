const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema( 
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    trialDays: {
      type: Number,
      default: 14
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    // Configurable resource limits
    limits: {
      maxChildren: { type: Number, default: 1 },
      maxDevices: { type: Number, default: 2 },
      maxParents: { type: Number, default: 2 },
      maxSafeZones: { type: Number, default: 2 },
      locationHistoryDays: { type: Number, default: 7 },
      maxLocationUpdates: { type: Number, default: 1000 },
      maxReportsPerMonth: { type: Number, default: 10 },
      maxDevicesPerChild: { type: Number, default: 1 },
      storageLimitMb: { type: Number, default: 100 }
    },
    // Configurable feature entitlements
    features: {
      screenTimeEnabled: { type: Boolean, default: true },
      appUsageEnabled: { type: Boolean, default: true },
      locationEnabled: { type: Boolean, default: true },
      locationHistoryEnabled: { type: Boolean, default: false },
      safeZonesEnabled: { type: Boolean, default: true },
      sosEnabled: { type: Boolean, default: true },
      reportsEnabled: { type: Boolean, default: true },
      advancedReportsEnabled: { type: Boolean, default: false },
      familyRoutineEnabled: { type: Boolean, default: true },
      notificationsEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
