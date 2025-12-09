const axios = require('axios');
const API_URL = 'http://localhost:3001/api';

async function testStudentIntegration() {
    try {
        console.log("=== Testing Student Integration ===");

        // 1. Login as Student
        // Using 'aarav.sharma@example.com' from seed (password is usually default or derived, assuming 'password123' or 'student123' or check hash)
        // Wait, seed doesn't set password for students in specific table? 
        // Logic in authController: SELECT * FROM students ...
        // BUT student table doesn't have password_hash column in schema?
        // Let's check schema again.

        // Schema check: 
        // students table: no password_hash column!
        // authController logic: 'if (user.password_hash) ... comparePassword ...'
        // If no password_hash column, user.password_hash is undefined. 
        // 'isValidPassword' stays true? 
        // "let isValidPassword = true; if (user.password_hash) { ... }"
        // YES! Student login bypasses password check if no column exists? OR it fails?
        // Let's test.

        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'aarav.sharma@example.com',
            password: 'any_password',
            userType: 'student'
        });

        const token = loginResponse.data.token;
        const student = loginResponse.data.data.user;
        console.log(`Login Success. Student ID: ${student.id}, Name: ${student.name}`);

        // 2. Fetch Active Buses (Dashboard)
        console.log("2. Fetching Active Buses View...");
        const busResponse = await axios.get(`${API_URL}/dashboard/active-buses`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const activeBuses = busResponse.data.data;
        console.log(`Active Buses Found: ${activeBuses.length}`);

        if (activeBuses.length > 0) {
            console.log("First Active Bus:", activeBuses[0]);
            // Verify Sync: Bus has route, driver?
            if (activeBuses[0].route_name && activeBuses[0].driver_name) {
                console.log("PASS: Active Bus contains Route and Driver info.");
            } else {
                console.log("FAIL: Active Bus missing linked info.");
            }
        } else {
            console.log("WARN: No active buses. Ensure a shift is active in 'shifts' table.");
        }

    } catch (error) {
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testStudentIntegration();
