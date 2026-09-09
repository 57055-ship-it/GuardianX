const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireSuperAdmin } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All routes under /api/admin require authentication AND super_admin role
router.use(authMiddleware);
router.use(requireSuperAdmin);

// Dashboard stats & metrics
router.get('/dashboard', adminController.getDashboardStats);

// Parent management
router.get('/parents', adminController.getParents);
router.get('/parents/:id', adminController.getParentById);
router.post('/parents/:id/plan', adminController.assignPlanToParent);
router.put('/parents/:id/suspension', adminController.toggleParentSuspension);

// Global Children & Families
router.get('/children', adminController.getGlobalChildren);
router.get('/families', adminController.getGlobalFamilies);

// Plan Management
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.createPlan);
router.put('/plans/:id', adminController.updatePlan);

// Subscriptions
router.get('/subscriptions', adminController.getSubscriptions);

// Usage
router.get('/usage', adminController.getPlatformUsage);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
