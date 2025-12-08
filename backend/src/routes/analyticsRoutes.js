// ============================================
// src/routes/analyticsRoutes.js
// ============================================

const express10 = require('express');
const router10 = express10.Router();
const dbAnalytics = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { formatResponse } = require('../utils/helpers');

router10.get('/occupancy', authenticateToken, async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const results = await dbAnalytics.query(
            `SELECT * FROM view_daily_occupancy
             WHERE date BETWEEN ? AND ?
             ORDER BY date DESC`,
            [start_date, end_date]
        );
        
        res.json(formatResponse(true, 'Occupancy data retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve occupancy data'));
    }
});

router10.get('/attendance', authenticateToken, async (req, res) => {
    try {
        const results = await dbAnalytics.query('SELECT * FROM view_student_attendance');
        res.json(formatResponse(true, 'Attendance data retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve attendance data'));
    }
});

module.exports = router10;
