const redis = require('redis');
const { internalServerError } = require('../utils/error/error');

// Redis client configuration
const redisClientConn = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD || ''
});

// Redis client configuration
const redisSubClientConn = redisClientConn.duplicate();

const redisClient = redisClientConn.connect();
 redisSubClientConn.connect();

// Subscribe to Redis key expiration events
redisClientConn.configSet('notify-keyspace-events', 'Ex');

// Optional: Handle Redis client errors
redisClientConn.on('connect', () => {
    console.log('Connected to Redis');
});

// Handle Redis client errors
redisClientConn.on('error', (err) => {
    console.log('Redis error: ', err);
    // internalServerError({ moduleName: 'redis.js', message: 'Redis connection failed!' });
});

module.exports = { redisClient : redisClientConn , redisSubClientConn }