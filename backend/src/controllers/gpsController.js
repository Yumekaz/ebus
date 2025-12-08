const db = require('../config/database');
const firebaseService = require('../services/firebaseServices.js');
const { formatResponse, calculateDistance, calculateETA } = require('../utils/helpers');

const logGPSData = async (req, res) => {
    try {
        const { bus_id, shift_id, latitude, longitude, speed, heading, accuracy } = req.body;
        
        // Save to MySQL
        await db.query(
            `INSERT INTO gps_logs (bus_id, shift_id, latitude, longitude, speed, heading, accuracy)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bus_id, shift_id || null, latitude, longitude, speed || 0, heading || 0, accuracy || 0]
        );
        
        // Update Firebase for real-time tracking
        await firebaseService.updateBusLocation(bus_id, {
            latitude,
            longitude,
            speed: speed || 0,
            heading: heading || 0,
            accuracy: accuracy || 0
        });
        
        // Calculate ETA for upcoming stops if shift is active
        if (shift_id) {
            await calculateAndUpdateETAs(bus_id, shift_id, latitude, longitude);
        }
        
        res.json(formatResponse(true, 'GPS data logged successfully'));
    } catch (error) {
        console.error('GPS log error:', error);
        res.status(500).json(formatResponse(false, 'Failed to log GPS data'));
    }
};

const calculateAndUpdateETAs = async (busId, shiftId, currentLat, currentLng) => {
    try {
        // Get route stops for the shift
        const stops = await db.query(
            `SELECT rs.*, s.route_id
             FROM shifts s
             JOIN route_stops rs ON s.route_id = rs.route_id
             WHERE s.id = ?
             ORDER BY rs.stop_order`,
            [shiftId]
        );
        
        // Calculate ETA for each stop
        for (const stop of stops) {
            const distance = calculateDistance(currentLat, currentLng, stop.latitude, stop.longitude);
            const eta = calculateETA(distance, 30); // Average speed 30 km/h
            
            // Update in Firebase
            await firebaseService.updateStopETA(shiftId, stop.id, eta);
        }
    } catch (error) {
        console.error('ETA calculation error:', error);
    }
};

const getGPSHistory = async (req, res) => {
    try {
        const { bus_id } = req.params;
        const { start_date, end_date, limit = 100 } = req.query;
        
        let query = 'SELECT * FROM gps_logs WHERE bus_id = ?';
        const params = [bus_id];
        
        if (start_date && end_date) {
            query += ' AND timestamp BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        
        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(parseInt(limit));
        
        const results = await db.query(query, params);
        
        res.json(formatResponse(true, 'GPS history retrieved', results));
    } catch (error) {
        console.error('Get GPS history error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve GPS history'));
    }
};

module.exports = { logGPSData, getGPSHistory };
