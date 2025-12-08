const express3 = require('express');
const router3 = express3.Router();
const gpsController = require('../controllers/gpsController');
const { authenticateToken } = require('../middleware/auth');
const { gpsValidation } = require('../middleware/validation');

router3.post('/log', gpsValidation.log, gpsController.logGPSData);
router3.get('/history/:bus_id', authenticateToken, gpsController.getGPSHistory);

module.exports = router3;
