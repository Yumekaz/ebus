const express5 = require('express');
const router5 = express5.Router();
const seatController = require('../controllers/seatController');
const { authenticateToken } = require('../middleware/auth');

router5.post('/allocate', authenticateToken, seatController.allocateSeat);
router5.get('/shift/:shift_id', authenticateToken, seatController.getSeatAllocations);

module.exports = router5;