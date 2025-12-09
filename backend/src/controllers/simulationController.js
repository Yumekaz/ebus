const db = require('../config/database');
const firebaseService = require('../services/firebaseServices.js');
const gpsController = require('./gpsController');

// Store active simulations to prevent duplicates or allow stopping (optional)
const activeSimulations = new Set();

const startSimulation = async (req, res) => {
    try {
        const { shift_id, speed_multiplier = 1 } = req.body;

        if (activeSimulations.has(shift_id)) {
            return res.status(400).json({ success: false, message: 'Simulation already running for this shift' });
        }

        // 1. Get Shift Details & Route Stops
        const [shift] = await db.query('SELECT * FROM shifts WHERE id = ?', [shift_id]);
        if (!shift || shift.length === 0) {
            return res.status(404).json({ success: false, message: 'Shift not found' });
        }

        const [stops] = await db.query(
            'SELECT * FROM route_stops WHERE route_id = ? ORDER BY stop_order',
            [shift[0].route_id]
        );

        // Allow demo to proceed even with insufficient stops by checking demo override later
        // if (stops.length < 2) { ... } // Removed strict check for demo

        // 2. Start Simulation in Background
        activeSimulations.add(shift_id);
        res.json({ success: true, message: 'Simulation started' });

        // Run simulation asynchronously
        runSimulationLoop(shift[0], stops, speed_multiplier);

    } catch (error) {
        console.error('Start simulation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to start simulation' });
        }
    }
};

const runSimulationLoop = async (shift, stops, speedMultiplier) => {
    const busId = shift.bus_id;
    console.log(`Starting simulation for Bus ${busId} on Shift ${shift.id}`);

    // Update shift status to active
    await db.query("UPDATE shifts SET status = 'active', actual_start_time = DATETIME('now', 'localtime') WHERE id = ?", [shift.id]);

    // HARDCODED DEMO PATH: Haldwani -> GEHU (Approximate coordinates)
    const demoPath = [
        { latitude: 29.2183, longitude: 79.5130 }, // Haldwani
        { latitude: 29.2250, longitude: 79.5160 },
        { latitude: 29.2320, longitude: 79.5190 },
        { latitude: 29.2400, longitude: 79.5220 },
        { latitude: 29.2480, longitude: 79.5250 },
        { latitude: 29.2560, longitude: 79.5280 },
        { latitude: 29.2640, longitude: 79.5310 },
        { latitude: 29.2720, longitude: 79.5340 },
        { latitude: 29.2800, longitude: 79.5370 },
        { latitude: 29.2880, longitude: 79.5400 },
        { latitude: 29.2960, longitude: 79.5430 }, // GEHU
    ];

    // Force usage of demo path if stops are missing or for robustness
    const activePath = (stops && stops.length >= 2) ? stops : demoPath;
    // const activePath = demoPath; // Un-comment to FORCE demo path always

    for (let i = 0; i < activePath.length - 1; i++) {
        const start = activePath[i];
        const end = activePath[i + 1];

        // Interpolate points between stops
        const steps = 10;
        const latStep = (end.latitude - start.latitude) / steps;
        const lngStep = (end.longitude - start.longitude) / steps;

        for (let j = 0; j <= steps; j++) {
            if (!activeSimulations.has(shift.id)) return; // Stop if cancelled

            const currentLat = start.latitude + (latStep * j);
            const currentLng = start.longitude + (lngStep * j);

            // Mock GPS Payload
            const gpsData = {
                body: {
                    bus_id: busId,
                    shift_id: shift.id,
                    latitude: currentLat,
                    longitude: currentLng,
                    speed: 40,
                    heading: 0,
                    accuracy: 5
                }
            };

            // 1. Log to DB (Silent fail allowed)
            try {
                await db.query(
                    `INSERT INTO gps_logs (bus_id, shift_id, latitude, longitude, speed, heading, accuracy)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [busId, shift.id, currentLat, currentLng, gpsData.body.speed, 0, 5]
                );
            } catch (dbErr) {
                // Ignore DB errors to keep simulation alive
            }

            // 2. Update Firebase (Critical)
            try {
                const fbResult = await firebaseService.updateBusLocation(busId, {
                    latitude: currentLat,
                    longitude: currentLng,
                    speed: gpsData.body.speed,
                    heading: 0,
                    accuracy: 5,
                    shiftId: shift.id,
                    routeId: shift.route_id
                });
                console.log(`[SIM] Bus ${busId} moved to ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`);
            } catch (fbErr) {
                console.error('Firebase Update Error:', fbErr);
            }

            // Wait (Adjusted for visibility)
            await new Promise(resolve => setTimeout(resolve, 1000 / speedMultiplier));
        }
    }

    console.log(`Simulation finished for Bus ${busId}`);
    activeSimulations.delete(shift.id);
    await db.query("UPDATE shifts SET status = 'completed', actual_end_time = DATETIME('now', 'localtime') WHERE id = ?", [shift.id]);
};

module.exports = { startSimulation };
