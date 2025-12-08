// backend/createAdmin.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        // Connect to MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ebus_system'
        });

        // Admin details
        const username = 'taniya';
        const email = 'taniya@ebus.com';
        const password = 'taniya12';
        const full_name = 'System Administrator';
        const role = 'super_admin';

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into admin_users
        const [result] = await connection.execute(
            `INSERT INTO admin_users (username, email, password_hash, full_name, role)
             VALUES (?, ?, ?, ?, ?)`,
            [username, email, hashedPassword, full_name, role]
        );

        console.log('✅ Admin user created successfully!');
        console.log('Admin ID:', result.insertId);

        await connection.end();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.log('⚠️ Admin user already exists.');
        } else {
            console.error('❌ Error creating admin user:', err.message);
        }
    }
}

createAdmin();
