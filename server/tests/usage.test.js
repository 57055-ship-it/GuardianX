require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const ChildProfile = require('../src/models/ChildProfile');
const AppUsage = require('../src/models/AppUsage');
const ScreenTime = require('../src/models/ScreenTime');

describe('Usage Synchronization API Tests', () => {
  let parentToken;
  let childToken;
  let tenantId;
  let childProfileId;
  const testDate = '2026-11-01';

  beforeAll(async () => {
    jest.setTimeout(60000);
    process.env.NODE_ENV = 'test';
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guardianx_test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up test data
    await User.deleteMany({ email: /@usagetest\.com$/ });
    await Tenant.deleteMany({ name: 'Usage Test Tenant' });
    await ChildProfile.deleteMany({ name: 'Usage Test Child' });

    // 1. Register Parent
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usage Parent',
        email: 'parent@usagetest.com',
        password: 'Password123!'
      });

    expect(regRes.status).toBe(201);
    parentToken = regRes.body.tokens.accessToken;
    tenantId = regRes.body.tenant.id;

    // 2. Add Child Profile
    const childRes = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        name: 'Usage Test Child',
        dateOfBirth: '2015-05-10'
      });

    expect(childRes.status).toBe(201);
    childProfileId = childRes.body.child._id;

    // 3. Generate Pairing Code
    const codeRes = await request(app)
      .post('/api/pairing/create')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ childId: childProfileId });

    expect(codeRes.status).toBe(201);
    const code = codeRes.body.pairingCode.code;

    // 4. Pair Child Device
    const joinRes = await request(app)
      .post('/api/pairing/join')
      .send({
        code,
        deviceName: 'Samsung Test Device',
        deviceIdentifier: 'usage_test_device_001',
        platform: 'android',
        batteryLevel: 95
      });

    if (joinRes.status !== 200) {
      console.error('JOIN ERROR:', joinRes.body);
    }
    expect(joinRes.status).toBe(200);
    childToken = joinRes.body.tokens.accessToken;
  });

  afterAll(async () => {
    if (childProfileId) {
      await AppUsage.deleteMany({ childId: childProfileId });
      await ScreenTime.deleteMany({ childId: childProfileId });
      await ChildProfile.deleteMany({ _id: childProfileId });
    }
    await User.deleteMany({ email: /@usagetest\.com$/ });
    await Tenant.deleteMany({ name: 'Usage Test Tenant' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Single Record Reporting (POST /api/usage/record)', () => {
    test('Should reject record when childId is missing and cannot be determined', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          packageName: 'com.android.chrome',
          appName: 'Google Chrome',
          usageDuration: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/childId is required/i);
    });

    test('Should reject record when childId is invalid ObjectId format', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: 'invalid-id-format',
          packageName: 'com.android.chrome',
          appName: 'Google Chrome',
          usageDuration: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid ObjectId/i);
    });

    test('Should reject record when packageName is missing', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: childProfileId,
          appName: 'Google Chrome',
          usageDuration: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/packageName is required/i);
    });

    test('Should reject record when appName is missing', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: childProfileId,
          packageName: 'com.android.chrome',
          usageDuration: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/appName is required/i);
    });

    test('Should reject record when usageDuration is missing', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: childProfileId,
          packageName: 'com.android.chrome',
          appName: 'Google Chrome'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/usageDuration is required/i);
    });

    test('Should reject record when usageDuration is negative', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          childId: childProfileId,
          packageName: 'com.android.chrome',
          appName: 'Google Chrome',
          usageDuration: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/non-negative number/i);
    });

    test('Should successfully record valid single record using childId', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${childToken}`)
        .send({
          childId: childProfileId,
          packageName: 'com.android.chrome',
          appName: 'Google Chrome',
          usageDuration: 8,
          sessionCount: 1,
          date: testDate
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.totalMinutes).toBe(8);
    });
  });

  describe('Batch Records Reporting (POST /api/usage/record with usages array)', () => {
    test('Should handle empty usages array gracefully without error', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${childToken}`)
        .send({
          childId: childProfileId,
          usages: [],
          date: testDate
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
    });

    test('Should process valid batch and skip invalid records defensively', async () => {
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${childToken}`)
        .send({
          childId: childProfileId,
          usages: [
            { packageName: 'com.google.android.youtube', appName: 'YouTube', usageDuration: 25 },
            { packageName: '', appName: 'No Package', usageDuration: 10 }, // should be skipped
            { packageName: 'com.whatsapp', appName: '', usageDuration: 15 }, // should be skipped
            { packageName: 'com.bad.duration', appName: 'Bad', usageDuration: -10 }, // should be skipped
            { packageName: 'com.android.chrome', appName: 'Google Chrome', usageDuration: 12 }
          ],
          date: testDate
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2); // Only YouTube and Chrome are valid
      // Total = YouTube (25) + Chrome (12) = 37
      expect(res.body.totalMinutes).toBe(37);
    });

    test('Duplicate synchronization should be idempotent and not compound total duration', async () => {
      // Re-send the exact same batch snapshot
      const res = await request(app)
        .post('/api/usage/record')
        .set('Authorization', `Bearer ${childToken}`)
        .send({
          childId: childProfileId,
          usages: [
            { packageName: 'com.google.android.youtube', appName: 'YouTube', usageDuration: 25 },
            { packageName: 'com.android.chrome', appName: 'Google Chrome', usageDuration: 12 }
          ],
          date: testDate
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Total minutes must still be 37 (not 74)
      expect(res.body.totalMinutes).toBe(37);
    });
  });

  describe('Query Usage (GET /api/usage/app-usage/:childId & screen-time)', () => {
    test('Should return recorded app usages for the child', async () => {
      const res = await request(app)
        .get(`/api/usage/app-usage/${childProfileId}?date=${testDate}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.usages).toHaveLength(2);

      const pkgs = res.body.usages.map((u) => u.packageName);
      expect(pkgs).toContain('com.google.android.youtube');
      expect(pkgs).toContain('com.android.chrome');
    });

    test('Should return total screen time for the child', async () => {
      const res = await request(app)
        .get(`/api/usage/screen-time/${childProfileId}?date=${testDate}`)
        .set('Authorization', `Bearer ${parentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.totalDuration).toBe(37);
      expect(res.body.totalScreenTimeMinutes).toBe(37);
    });
  });
});
