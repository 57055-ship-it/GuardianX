const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', sosController.createSOSEvent);
router.get('/:childId', sosController.getSOSEvents);
router.put('/:id/resolve', sosController.resolveSOSEvent);

module.exports = router;
