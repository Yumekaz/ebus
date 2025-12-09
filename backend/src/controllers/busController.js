const busDb = require('../config/database');
const firebaseService = require('../services/firebaseServices');

// Helper for consistent API responses
function formatResponse(success, message, data = null) {
    return { success, message, data };
}

const getAllBuses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const isActiveFilter = req.query.is_active;
        let query = 'SELECT * FROM buses';
        let countQuery = 'SELECT COUNT(*) as total FROM buses';
        const params = [];

        if (isActiveFilter !== undefined) {
            query += ' WHERE is_active = ?';
            countQuery += ' WHERE is_active = ?';
            params.push(isActiveFilter === 'true');
        }

        query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
        const [[buses], [countResult]] = await Promise.all([
            busDb.query(query, params),
            busDb.query(countQuery, params)
        ]);


        res.json(formatResponse(true, 'Buses retrieved successfully', {
            buses,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                pages: Math.ceil(countResult[0].total / limit)
            }
        }));
    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve buses'));
    }
};

const getBusById = async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await busDb.query('SELECT * FROM buses WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json(formatResponse(false, 'Bus not found'));
        res.json(formatResponse(true, 'Bus retrieved', results[0]));
    } catch (error) {
        console.error('Get bus error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve bus'));
    }
};

const createBus = async (req, res) => {
    try {
        const { bus_number, registration_number, capacity, bus_type, model, year, gps_device_id } = req.body;
        const [result] = await busDb.query(
            `INSERT INTO buses (bus_number, registration_number, capacity, bus_type, model, year, gps_device_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [bus_number, registration_number, capacity, bus_type || 'standard', model, year, gps_device_id]
        );
        res.status(201).json(formatResponse(true, 'Bus created successfully', { id: result.insertId }));
    } catch (error) {
        console.error('Create bus error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json(formatResponse(false, 'Bus number or registration already exists'));
        } else {
            res.status(500).json(formatResponse(false, 'Failed to create bus'));
        }
    }
};

const updateBus = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        await busDb.query(`UPDATE buses SET ${fields} WHERE id = ?`, [...values, id]);
        res.json(formatResponse(true, 'Bus updated successfully'));
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update bus'));
    }
};

const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;
        await busDb.query('UPDATE buses SET is_active = FALSE WHERE id = ?', [id]);
        await firebaseService.removeBus(id);
        res.json(formatResponse(true, 'Bus deactivated successfully'));
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json(formatResponse(false, 'Failed to deactivate bus'));
    }
};

const getBusLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await busDb.query(
            `SELECT gl.* FROM gps_logs gl WHERE gl.bus_id = ? ORDER BY gl.timestamp DESC LIMIT 1`,
            [id]
        );
        if (results.length === 0) return res.status(404).json(formatResponse(false, 'No location data found'));
        res.json(formatResponse(true, 'Location retrieved', results[0]));
    } catch (error) {
        console.error('Get bus location error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve location'));
    }
};

module.exports = {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    getBusLocation
};
