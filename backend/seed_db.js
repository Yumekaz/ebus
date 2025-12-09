const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'ebus.sqlite');
const schemaPath = path.resolve(__dirname, '../database/schema.sqlite.sql');
const seedPath = path.resolve(__dirname, '../database/seed_sqlite.sql');

const db = new sqlite3.Database(dbPath);

console.log('Using Database:', dbPath);

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

db.serialize(() => {
    console.log('Running Schema...');
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('Schema Error:', err.message);
            process.exit(1);
        }
        console.log('Schema applied successfully.');

        console.log('Running Seed...');
        db.exec(seedSql, (err) => {
            if (err) {
                console.error('Seed Error:', err.message);
                process.exit(1);
            }
            console.log('Seed applied successfully.');
        });
    });
});
