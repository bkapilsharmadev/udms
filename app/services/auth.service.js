const serverfetch = require("../utils/server-fetch/fetch");
const { generateRandomUUID } = require("../utils/utils");
const { setRedisData, getRedisData, deleteRedisData } = require("../utils/database/redis.utils");
const { COOKIE_OPTIONS } = require("../constants/index");
const { CustomError } = require("../utils/error/CustomError");
const serverFetch = require("../utils/server-fetch/fetch");
const { internalServerError, forbiddenAccessError, unauthorizedAccessError, invalidRequestError, dbError } = require("../utils/error/error");


module.exports.authenticateService = async (credentials, req, res) => {
    credentials = { ...credentials, rememberMe: false };
    const auth_url = process.env.AUTH_URL;
    const result = await serverfetch(auth_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: JSON.stringify(credentials),
    });

    if (result.status === 500) {
        throw internalServerError({
            moduleName: "auth.service.js",
            message: "Request Failed !",
            data: result,
        });
    }

    if (result.status !== 200) {
        throw forbiddenAccessError({
            moduleName: "auth.service.js",
            message: "Failed To Authenticate !",
            data: result,
        });
    }

    const randomId = generateRandomUUID();
    const redisData = {
        username: credentials.username,
        accesstoken: result.headers.accesstoken,
        refreshtoken: result.headers.refreshtoken,
        devicetoken: result.headers.devicetoken,
        sessiontoken: result.headers.sessiontoken,
    };

    await setRedisData(randomId, redisData);
    res.cookie("user_id", randomId, {
        COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        domain: process.env.COOKIE_DOMAIN,
    });

    res.setHeader("user_id", randomId);
    return { status: 200, message: result.body.message };
};

module.exports.logout = async (req, res, next) => {
    const { user_id: cookieUserId } = req.cookies ?? undefined;
    const { user_id: headerUserId } = req.headers ?? undefined;
    const userId = cookieUserId || headerUserId;

    if (!userId || userId == undefined) {
        throw invalidRequestError({
            modulename: "auth.middleware.js",
            message: "Invalid Request !",
            data: {}
        });
    }

    const userSession = await getRedisData(userId);

    const username = userSession.username;
    const logout_url = process.env.LOGOUT_URL;
    const { status, headers, body } = await serverFetch(logout_url, {
        method: "POST",
        data: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (status != 200) {
        throw unauthorizedAccessError({
            modulename: "auth.middleware.js",
            message: "Unauthorized Access !",
            data: {}
        });
    }

    await deleteRedisData(userId);
};
