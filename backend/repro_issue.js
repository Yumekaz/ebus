const shiftDb = require('./src/config/database');

async function testQuery() {
    try {
        console.log("Testing SELECT query return structure...");
        const result = await shiftDb.query("SELECT * FROM admin_users LIMIT 1");

        console.log("Result type:", typeof result);
        console.log("Result is array?", Array.isArray(result));
        console.log("Result length:", result.length);
        console.log("First element is array?", Array.isArray(result[0]));
        console.log("Second element is array?", Array.isArray(result[1]));

        if (Array.isArray(result) && Array.isArray(result[0])) {
            console.log("\nCONCLUSION: Query returns [rows, fields]. Controller logic is BROKEN.");
            console.log("Controller expects result to be 'rows' directly.");
        } else {
            console.log("\nCONCLUSION: Query returns rows directly. Controller logic might be correct (investigate further).");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testQuery();
