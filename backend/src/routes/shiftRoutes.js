const express4 = require('express');
const router4 = express4.Router();
const shiftController = require('../controllers/shiftController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { shiftValidation } = require('../middleware/validation');

router4.get('/', authenticateToken, shiftController.getAllShifts);
router4.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), shiftValidation.create, shiftController.createShift);
router4.patch('/:id/status', authenticateToken, shiftController.updateShiftStatus);

module.exports = router4;