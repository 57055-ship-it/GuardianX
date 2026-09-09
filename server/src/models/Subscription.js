const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'cancelled', 'expired', 'suspended'],
      default: 'trialing',
      index: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    trialEndDate: {
      type: Date
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now
    },
    currentPeriodEnd: {
      type: Date
    },
    cancelledAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);
