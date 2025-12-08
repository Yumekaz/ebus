const db = require('../config/database');
const { hashPassword, comparePassword, generateToken, formatResponse } = require('../utils/helpers');

const login = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        let query;
        if (userType === 'admin') {
            query = 'SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE';
        } else if (userType === 'student') {
            query = 'SELECT * FROM students WHERE email = ? AND is_active = TRUE';
        } else {
            return res.status(400).json(formatResponse(false, 'Invalid user type'));
        }

        // Run the query
        const [rows] = await db.query(query, [email]);
        console.log("DB QUERY RESULT:", rows);

        // Check if user exists
        if (rows.length === 0) {
            return res.status(401).json(formatResponse(false, 'Invalid credentials'));
        }

        const user = rows[0];
        console.log("USER FOUND:", user);
        console.log("PASSWORD ENTERED:", password);
        console.log("HASH FROM DB:", user.password_hash);

        // Compare password
        let isValidPassword = true;
        if (user.password_hash) {
            isValidPassword = await comparePassword(password, user.password_hash);
        }
        
        if (!isValidPassword) {
            return res.status(401).json(formatResponse(false, 'Invalid credentials'));
        }
        // Generate JWT
        const token = generateToken({
            id: user.id,
            email: user.email,
            role: userType === 'admin' ? user.role : 'student',
            userType
        });

        res.json(formatResponse(true, 'Login successful', {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: userType === 'admin' ? user.role : 'student',
                userType
            }
        }));

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(formatResponse(false, 'Login failed'));
    }
};

const register = async (req, res) => {
    try {
        const { username, email, password, full_name, role } = req.body;

        const hashedPassword = await hashPassword(password);

        await db.query(
            'INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, role || 'admin']
        );

        res.status(201).json(formatResponse(true, 'User registered successfully'));
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json(formatResponse(false, 'Username or email already exists'));
        } else {
            res.status(500).json(formatResponse(false, 'Registration failed'));
        }
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userType = req.user.userType;

        let query;
        if (userType === 'admin') {
            query = 'SELECT id, username, email, full_name, role FROM admin_users WHERE id = ?';
        } else {
            query = 'SELECT id, student_id, full_name, email, phone, department, year FROM students WHERE id = ?';
        }

        const [rows] = await db.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json(formatResponse(false, 'User not found'));
        }

        res.json(formatResponse(true, 'Profile retrieved', rows[0]));
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json(formatResponse(false, 'Failed to get profile'));
    }
};

module.exports = { login, register, getProfile };
