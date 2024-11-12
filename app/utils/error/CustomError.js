const moment = require('moment-timezone');

class CustomError extends Error {
    constructor(errData) {
        super(errData.message);
        this.type = errData.type;
        this.name = 'CustomError';
        this.moduleName = errData.moduleName,
        this.message = errData.message;
        this.status = errData.status;
        this.httpStatus = errData.httpStatus;
        this.date = new Date();
        this.data = errData.data;
    }
}


module.exports.CustomError = CustomError;