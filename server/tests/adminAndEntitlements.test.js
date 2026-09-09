const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Tenant = require('../src/models/Tenant');
const Plan = require('../src/models/Plan');
const Subscription = require('../src/models/Subscription');
const AuditLog = require('../src/models/AuditLog');
const ChildProfile = require('../src/models/ChildProfile');
const bcrypt = require('bcryptjs');

describe('Super Admin & SaaS Entitlement Integration Tests', () => {
  let superAdminToken, parentToken, childToken;
  let superAdminUser, parentUser, childUser, tenantDoc;
  let basicPlan, familyPlan;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/guardianx_test_admin';
    await mongoose.connect(mongoUri);

    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Plan.deleteMany({});
    await Subscription.deleteMany({});
    await AuditLog.deleteMany({});
    await ChildProfile.deleteMany({});

    // Seed Super Admin
    const passHash = await bcrypt.hash('SuperAdminPass2026!', 10);
    superAdminUser = await User.create({
      tenantId: new mongoose.Types.ObjectId(),
      role: 'super_admin',
      name: 'Super Admin',
      email: 'superadmin@guardianx.com',
      passwordHash: passHash,
      isActive: true
    });

    // Seed Plans
    basicPlan = await Plan.create({
      name: 'Basic Plan',
      slug: 'basic',
      price: 9.99,
      limits: { maxChildren: 2, maxSafeZones: 5, maxDevices: 4 },
      features: { safeZonesEnabled: true, locationHistoryEnabled: true }
    });

    familyPlan = await Plan.create({
      name: 'Family Plan',
      slug: 'family',
      price: 19.99,
      limits: { maxChildren: 5, maxSafeZones: 10, maxDevices: 10 },
      features: { safeZonesEnabled: true, locationHistoryEnabled: true }
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  test('1. Public registration forces parent role and creates tenant & subscription', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Parent',
      email: 'john.parent@example.com',
      password: 'ParentPassword123!',
      familyName: 'John Family',
      role: 'super_admin' // Should be ignored by backend
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('parent'); // Must be parent

    parentToken = res.body.tokens.accessToken;
    parentUser = await User.findById(res.body.user.id);
    tenantDoc = await Tenant.findById(res.body.tenant.id);

    expect(parentUser.role).toBe('parent');
    expect(tenantDoc.plan).toBe('FREE');
  });

  test('2. Super Admin logins successfully', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'superadmin@guardianx.com',
      password: 'SuperAdminPass2026!'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('super_admin');
    superAdminToken = res.body.tokens.accessToken;
  });

  test('3. Super Admin can access admin dashboard statistics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(2);
    expect(res.body.stats.totalParents).toBe(1);
    expect(res.body.stats.billingConfigured).toBe(false);
  });

  test('4. Security: Parent CANNOT access Super Admin dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${parentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  test('5. Security: Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/dashboard');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('6. Super Admin can fetch parents list with search & pagination', async () => {
    const res = await request(app)
      .get('/api/admin/parents?search=john')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.parents.length).toBe(1);
    expect(res.body.parents[0].email).toBe('john.parent@example.com');
  });

  test('7. Free Plan Child Limit Enforcement: Creating Child 1 succeeds, Child 2 BLOCKED', async () => {
    // Child 1: Allowed (Free plan max 1)
    const res1 = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ name: 'Child One', dateOfBirth: '2015-05-10' });

    expect(res1.status).toBe(201);

    // Child 2: Blocked (Limit 1 reached)
    const res2 = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ name: 'Child Two', dateOfBirth: '2017-08-15' });

    expect(res2.status).toBe(403);
    expect(res2.body.message).toMatch(/limit reached/i);
  });

  test('8. Super Admin manually assigns Basic Plan (maxChildren = 2) to Parent', async () => {
    const res = await request(app)
      .post(`/api/admin/parents/${parentUser._id}/plan`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ planSlug: 'basic' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tenant.plan).toBe('BASIC');
  });

  test('9. Parent can now create Child 2 under Basic Plan', async () => {
    const res = await request(app)
      .post('/api/children')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ name: 'Child Two', dateOfBirth: '2017-08-15' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('10. Super Admin suspends Parent account', async () => {
    const res = await request(app)
      .put(`/api/admin/parents/${parentUser._id}/suspension`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ suspend: true, reason: 'Test suspension' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.parent.isActive).toBe(false);
  });

  test('11. Suspended Parent API calls are BLOCKED (403 Account Suspended)', async () => {
    const res = await request(app)
      .get('/api/children')
      .set('Authorization', `Bearer ${parentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/suspended/i);
  });

  test('12. Super Admin reactivates Parent account', async () => {
    const res = await request(app)
      .put(`/api/admin/parents/${parentUser._id}/suspension`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ suspend: false });

    expect(res.status).toBe(200);
    expect(res.body.parent.isActive).toBe(true);
  });

  test('13. Reactivated Parent can access API endpoints again', async () => {
    const res = await request(app)
      .get('/api/children')
      .set('Authorization', `Bearer ${parentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.children.length).toBe(2);
  });

  test('14. Audit Log captures administrative actions', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.logs.length).toBeGreaterThanOrEqual(2);
    const actions = res.body.logs.map((l) => l.action);
    expect(actions).toContain('PLAN_ASSIGNED');
    expect(actions).toContain('PARENT_SUSPENDED');
  });
});
