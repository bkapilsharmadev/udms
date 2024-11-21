const { write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

// Retrieve or initialize the write database pool
const writeDbPool = dbPoolManager.get("sqlWrite", write_db_config);


const transactionMiddleware = async (req, res, next) => {
    let client;
    try {
        // Get a client from the pool and start a transaction
        client = await writeDbPool.connect();
        await client.query('BEGIN');
        req.pgTransaction = client; // Attach the transaction client to the request

        await next(); // Proceed to the next middleware or route handler

        if (!res.headersSent) {
            await client.query('COMMIT'); // Commit the transaction if successful
        }
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK'); // Rollback transaction on error
        }
        next(error); // Pass the error to the global error handler
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
};

module.exports = transactionMiddleware;
