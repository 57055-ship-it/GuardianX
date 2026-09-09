const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.get('/me', familyController.getFamilyDetails);
router.get('/details', familyController.getFamilyDetails);
router.put('/plan', roleMiddleware(['parent', 'admin']), familyController.updatePlan);

module.exports = router;
