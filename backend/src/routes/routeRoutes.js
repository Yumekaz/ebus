const express8 = require('express');
const router8 = express8.Router();
const dbRoute = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { routeValidation } = require('../middleware/validation');
const { formatResponse } = require('../utils/helpers');

router8.get('/', authenticateToken, async (req, res) => {
    try {
        const results = await dbRoute.query('SELECT * FROM routes WHERE is_active = TRUE ORDER BY route_name');
        res.json(formatResponse(true, 'Routes retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve routes'));
    }
});

router8.get('/:id/stops', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const results = await dbRoute.query(
            'SELECT * FROM route_stops WHERE route_id = ? ORDER BY stop_order',
            [id]
        );
        res.json(formatResponse(true, 'Route stops retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve route stops'));
    }
});

router8.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), routeValidation.create, async (req, res) => {
    try {
        const { route_code, route_name, start_location, end_location, total_distance_km, estimated_duration_minutes } = req.body;
        
        const result = await dbRoute.query(
            `INSERT INTO routes (route_code, route_name, start_location, end_location, total_distance_km, estimated_duration_minutes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [route_code, route_name, start_location, end_location, total_distance_km, estimated_duration_minutes]
        );
        
        res.status(201).json(formatResponse(true, 'Route created successfully', { id: result.insertId }));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json(formatResponse(false, 'Route code already exists'));
        } else {
            res.status(500).json(formatResponse(false, 'Failed to create route'));
        }
    }
});

router8.post('/:id/stops', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { stop_name, stop_order, latitude, longitude, estimated_arrival_time } = req.body;
        
        const result = await dbRoute.query(
            `INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude, estimated_arrival_time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, stop_name, stop_order, latitude, longitude, estimated_arrival_time]
        );
        
        res.status(201).json(formatResponse(true, 'Stop added successfully', { id: result.insertId }));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to add stop'));
    }
});

module.exports = router8;
