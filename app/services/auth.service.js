const serverfetch = require('../utils/server-fetch/fetch')
const { generateRandomUUID } = require('../utils/utils')
const { setRedisData } = require('../utils/database/redis.utils')
const { COOKIE_OPTIONS } = require('../constants/index')
const { CustomError } = require('../utils/error/CustomError');


module.exports.authenticateService = async (credentials, req, res) => {
    credentials = { ...credentials, rememberMe: false };
    const auth_url = process.env.AUTH_URL;
    const result = await serverfetch(auth_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(credentials)
    });

    if (result.status === 500) {
        throw new CustomError({
            moduleName: 'auth.service.js',
            message: 'Request Failed !',
            httpStatus: 500,
        });
    }

    if (result.status !== 200) {
        throw new CustomError({
            moduleName: 'auth.service.js',
            message: 'Failed To Authenticate !',
            httpStatus: 401,
        });
    }

    const randomId = generateRandomUUID();
    const redisData = {
        username: credentials.username,
        accesstoken: result.headers.accesstoken,
        refreshtoken: result.headers.refreshtoken,
        devicetoken: result.headers.devicetoken,
        sessiontoken: result.headers.sessiontoken
    }

    await setRedisData(randomId, redisData);
    res.cookie('user_id', randomId, {
        COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
        domain: process.env.COOKIE_DOMAIN
    });

    return { status: 200, message: result.body.message };
}