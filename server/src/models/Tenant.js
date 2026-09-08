const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    plan: {
      type: String,
      enum: ['FREE', 'FAMILY', 'PREMIUM'],
      default: 'FREE'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'canceled'],
      default: 'active'
    },
    childrenLimit: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', TenantSchema);
