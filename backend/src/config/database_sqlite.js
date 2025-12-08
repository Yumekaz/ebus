const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../ebus.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database at:', dbPath);

// Wrapper to mimic mysql2/promise interface partially
const pool = {
    execute: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            const queryType = sql.trim().split(' ')[0].toUpperCase();

            if (queryType === 'SELECT') {
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error('SQL Error:', err.message, 'Query:', sql);
                        reject(err);
                    } else {
                        resolve([rows, []]); // Match mysql2 signature [rows, fields]
                    }
                });
            } else {
                db.run(sql, params, function (err) {
                    if (err) {
                        console.error('SQL Error:', err.message, 'Query:', sql);
                        reject(err);
                    } else {
                        // Match mysql2 ResultSetHeader
                        const result = {
                            insertId: this.lastID,
                            affectedRows: this.changes
                        };
                        resolve([result, []]);
                    }
                });
            }
        });
    },
    query: (sql, params = []) => {
        // Alias for execute
        return pool.execute(sql, params);
    },
    getConnection: async () => {
        // Mock connection object for transactions if needed, but for now return pool wrapper
        return {
            query: pool.query,
            execute: pool.execute,
            release: () => { }, // No-op
            beginTransaction: () => Promise.resolve(), // Mock
            commit: () => Promise.resolve(), // Mock
            rollback: () => Promise.resolve() // Mock
        };
    },
    end: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
};

module.exports = pool;
