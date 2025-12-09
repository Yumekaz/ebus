const express9 = require('express');
const router9 = express9.Router();
const dbNotif = require('../config/database');
const firebaseService = require('../services/firebaseServices.js');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { formatResponse } = require('../utils/helpers');

router9.post('/send', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
    try {
        const { title, message, notification_type, target_type, target_ids } = req.body;

        const [result] = await dbNotif.query(
            `INSERT INTO notifications (title, message, notification_type, target_type, target_ids, sent_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, message, notification_type, target_type, JSON.stringify(target_ids), req.user.id]
        );

        // Send via FCM
        if (target_type === 'all') {
            await firebaseService.sendToTopic('all_users', title, message);
        } else if (target_type === 'students') {
            const [students] = await dbNotif.query('SELECT fcm_token FROM students WHERE fcm_token IS NOT NULL');
            const tokens = students.map(s => s.fcm_token);
            if (tokens.length > 0) {
                await firebaseService.sendMulticastNotification(tokens, title, message);
            }
        }

        await dbNotif.query('UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ?', [result.insertId]);

        res.json(formatResponse(true, 'Notification sent successfully'));
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json(formatResponse(false, 'Failed to send notification'));
    }
});

router9.get('/', authenticateToken, async (req, res) => {
    try {
        const [results] = await dbNotif.query(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
        );
        res.json(formatResponse(true, 'Notifications retrieved', results));
    } catch (error) {
        res.status(500).json(formatResponse(false, 'Failed to retrieve notifications'));
    }
});

module.exports = router9;

