const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEntitlement } = require('../middleware/entitlementMiddleware');

router.use(authMiddleware);

router.get('/daily', reportController.getDailyReport);
router.get('/weekly', checkEntitlement('advancedReports'), reportController.getWeeklyReport);

module.exports = router;
