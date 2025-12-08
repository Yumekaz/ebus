const pool = require('./database_sqlite');

module.exports = {
    pool,
    query: pool.query,
    getConnection: pool.getConnection,
    closePool: pool.end
};
