const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'ebus.sqlite');
const schemaPath = path.resolve(__dirname, '../database/schema.sqlite.sql');
const seedPath = path.resolve(__dirname, '../database/seed_sqlite.sql');

console.log('Initializing SQLite database...');

// Remove existing DB to start fresh
if (fs.existsSync(dbPath)) {
    console.log('Removing existing database file...');
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

const runScript = (scriptPath) => {
    return new Promise((resolve, reject) => {
        const sql = fs.readFileSync(scriptPath, 'utf8');
        db.exec(sql, (err) => {
            if (err) {
                console.error(`Error executing ${path.basename(scriptPath)}:`, err.message);
                reject(err);
            } else {
                console.log(`Executed ${path.basename(scriptPath)} successfully.`);
                resolve();
            }
        });
    });
};

db.serialize(async () => {
    try {
        await runScript(schemaPath);
        await runScript(seedPath);
        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Database initialization failed:', err);
    } finally {
        db.close();
    }
});
