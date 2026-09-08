const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/heartbeat', deviceController.updateHeartbeat);
router.get('/:childId', deviceController.getDeviceStatus);

module.exports = router;
