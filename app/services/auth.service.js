const serverfetch = require("../utils/server-fetch/fetch");
const { generateRandomUUID } = require("../utils/utils");
const { setRedisData, getRedisData } = require("../utils/database/redis.utils");
const { COOKIE_OPTIONS } = require("../constants/index");
const { CustomError } = require("../utils/error/CustomError");
const serverFetch = require("../utils/server-fetch/fetch");
const { internalServerError,forbiddenAccessError } = require("../utils/error/error");


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
  const userId = req.cookies.user_id ?? undefined;
  if (userId == undefined) {
    throw new CustomError({
      moduleName: "auth.service.js",
      message: "Invcalid Request !",
      httpStatus: 401,
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

  if (status == 500) {
    throw new CustomError({
      moduleName: "auth.service.js",
      message: "Invcalid Request !",
      httpStatus: 401,
    });
  }

  console.log("logout >>", status, headers, body);
};
