const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/record', usageController.recordAppUsage);
router.post('/block-app', usageController.toggleBlockApp);
router.get('/app-usage/:childId', usageController.getAppUsage);
router.get('/blocked-apps/:childId', usageController.getBlockedApps);
router.get('/screen-time/:childId', usageController.getScreenTime);

module.exports = router;
