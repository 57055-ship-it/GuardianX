const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const ChildProfile = require('../src/models/ChildProfile');
const LocationRecord = require('../src/models/LocationRecord');
const Alert = require('../src/models/Alert');

beforeAll(async () => {
  jest.setTimeout(60000);
  process.env.NODE_ENV = 'test';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guardianx_test_db';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.connection.close();
});

describe('GuardianX Backend API Integration Tests', () => {
  let parentTokenFamilyA;
  let tenantIdFamilyA;
  let childIdFamilyA;
  let pairingCodeFamilyA;
  let childTokenFamilyA;

  let parentTokenFamilyB;
  let tenantIdFamilyB;

  test('1. Register Parent for Family A', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Parent Alpha',
        email: 'alpha@guardianx.com',
        password: 'Password123!',
        familyName: 'Alpha Family'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.tokens.accessToken).toBeDefined();
    expect(res.body.tenant.name).toEqual('Alpha Family');

    parentTokenFamilyA = res.body.tokens.accessToken;
    tenantIdFamilyA = res.body.tenant.id;
  });

  test('2. Register Parent for Family B (Multi-Tenant Isolation)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Parent Beta',
        email: 'beta@guardianx.com',
        password: 'Password123!',
        familyName: 'Beta Family'
      });

    expect(res.statusCode).toEqual(201);
    parentTokenFamilyB = res.body.tokens.accessToken;
    tenantIdFamilyB = res.body.tenant.id;
  });

  test('3. Login Parent Alpha', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alpha@guardianx.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  test('4. Add Child Profile in Family A', async () => {
    const res = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({
        name: 'Child One',
        dateOfBirth: '2015-05-10'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.child.name).toEqual('Child One');
    childIdFamilyA = res.body.child._id;
  });

  test('5. Enforce Free Plan Child Limit (Max 1 Child for Free Plan)', async () => {
    const res = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({
        name: 'Child Two',
        dateOfBirth: '2018-08-20'
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toContain('limit reached');
  });

  test('6. Generate Temporary Pairing Code for Child One', async () => {
    const res = await request(app)
      .post('/api/pairing/create')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({ childId: childIdFamilyA });

    expect(res.statusCode).toEqual(201);
    expect(res.body.pairingCode.code).toBeDefined();
    pairingCodeFamilyA = res.body.pairingCode.code;
  });

  test('7. Child Device Pairs via Pairing Code', async () => {
    const res = await request(app)
      .post('/api/pairing/join')
      .send({
        code: pairingCodeFamilyA,
        deviceName: "Child's Pixel 7",
        deviceIdentifier: 'android_device_id_999',
        platform: 'android'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tokens.accessToken).toBeDefined();
    childTokenFamilyA = res.body.tokens.accessToken;
  });

  test('8. Multi-Tenant Isolation Check: Family B Parent CANNOT access Family A Child', async () => {
    const res = await request(app)
      .get(`/api/children/${childIdFamilyA}`)
      .set('Authorization', `Bearer ${parentTokenFamilyB}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  test('9. Record Child Location and Check Latest Location', async () => {
    const locRes = await request(app)
      .post('/api/location')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5.0
      });

    expect(locRes.statusCode).toEqual(201);

    const getRes = await request(app)
      .get(`/api/location/${childIdFamilyA}/latest`)
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(getRes.statusCode).toEqual(200);
    expect(getRes.body.location.latitude).toEqual(37.7749);
  });

  test('10. Child Triggers Emergency SOS', async () => {
    const res = await request(app)
      .post('/api/sos')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({
        latitude: 37.7749,
        longitude: -122.4194
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.alert.type).toEqual('sos');
    expect(res.body.alert.severity).toEqual('critical');
  });

  test('11. Parent Fetches Alerts', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.alerts.length).toBeGreaterThan(0);
    expect(res.body.unreadCount).toBeGreaterThan(0);
  });

  test('12. Upgrade Plan to PREMIUM and verify Child Limit increase', async () => {
    const upgradeRes = await request(app)
      .put('/api/families/plan')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({ plan: 'PREMIUM' });

    expect(upgradeRes.statusCode).toEqual(200);
    expect(upgradeRes.body.family.plan).toEqual('PREMIUM');

    const addChildRes = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({
        name: 'Child Two',
        dateOfBirth: '2018-08-20'
      });

    expect(addChildRes.statusCode).toEqual(201);
    expect(addChildRes.body.child.name).toEqual('Child Two');
  });

  test('13. Security Enforcement: Child JWT CANNOT create child profiles or update family plan', async () => {
    const createRes = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({ name: 'Hacker Child' });

    expect(createRes.statusCode).toEqual(403);
    expect(createRes.body.message).toContain('Forbidden');

    const planRes = await request(app)
      .put('/api/families/plan')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({ plan: 'FREE' });

    expect(planRes.statusCode).toEqual(403);
  });

  test('14. Security Enforcement: Invalid or missing token returns 401', async () => {
    const noTokenRes = await request(app).get('/api/auth/me');
    expect(noTokenRes.statusCode).toEqual(401);

    const badTokenRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_jwt_token_12345');
    expect(badTokenRes.statusCode).toEqual(401);
  });

  test('15. Single-Use Pairing Code Enforcement: Reusing pairing code fails', async () => {
    const res = await request(app)
      .post('/api/pairing/join')
      .send({
        code: pairingCodeFamilyA,
        deviceName: "Child's Duplicate Phone",
        deviceIdentifier: 'android_device_id_999_dup',
        platform: 'android'
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toContain('Invalid or already used');
  });

  test('16. Geofence Safe Zone Creation and Evaluation', async () => {
    const createGeoRes = await request(app)
      .post('/api/geofences')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({
        childId: childIdFamilyA,
        name: 'Home Zone',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 100
      });

    expect(createGeoRes.statusCode).toEqual(201);
    expect(createGeoRes.body.geofence.name).toEqual('Home Zone');

    // Submit location inside safe zone (0 meters away) -> Enter Event
    const insideRes = await request(app)
      .post('/api/location')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({ latitude: 37.7749, longitude: -122.4194 });

    expect(insideRes.statusCode).toEqual(201);

    // Submit location outside safe zone (10km away) -> Exit Event
    const outsideRes = await request(app)
      .post('/api/location')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({ latitude: 37.8500, longitude: -122.4200 });

    expect(outsideRes.statusCode).toEqual(201);
  });

  test('17. Family Routines and Hadith Service Integration', async () => {
    const routineRes = await request(app)
      .post('/api/routines')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`)
      .send({
        childId: childIdFamilyA,
        title: 'Fajr Prayer',
        type: 'prayer_reminder',
        scheduledTime: '05:30'
      });

    expect(routineRes.statusCode).toEqual(201);
    const routineId = routineRes.body.routine._id;

    const completeRes = await request(app)
      .post('/api/routines/complete')
      .set('Authorization', `Bearer ${childTokenFamilyA}`)
      .send({ routineId, childId: childIdFamilyA });

    expect(completeRes.statusCode).toEqual(200);
    expect(completeRes.body.completion.completionStatus).toEqual('completed');

    const hadithRes = await request(app)
      .get('/api/routines/hadith/today')
      .set('Authorization', `Bearer ${childTokenFamilyA}`);

    expect(hadithRes.statusCode).toEqual(200);
    expect(hadithRes.body.hadith.english).toBeDefined();
  });

  test('18. Daily & Weekly Reports Generation', async () => {
    const dailyRes = await request(app)
      .get(`/api/reports/daily?childId=${childIdFamilyA}`)
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(dailyRes.statusCode).toEqual(200);
    expect(dailyRes.body.data.totalAlerts).toBeGreaterThanOrEqual(1);

    const weeklyRes = await request(app)
      .get(`/api/reports/weekly?childId=${childIdFamilyA}`)
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(weeklyRes.statusCode).toEqual(200);
    expect(weeklyRes.body.data.dailyScreenTimes.length).toEqual(7);
  });

  test('19. Safety Analytics Insights with Explainable Factors', async () => {
    const insightsRes = await request(app)
      .get(`/api/analytics/insights?childId=${childIdFamilyA}`)
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(insightsRes.statusCode).toEqual(200);
    expect(insightsRes.body.insights.length).toBeGreaterThan(0);
    expect(insightsRes.body.insights[0].rationale).toBeDefined();
  });

  test('20. Authenticated User Profile Role Verification', async () => {
    const parentMeRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${parentTokenFamilyA}`);

    expect(parentMeRes.statusCode).toEqual(200);
    expect(parentMeRes.body.user.role).toEqual('parent');

    const childMeRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${childTokenFamilyA}`);

    expect(childMeRes.statusCode).toEqual(200);
    expect(childMeRes.body.user.role).toEqual('child');
  });

  test('21. Production Health Endpoints Check (GET /health & GET /api/health)', async () => {
    const health1 = await request(app).get('/health');
    expect(health1.statusCode).toEqual(200);
    expect(health1.body.status).toEqual('online');

    const health2 = await request(app).get('/api/health');
    expect(health2.statusCode).toEqual(200);
    expect(health2.body.status).toEqual('online');
  });
});

