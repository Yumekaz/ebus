const studentDb = require('../config/database');

// Helper for consistent API responses
function formatResponse(success, message, data = null) {
    return { success, message, data };
}

const getAllStudents = async (req, res) => {
    try {
        let { is_active, department, page, limit } = req.query;

        // Convert to integers with fallback defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM students WHERE 1=1';
        const params = [];

        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(is_active === 'true' ? 1 : 0); // Convert to 1/0
        }
        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        // Inline LIMIT and OFFSET directly into the query
        query += ` ORDER BY full_name LIMIT ${limit} OFFSET ${offset}`;

        console.log('Query:', query);
        console.log('Params:', params);

        const [results] = await studentDb.query(query, params);

        res.json({ success: true, message: 'Students retrieved', data: results });
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve students' });
    }
};


const createStudent = async (req, res) => {
    try {
        const { student_id, full_name, email, phone, parent_phone, department, year, address, pickup_stop_id, drop_stop_id, password } = req.body;

        // Hash password if provided, otherwise use default
        const { hashPassword } = require('../utils/helpers');
        const passwordToHash = password || 'student123'; // Default password
        const password_hash = await hashPassword(passwordToHash);

        const [result] = await studentDb.query(
            `INSERT INTO students (student_id, full_name, email, phone, parent_phone, department, year, address, pickup_stop_id, drop_stop_id, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, full_name, email, phone, parent_phone, department, year, address, pickup_stop_id, drop_stop_id, password_hash]
        );

        res.status(201).json(formatResponse(true, 'Student created successfully', { id: result.insertId }));
    } catch (error) {
        console.error('Create student error:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.message.includes('UNIQUE constraint')) {
            res.status(400).json(formatResponse(false, 'Student ID or email already exists'));
        } else {
            res.status(500).json(formatResponse(false, 'Failed to create student'));
        }
    }
};

module.exports = { getAllStudents, createStudent };
