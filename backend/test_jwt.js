const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('./src/config/jwt'); // Load the actual config
const { generateToken } = require('./src/utils/helpers'); // Load the actual helper

console.log("TESTING JWT ISOLATION");
console.log("Secret:", JWT_CONFIG.secret);

const payload = { id: 1, email: 'test@example.com', role: 'student' };
const token = generateToken(payload);
console.log("Generated Token:", token);

jwt.verify(token, JWT_CONFIG.secret, (err, decoded) => {
    if (err) {
        console.error("FAIL: Verification Error:", err.message);
    } else {
        console.log("PASS: Verification Successful.");
        console.log("Decoded:", decoded);

        // Now test API
        const axios = require('axios');
        console.log("Testing API with this token...");
        axios.get('http://localhost:3001/api/dashboard/active-buses', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                console.log("API SUCCESS! Status:", res.status);
                console.log("Data:", res.data);
            })
            .catch(err => {
                console.error("API FAIL! Status:", err.response ? err.response.status : 'Unknown');
                if (err.response) console.error("Data:", err.response.data);
                else console.error("Error:", err.message);
            });
    }
});
