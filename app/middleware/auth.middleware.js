const { CustomError } = require("../utils/error/CustomError");
const { getRedisData, setRedisData } = require('../utils/database/redis.utils');
const serverFetch = require('../utils/server-fetch/fetch');

module.exports.validateUserSession = async (req, res, next) => {
    const { user_id: cookieUserId } = req.cookies ?? undefined;
    const { user_id: headerUserId } = req.headers ?? undefined;
    const userId = cookieUserId || headerUserId;

    if (!userId || userId == undefined) {
        throw new CustomError({
            modulename: 'auth.middleware.js',
            httpStatus: 401,
            message: 'Invalid Request !'
        });
    }

    let data = await getRedisData(userId);

    const authUrl = process.env.VALIDATE_SESSION_URL
    const { status, headers, body } = await serverFetch(authUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...data
        }
    });

    if (status != 200) {
        throw new CustomError({
            modulename: 'auth.middleware.js',
            httpStatus: 401,
            message: 'Invalid Request !'
        });
    }

    const { accesstoken, refreshtoken } = headers;
    data = { ...data, accesstoken: accesstoken, refreshtoken: refreshtoken }
    await setRedisData(userId, data);
    console.log('username ', data.username);
    req.session_username = data.username;
    res.locals.username = data.username;
    next();
}

