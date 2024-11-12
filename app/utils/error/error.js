const { CustomError } = require("./CustomError");


module.exports.invalidRequestError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        message: message || 'Invalid Request',
        httpStatus: 400,
        data: data || {}
    });
}

module.exports.unauthorizedAccessError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        status: status || '',
        message: message || 'Unauthorized Access',
        httpStatus: 401,
        data: data || {}
    });
}

module.exports.forbiddenAccessError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        status: status || '',
        message: message || 'Forbidden Access',
        httpStatus: httpStatus || 403,
        data: data || {}
    });
}

module.exports.notFoundError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        status: status || '',
        message: message || 'Not Found',
        httpStatus: httpStatus || 404,
        data: data || {}
    });
}

module.exports.internalServerError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        status: status || '',
        message: message || 'Internal Server Error',
        httpStatus: httpStatus || 500,
        data: data || {}
    });
}

module.exports.dbError = ({ type, moduleName, status, message, httpStatus, data }) => {
    throw new CustomError({
        type: type || '',
        moduleName: moduleName || 'Unknown Module',
        status: status || '',
        message: message || 'Internal Server Error',
        httpStatus: httpStatus || 501,
        data: data || {}
    });
}

