const express = require('express');
const router = express.Router();
const pairingController = require('../controllers/pairingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Parent generates pairing code (authenticated parent)
router.post('/create', authMiddleware, roleMiddleware(['parent', 'admin']), pairingController.createPairingCode);

// Child joins using pairing code (unauthenticated child device)
router.post('/join', pairingController.joinPairingCode);

module.exports = router;
