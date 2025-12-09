const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/start', authenticateToken, authorizeRoles('admin', 'super_admin'), simulationController.startSimulation);

module.exports = router;
