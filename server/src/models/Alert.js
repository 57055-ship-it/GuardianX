const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        'sos',
        'geofence_entered',
        'geofence_exited',
        'low_battery',
        'device_offline',
        'screen_time_threshold',
        'routine_reminder',
        'routine_completed'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'info'],
      default: 'info'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', AlertSchema);
