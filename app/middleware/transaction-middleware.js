const onFinished = require('on-finished');
const { write_db_config } = require("../config/db-config");
const dbPoolManager = require("../config/db-pool-manager");

// Retrieve or initialize the write database pool
const writeDbPool = dbPoolManager.get("sqlWrite", write_db_config);

const transactionMiddleware = async (req, res, next) => {
    let client;
    try {
        // Get a client from the pool and start a transaction
        client = await writeDbPool.connect();
        
        console.log(">>>>>>>>> Transaction started");
        await client.query('BEGIN');
        req.dbTransaction = client; // Attach the transaction client to the request

        // Use on-finished to commit or rollback the transaction when the response finishes
        onFinished(res, async (err) => {
            if (err || res.statusCode >= 400) {
                // Rollback the transaction if an error occurs or status indicates a failure
                if (client) {
                    console.log(">>>>>>>>> Rolling back transaction");
                    await client.query('ROLLBACK');
                    console.log('Transaction rolled back');
                }
            } else {
                // Commit the transaction if successful
                if (client) {
                    console.log(">>>>>>>>> Committing transaction");
                    await client.query('COMMIT');
                    console.log('Transaction committed');
                }
            }
            if (client) {
                console.log(">>>>>>>>> Releasing client");
                client.release(); // Always release the client back to the pool
            }
        });

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Rollback the transaction and release the client on error
        if (client) {
            console.log(">>>>>>>>> Rolling back transaction on error");
            await client.query('ROLLBACK');
            client.release();
        }
        next(error); // Pass the error to the global error handler
    }
};

module.exports.transactionMiddleware = transactionMiddleware;
