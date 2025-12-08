const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_CONFIG = require('../config/jwt');

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_CONFIG.secret, {
        expiresIn: JWT_CONFIG.expiresIn
    });
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

const calculateETA = (distance, averageSpeed = 30) => {
    // distance in km, speed in km/h
    // returns ETA in minutes
    const hours = distance / averageSpeed;
    return Math.ceil(hours * 60);
};

const formatResponse = (success, message, data = null) => {
    const response = { success, message };
    if (data !== null) {
        response.data = data;
    }
    return response;
};

const paginate = (page = 1, limit = 10) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    return {
        limit: parseInt(limit),
        offset: offset
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    calculateDistance,
    calculateETA,
    formatResponse,
    paginate
};