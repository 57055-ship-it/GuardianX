const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.put('/:id/read', alertController.markAsRead);

module.exports = router;
