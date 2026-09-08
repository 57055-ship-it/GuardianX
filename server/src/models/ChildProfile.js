const mongoose = require('mongoose');

const ChildProfileSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    profileStatus: {
      type: String,
      enum: ['unpaired', 'paired', 'disabled'],
      default: 'unpaired'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChildProfile', ChildProfileSchema);
