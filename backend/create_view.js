const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ebus.sqlite');
const db = new sqlite3.Database(dbPath);

const createViewSql = `
CREATE VIEW IF NOT EXISTS view_active_buses AS
SELECT 
    b.id as bus_id,
    b.bus_number,
    b.registration_number,
    b.gps_device_id,
    r.route_name,
    s.id as shift_id,
    s.status as shift_status,
    d.full_name as driver_name,
    gl.latitude,
    gl.longitude,
    gl.speed,
    gl.heading,
    gl.timestamp as last_gps_update
FROM buses b
JOIN shifts s ON b.id = s.bus_id
JOIN routes r ON s.route_id = r.id
JOIN drivers d ON s.driver_id = d.id
LEFT JOIN (
    SELECT bus_id, latitude, longitude, speed, heading, timestamp,
           ROW_NUMBER() OVER (PARTITION BY bus_id ORDER BY timestamp DESC) as rn
    FROM gps_logs
) gl ON b.id = gl.bus_id AND gl.rn = 1
WHERE s.status IN ('active', 'scheduled') AND s.shift_date = DATE('now');
`;

db.serialize(() => {
    db.run(createViewSql, (err) => {
        if (err) {
            console.error("Error creating view:", err.message);
        } else {
            console.log("View 'view_active_buses' created successfully.");
        }
    });
    db.close();
});
