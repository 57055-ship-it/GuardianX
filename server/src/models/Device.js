const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema(
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
    deviceName: {
      type: String,
      default: 'Child Smartphone'
    },
    platform: {
      type: String,
      enum: ['android', 'ios'],
      default: 'android'
    },
    deviceIdentifier: {
      type: String,
      required: true
    },
    batteryLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', DeviceSchema);
