const shiftDb = require('../config/database');
const firebase = require('../services/firebaseServices.js');

// Helper function for consistent API responses
function formatResponse(success, message, data = null) {
    return { success, message, data };
}

const getAllShifts = async (req, res) => {
    try {
        const { date, status, bus_id, driver_id } = req.query;

        let query = `
            SELECT s.*, b.bus_number, d.full_name as driver_name, r.route_name
            FROM shifts s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN drivers d ON s.driver_id = d.id
            LEFT JOIN routes r ON s.route_id = r.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            query += ' AND s.shift_date = ?';
            params.push(date);
        }
        if (status) {
            query += ' AND s.status = ?';
            params.push(status);
        }
        if (bus_id) {
            query += ' AND s.bus_id = ?';
            params.push(bus_id);
        }
        if (driver_id) {
            query += ' AND s.driver_id = ?';
            params.push(driver_id);
        }

        query += ' ORDER BY s.shift_date DESC, s.start_time DESC';

        const [results] = await shiftDb.query(query, params);

        res.json(formatResponse(true, 'Shifts retrieved', results));
    } catch (error) {
        console.error('Get shifts error:', error);
        res.status(500).json(formatResponse(false, 'Failed to retrieve shifts'));
    }
};

// ... rest of your code remains unchanged

const createShift = async (req, res) => {
    try {
        const { bus_id, driver_id, route_id, shift_type, start_time, end_time, shift_date } = req.body;

        // Check for conflicts
        const [conflicts] = await shiftDb.query(
            `SELECT * FROM shifts 
             WHERE shift_date = ? 
             AND status NOT IN ('cancelled', 'completed')
             AND (bus_id = ? OR driver_id = ?)
             AND (
                 (start_time <= ? AND end_time >= ?) OR
                 (start_time <= ? AND end_time >= ?) OR
                 (start_time >= ? AND end_time <= ?)
             )`,
            [shift_date, bus_id, driver_id, start_time, start_time, end_time, end_time, start_time, end_time]
        );

        if (conflicts.length > 0) {
            return res.status(400).json(formatResponse(false, 'Bus or driver already assigned at this time'));
        }

        const shift_code = `SH-${Date.now()}`;

        const [result] = await shiftDb.query(
            `INSERT INTO shifts (shift_code, bus_id, driver_id, route_id, shift_type, start_time, end_time, shift_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [shift_code, bus_id, driver_id, route_id, shift_type, start_time, end_time, shift_date]
        );

        res.status(201).json(formatResponse(true, 'Shift created successfully', { id: result.insertId }));
    } catch (error) {
        console.error('Create shift error:', error);
        res.status(500).json(formatResponse(false, 'Failed to create shift'));
    }
};

const updateShiftStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateFields = { status };

        if (status === 'active') {
            updateFields.actual_start_time = new Date();
        } else if (status === 'completed') {
            updateFields.actual_end_time = new Date();
        }

        await shiftDb.query(
            `UPDATE shifts SET ${Object.keys(updateFields).map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
            [...Object.values(updateFields), id]
        );

        // Update Firebase bus status
        if (status === 'active' || status === 'completed') {
            const [shift] = await shiftDb.query(
                `SELECT s.*, b.bus_number, d.full_name as driver_name, r.route_name
                 FROM shifts s
                 JOIN buses b ON s.bus_id = b.id
                 JOIN drivers d ON s.driver_id = d.id
                 JOIN routes r ON s.route_id = r.id
                 WHERE s.id = ?`,
                [id]
            );

            if (shift.length > 0) {
                await firebase.updateBusStatus(shift[0].bus_id, status, {
                    shiftId: id,
                    shiftType: shift[0].shift_type,
                    driverName: shift[0].driver_name,
                    routeName: shift[0].route_name
                });
            }
        }

        res.json(formatResponse(true, 'Shift status updated'));
    } catch (error) {
        console.error('Update shift status error:', error);
        res.status(500).json(formatResponse(false, 'Failed to update shift status'));
    }
};

module.exports = { getAllShifts, createShift, updateShiftStatus };
