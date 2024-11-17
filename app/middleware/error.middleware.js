require('dotenv').config();

const { DatabaseError } = require('pg');
const { CustomError } = require('../utils/error/CustomError');
const { isValidJson } = require('../utils/utils');

module.exports.customErrorHandler = (err, req, res, next) => {

    console.log('err >>> ', err);
    req.logger.error({ err });
    console.log("======================= Error Start ==============================");
    console.log("req.originalUrl >>>>>>>>>>>> ", req.originalUrl);
    console.log("req.url >>>>>>>>>>>>>> ", req.url);
    console.log("req.method >>>>>>>>>>> ", req.method);
    console.log("req.reqId >>>>>>>>>>>>> ", req.reqId);
    console.log("err.moduleName >>>>>>>> ", err.moduleName);
    console.log("err.message >>>>>>>>>>> ", err.message);
    console.log("err.httpStatus >>>>>>>> ", err.httpStatus);
    console.log("err stack >>>>>>>>>>>>> ", err.stack);
    console.log("err.code >>>>>>>>>>>>>> ", err.code);
    console.log("err.port >>>>>>>>>>>>>> ", err.port);
    console.log("======================= Error End ==============================");

    let reqId = req.reqId;
    let status = err.status || 'error';
    let message = err.message || 'Something went wrong!';
    let httpStatus = err.httpStatus || 500;
    let data = err.data;
    let redirectUrl = '/admin/dashboard';
    let redirectPage = 'home/error';

    if (err instanceof CustomError) {
        httpStatus = err.httpStatus || httpStatus;
        status = err.status || status;
        message = err.message || message;
        data = err.data || data;
    } else if (err instanceof DatabaseError) {
        httpStatus = 501;
        let errObj = isValidJson(err.message) ? JSON.parse(err.message) : '';
        status = errObj.status || status;
        message = errObj.message || message;
        data = errObj.data || data;

        message = !errObj && err.code == '23505' ? 'Error! Duplicate entry.' : message;
        message = !errObj && err.code == '23503' ? `Error! Data being referenced/used in ${err.table.replace(/_/g, ' ')}.` : message;
        message = !errObj && err.code == '23502' ? 'Error! Required field missing.' : message;
    } else if (err instanceof Error) {
        httpStatus = 500;
        status = 'error';
        message = 'Something went wrong!';
    }

    if (err.code == 'ECONNREFUSED' && (err.port == 5432 || err.port == 5433)) {
        message = 'Database connection failed!';
    } else if (err.code == 'ECONNREFUSED' && (err.port == 6379)) {
        message = 'Redis connection failed!';
    }

    if(httpStatus == 401) {
        console.log('inside 401 ');
        redirectUrl = '/';
        redirectPage = 'login.ejs';
        message = 'Unauthorized Access!';
    }

    const contentType = req.headers['content-type'];
    const acceptType = req.headers.accept;

    if (contentType?.includes('application/json') || acceptType?.includes('application/json') || contentType?.includes('multipart/form-data')) {
        console.log('contentType >>> inside if', contentType);
        console.log("message>>>>>>>>> ", message);
        return res.status(httpStatus).json({ reqId, status, message, httpStatus, redirectUrl, data });
    } else {
        console.log('contentType >>> inside else', contentType);
        res.render(redirectPage, { reqId, status, message, httpStatus, redirectUrl, data });
    }
}

module.exports.asyncErrorHandler = (fn) => (...args) => {
    const next = args[args.length - 1];
    Promise.resolve(fn(...args)).catch(next);
}
