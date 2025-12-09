const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ebus.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='view' AND name='view_active_buses'", [], (err, rows) => {
    if (err) {
        console.error("Error:", err.message);
    } else {
        if (rows.length > 0) {
            console.log("View 'view_active_buses' EXISTS.");
        } else {
            console.log("View 'view_active_buses' MISSING.");
        }
    }
    db.close();
});
