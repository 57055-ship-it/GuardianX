const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['parent', 'admin']), childController.createChild);
router.get('/', childController.getChildren);
router.get('/:id', childController.getChildById);
router.put('/:id', roleMiddleware(['parent', 'admin']), childController.updateChild);
router.delete('/:id', roleMiddleware(['parent', 'admin']), childController.deleteChild);

module.exports = router;
