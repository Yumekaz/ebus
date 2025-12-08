const express11 = require('express');
const router11 = express11.Router();
const dbDash = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { formatResponse } = require('../utils/helpers');

router11.get('/stats', authenticateToken, async (req, res) => {
    try {
        const [buses, drivers, students, activeShifts] = await Promise.all([
            dbDash.query('SELECT COUNT(*) as count FROM buses WHERE is_active = TRUE'),
            dbDash.query('SELECT COUNT(*) as count FROM drivers WHERE is_active = TRUE'),
            dbDash.query('SELECT COUNT(*) as count FROM students WHERE is_active = TRUE'),
            dbDash.query(`SELECT COUNT(*) as count FROM shifts 
                          WHERE shift_date = CURDATE() AND status = 'active'`)
        ]);
        
        res.json(formatResponse(true, 'Dashboard stats retrieved', {
            totalBuses: buses[0].count,
            totalDrivers: drivers[0].count,
            totalStudents: students[0].count,
            activeShifts: activeShifts[0].count
        }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve dashboard stats'));
    }
});

router11.get('/active-buses', authenticateToken, async (req, res) => {
    try {
        const results = await dbDash.query('SELECT * FROM view_active_buses');
        res.json(formatResponse(true, 'Active buses retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve active buses'));
    }
});

module.exports = router11;