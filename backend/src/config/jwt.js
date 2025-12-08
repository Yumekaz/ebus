// ============================================
// src/config/jwt.js
// ============================================

const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
};

module.exports = JWT_CONFIG;