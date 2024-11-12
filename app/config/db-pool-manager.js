const { Pool } = require('pg');
const { internalServerError } = require('../utils/error/error');

const pools = new Map();

module.exports.get = (name, config) => {
  // Return if the pool exists
  if (pools.has(name)) {
    return pools.get(name);
  }

  // Create a new pool
  if (!config) {
    throw new Error('Pool does not exist');
  }

  const pool = new Pool(config);

  // Automatically remove the pool from the cache if `pool.end()` is called
  const end = pool.end.bind(pool);
  pool.end = (...args) => {
    pools.delete(name);
    return end(...args);
  };

  pool.connect()
  .then(client => client.release())
  .catch((err) => {
    console.log("err:::::::", err) 
    internalServerError({ moduleName: 'db-pool-manager.js', message: 'Database connection failed!', port: err.port, code: err.code })
  });

  pools.set(name, pool);
  return pools.get(name);
}

module.exports.closeAll = () => Promise.all(Array.from(pools.values()).map((pool) => pool.end()));
