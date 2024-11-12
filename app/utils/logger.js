// require('dotenv').config();
const pino = require('pino');

const transport = pino.transport({
    targets: [
        {
            target: 'pino/file',
            level: 'error',
            options: { destination: `${process.env.LOG_DIR}/udms/error.log` }
        },
        {
            target: 'pino/file',
            level: 'trace',
            options: { destination: `${process.env.LOG_DIR}/udms/info.log` }
        },
        // {
        //     target: 'pino/file',
        //     level: 'trace'
        // },
    ],
    dedupe: true,
})


module.exports.logger = pino({
    level: process.env[`LOG_LEVEL_${process.env.NODE_ENV}`] || 'info',
},
    transport
);