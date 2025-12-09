const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ebus.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM admin_users", [], (err, rows) => {
    if (err) {
        console.error("Error reading admin_users:", err.message);
    } else {
        console.log(`Found ${rows.length} admin users.`);
        rows.forEach(row => {
            console.log(`User: ${row.username}, Email: ${row.email}, Role: ${row.role}`);
        });
    }
    db.close();
});
