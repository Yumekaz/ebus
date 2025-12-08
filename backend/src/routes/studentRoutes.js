const express6 = require('express');
const router6 = express6.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');

router6.get('/', authenticateToken, studentController.getAllStudents);
router6.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), studentValidation.create, studentController.createStudent);

module.exports = router6;