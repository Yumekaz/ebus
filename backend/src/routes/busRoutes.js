const express2 = require('express');
const router2 = express2.Router();
const busController = require('../controllers/busController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { busValidation } = require('../middleware/validation');

router2.get('/', authenticateToken, busController.getAllBuses);
router2.get('/:id', authenticateToken, busController.getBusById);
router2.get('/:id/location', authenticateToken, busController.getBusLocation);
router2.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), busValidation.create, busController.createBus);
router2.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), busController.updateBus);
router2.delete('/:id', authenticateToken, authorizeRoles('super_admin'), busController.deleteBus);

module.exports = router2;