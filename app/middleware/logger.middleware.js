const pinoHTTP = require('pino-http');
const uuid = require('uuid');
const { logger } = require('../utils/logger');

const addRequestId = (req, res, next) => {
    req.reqId = uuid.v4();
    next();
}

const requestLogger = pinoHTTP({
    logger: logger,
    customProps: req => ({ requestId: req.reqId }),
    quietReqLogger: true,
    redact: ['req.headers.accept', 'req.headers.cookie', 'err'],
})

const attachChildLogger = (req, res, next) => {
    req.logger = logger.child({ requestId: req.reqId });
    next();
}


module.exports = {
    addRequestId,
    requestLogger,
    attachChildLogger,
};