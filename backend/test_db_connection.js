require('dotenv').config();
const mysql = require('mysql2/promise');

const credentials = [
    { user: 'root', password: 'secure_pass' },
    { user: 'root', password: 'secure_password' },
    { user: 'root', password: 'secure_password_123' },
    { user: 'ebus_user', password: 'secure_pass' },
    { user: 'ebus_user', password: 'secure_password' },
    { user: 'root', password: 'Taniyaa@07' }
];

async function testConnection() {
    console.log('Testing MySQL connections...');

    for (const cred of credentials) {
        try {
            console.log(`Trying User: '${cred.user}', Password: '${cred.password}'`);
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: cred.user,
                password: cred.password
            });
            console.log(`✅ SUCCESS! User: '${cred.user}', Password: '${cred.password}'`);
            await connection.end();
            process.exit(0);
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }

    console.log('⚠️ All passwords failed.');
    process.exit(1);
}

testConnection();
