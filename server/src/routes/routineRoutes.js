const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['parent', 'admin']), routineController.createRoutine);
router.get('/', routineController.getRoutines);
router.post('/complete', routineController.completeRoutine);
router.get('/hadith/today', routineController.getHadithContent);

module.exports = router;
