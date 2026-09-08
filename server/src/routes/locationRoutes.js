const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEntitlement } = require('../middleware/entitlementMiddleware');

router.use(authMiddleware);

router.post('/', locationController.recordLocation);
router.get('/:childId/latest', locationController.getLatestLocation);
router.get('/:childId/history', checkEntitlement('locationHistory'), locationController.getLocationHistory);

module.exports = router;
