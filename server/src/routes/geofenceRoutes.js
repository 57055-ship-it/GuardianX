const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofenceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(['parent', 'admin']), geofenceController.createGeofence);
router.get('/', geofenceController.getGeofences);
router.put('/:id', roleMiddleware(['parent', 'admin']), geofenceController.updateGeofence);
router.delete('/:id', roleMiddleware(['parent', 'admin']), geofenceController.deleteGeofence);

module.exports = router;
