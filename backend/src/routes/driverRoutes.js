const express7 = require('express');
const router7 = express7.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { driverValidation } = require('../middleware/validation');
const { formatResponse } = require('../utils/helpers');

router7.get('/', authenticateToken, async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM drivers WHERE is_active = TRUE ORDER BY full_name');
        res.json(formatResponse(true, 'Drivers retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve drivers'));
    }
});

router7.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), driverValidation.create, async (req, res) => {
    try {
        const { driver_id, full_name, phone, email, license_number, license_expiry, date_of_birth, address, emergency_contact } = req.body;

        const [result] = await db.query(
            `INSERT INTO drivers (driver_id, full_name, phone, email, license_number, license_expiry, date_of_birth, address, emergency_contact)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [driver_id, full_name, phone, email, license_number, license_expiry, date_of_birth, address, emergency_contact]
        );

        res.status(201).json(formatResponse(true, 'Driver created successfully', { id: result.insertId }));
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json(formatResponse(false, 'Driver ID or license number already exists'));
        } else {
            res.status(500).json(formatResponse(false, 'Failed to create driver'));
        }
    }
});

module.exports = router7;