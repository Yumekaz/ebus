
const admin = require('firebase-admin');
const { firebaseAdminConfig } = require('../config/firebase');

let database;
let messaging;
let initialized = false;

const initialize = () => {
    if (initialized) return;
    if (!firebaseAdminConfig.private_key || !firebaseAdminConfig.client_email) {
        console.error('❌ Firebase initialization failed: missing private_key or client_email');
        return;
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                type: firebaseAdminConfig.type,
                project_id: firebaseAdminConfig.project_id,
                private_key: firebaseAdminConfig.private_key.replace(/\\n/g, '\n'),
                client_email: firebaseAdminConfig.client_email,
                client_id: firebaseAdminConfig.client_id,
                auth_uri: firebaseAdminConfig.auth_uri,
                token_uri: firebaseAdminConfig.token_uri,
                auth_provider_x509_cert_url: firebaseAdminConfig.auth_provider_x509_cert_url,
                client_x509_cert_url: firebaseAdminConfig.client_x509_cert_url,
            }),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });

        database = admin.database();
        messaging = admin.messaging();
        initialized = true;

        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
    }
};

// Real-time Bus Location Update
const updateBusLocation = async (busId, locationData) => {
    if (!initialized) return;
    
    try {
        const ref = database.ref(`buses/${busId}/location`);
        await ref.set({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speed: locationData.speed || 0,
            heading: locationData.heading || 0,
            timestamp: admin.database.ServerValue.TIMESTAMP,
            accuracy: locationData.accuracy || 0
        });
        return true;
    } catch (error) {
        console.error('Error updating bus location:', error);
        return false;
    }
};

// Update Bus Status
const updateBusStatus = async (busId, status, shiftInfo = {}) => {
    if (!initialized) return;
    
    try {
        const ref = database.ref(`buses/${busId}/status`);
        await ref.set({
            status: status,
            shiftId: shiftInfo.shiftId || null,
            shiftType: shiftInfo.shiftType || null,
            driverName: shiftInfo.driverName || null,
            routeName: shiftInfo.routeName || null,
            updatedAt: admin.database.ServerValue.TIMESTAMP
        });
        return true;
    } catch (error) {
        console.error('Error updating bus status:', error);
        return false;
    }
};

// Update Seat Occupancy
const updateSeatOccupancy = async (shiftId, occupancyData) => {
    if (!initialized) return;
    
    try {
        const ref = database.ref(`shifts/${shiftId}/occupancy`);
        await ref.set({
            totalSeats: occupancyData.totalSeats,
            occupiedSeats: occupancyData.occupiedSeats,
            availableSeats: occupancyData.availableSeats,
            passengers: occupancyData.passengers || [],
            updatedAt: admin.database.ServerValue.TIMESTAMP
        });
        return true;
    } catch (error) {
        console.error('Error updating seat occupancy:', error);
        return false;
    }
};

// Calculate and Update ETA for Stops
const updateStopETA = async (shiftId, stopId, eta) => {
    if (!initialized) return;
    
    try {
        const ref = database.ref(`shifts/${shiftId}/stops/${stopId}`);
        await ref.update({
            eta: eta,
            updatedAt: admin.database.ServerValue.TIMESTAMP
        });
        return true;
    } catch (error) {
        console.error('Error updating stop ETA:', error);
        return false;
    }
};

// Send Push Notification (Single Device)
const sendNotification = async (fcmToken, title, body, data = {}) => {
    if (!initialized || !fcmToken) return;
    
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: data,
            token: fcmToken,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'ebus_channel'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };
        
        const response = await messaging.send(message);
        console.log('Notification sent successfully:', response);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

// Send Push Notification (Multiple Devices)
const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
    if (!initialized || !fcmTokens || fcmTokens.length === 0) return;
    
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: data,
            tokens: fcmTokens,
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'ebus_channel'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };
        
        const response = await messaging.sendEachForMulticast(message);
        console.log(`Sent ${response.successCount} notifications, ${response.failureCount} failed`);
        return response;
    } catch (error) {
        console.error('Error sending multicast notification:', error);
        return null;
    }
};

// Subscribe to Topic
const subscribeToTopic = async (fcmTokens, topic) => {
    if (!initialized) return;
    
    try {
        const response = await messaging.subscribeToTopic(fcmTokens, topic);
        console.log('Successfully subscribed to topic:', response);
        return response;
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        return null;
    }
};

// Send to Topic
const sendToTopic = async (topic, title, body, data = {}) => {
    if (!initialized) return;
    
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: data,
            topic: topic,
            android: {
                priority: 'high'
            }
        };
        
        const response = await messaging.send(message);
        console.log('Topic notification sent:', response);
        return response;
    } catch (error) {
        console.error('Error sending topic notification:', error);
        return null;
    }
};

// Listen for Bus Location Updates (for testing)
const listenToBusLocation = (busId, callback) => {
    if (!initialized) return;
    
    const ref = database.ref(`buses/${busId}/location`);
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && callback) {
            callback(data);
        }
    });
};

// Remove Bus from Firebase
const removeBus = async (busId) => {
    if (!initialized) return;
    
    try {
        await database.ref(`buses/${busId}`).remove();
        return true;
    } catch (error) {
        console.error('Error removing bus:', error);
        return false;
    }
};

// Get Active Buses
const getActiveBuses = async () => {
    if (!initialized) return [];
    
    try {
        const snapshot = await database.ref('buses').once('value');
        const buses = [];
        
        snapshot.forEach((child) => {
            const bus = child.val();
            if (bus.status && bus.status.status === 'active') {
                buses.push({
                    busId: child.key,
                    ...bus
                });
            }
        });
        
        return buses;
    } catch (error) {
        console.error('Error getting active buses:', error);
        return [];
    }
};

module.exports = {
    initialize,
    updateBusLocation,
    updateBusStatus,
    updateSeatOccupancy,
    updateStopETA,
    sendNotification,
    sendMulticastNotification,
    subscribeToTopic,
    sendToTopic,
    listenToBusLocation,
    removeBus,
    getActiveBuses
};