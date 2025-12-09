// server.js - Main Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');


const dbConfig = require('./src/config/database');
const firebaseService = require('./src/services/firebaseServices.js');

// Routes
const authRoutes = require('./src/routes/authRoutes.js');
const busRoutes = require('./src/routes/busRoutes.js');
const driverRoutes = require('./src/routes/driverRoutes.js');
const routeRoutes = require('./src/routes/routeRoutes.js');
const shiftRoutes = require('./src/routes/shiftRoutes.js');
const studentRoutes = require('./src/routes/studentRoutes.js');
const seatRoutes = require('./src/routes/seatRoutes.js');
const gpsRoutes = require('./src/routes/gpsRoutes.js');
const notificationRoutes = require('./src/routes/notificationRoutes.js');
const analyticsRoutes = require('./src/routes/analyticsRoutes.js');
const dashboardRoutes = require('./src/routes/dashboardRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'E-Bus Management System API'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', require('./src/routes/simulationRoutes.js'));
app.use('/api/bookings', require('./src/routes/seatBookingRoutes.js'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Scheduled Jobs
// Clean old GPS logs (run daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
    console.log('Running cleanup job: GPS logs');
    try {
        const db = await dbConfig.getConnection();
        const deleteBefore = new Date();
        deleteBefore.setDate(deleteBefore.getDate() - 7); // Keep 7 days

        await db.query(
            'DELETE FROM gps_logs WHERE timestamp < ?',
            [deleteBefore]
        );
        await db.release();
        console.log('GPS logs cleanup completed');
    } catch (error) {
        console.error('GPS logs cleanup error:', error);
    }
});

// Update shift statuses (run every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    try {
        const db = await dbConfig.getConnection();
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];

        // Auto-start shifts
        await db.query(`
            UPDATE shifts 
            SET status = 'active', actual_start_time = NOW()
            WHERE shift_date = CURDATE() 
            AND status = 'scheduled' 
            AND start_time <= ?
            AND ADDTIME(start_time, '00:15:00') >= ?
        `, [currentTime, currentTime]);

        // Auto-complete shifts
        await db.query(`
            UPDATE shifts 
            SET status = 'completed', actual_end_time = NOW()
            WHERE shift_date = CURDATE() 
            AND status = 'active' 
            AND end_time < ?
        `, [currentTime]);

        await db.release();
    } catch (error) {
        console.error('Shift status update error:', error);
    }
});
console.log('Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'Loaded' : 'Missing');
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'Loaded' : 'Missing');

// Initialize Firebase
firebaseService.initialize();

// Start Server
const server = app.listen(PORT, 'localhost', () => {
    console.log(`
    ================================================
    🚌 E-Bus Management System API
    ================================================
    Server running on http://localhost:${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    Time: ${new Date().toISOString()}
    ================================================
    `);
});


// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        dbConfig.closePool();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        dbConfig.closePool();
        process.exit(0);
    });
});

module.exports = app;