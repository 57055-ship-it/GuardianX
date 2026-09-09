require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Plan = require('../models/Plan');
const SaaSSetting = require('../models/SaaSSetting');
const { DEFAULT_FALLBACK_PLANS } = require('../services/entitlementService');

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guardianx';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB:', mongoUri);

    // 1. Seed Plans
    for (const [key, planData] of Object.entries(DEFAULT_FALLBACK_PLANS)) {
      const existing = await Plan.findOne({ slug: planData.slug });
      if (!existing) {
        await Plan.create({
          name: planData.name,
          slug: planData.slug,
          description: `${planData.name} Tier`,
          price: key === 'FREE' ? 0 : key === 'BASIC' ? 9.99 : key === 'FAMILY' ? 19.99 : 29.99,
          currency: 'USD',
          limits: planData.limits,
          features: planData.features
        });
        console.log(`[Seed] Created Plan: ${planData.name}`);
      }
    }

    // 2. Seed Settings
    const defaultSettings = [
      { key: 'DEFAULT_PLAN', value: 'FREE', description: 'Default plan for new parent accounts' },
      { key: 'DEFAULT_TRIAL_DAYS', value: 14, description: 'Trial period duration in days' },
      { key: 'DEFAULT_CURRENCY', value: 'USD', description: 'Default billing currency' },
      { key: 'MAINTENANCE_MODE', value: false, description: 'Global maintenance mode status' },
      { key: 'REGISTRATION_ENABLED', value: true, description: 'Public parent registration flag' }
    ];

    for (const s of defaultSettings) {
      await SaaSSetting.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true });
    }
    console.log('[Seed] Configured SaaS settings.');

    // 3. Seed Super Admin User
    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@guardianx.com').toLowerCase();
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'GuardianXAdmin2026!';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        tenantId: new mongoose.Types.ObjectId(), // Independent tenant ID for Super Admin
        role: 'super_admin',
        name: 'GuardianX Super Admin',
        email: adminEmail,
        passwordHash,
        isActive: true
      });
      console.log(`[Seed] Created Super Admin account (${adminEmail}) successfully.`);
    } else {
      adminUser.role = 'super_admin';
      adminUser.isActive = true;
      adminUser.passwordHash = await bcrypt.hash(adminPassword, 10);
      await adminUser.save();
      console.log(`[Seed] Updated user (${adminEmail}) to super_admin role and updated password.`);
    }

    console.log('[Seed] Seeding completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
