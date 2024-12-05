const serverfetch = require("../utils/server-fetch/fetch");
const { generateRandomUUID } = require("../utils/utils");
const {
  setRedisData,
  getRedisData,
  deleteRedisData,
} = require("../utils/database/redis.utils");
const { COOKIE_OPTIONS } = require("../constants/index");
const { CustomError } = require("../utils/error/CustomError");
const serverFetch = require("../utils/server-fetch/fetch");
const {
  getUserDocumentStage,
} = require("../services/document-stage-users.service");
const {
  internalServerError,
  forbiddenAccessError,
  unauthorizedAccessError,
  invalidRequestError,
  dbError,
} = require("../utils/error/error");

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

  const documentStage = await getUserDocumentStage(credentials.username);
  console.log("document stage ", documentStage);
  const userDocumentStage = documentStage?.[0]?.document_stage ?? "";
  const firstName = documentStage?.[0]?.first_name ?? "";
  const lastName = documentStage?.[0]?.last_name ?? "";
  const randomId = generateRandomUUID();
  const redisData = {
    username: credentials.username,
    documentStage: userDocumentStage,
    firstName,
    lastName,
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
      data: {},
    });
  }

  const userSession = await getRedisData(userId);
  console.log("user session details ", JSON.stringify(userSession));
  const logout_url = process.env.LOGOUT_URL;

  const { status, headers, body } = await serverFetch(logout_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      devicetoken: userSession.devicetoken,
      sessiontoken: userSession.sessiontoken
    },
  });

  console.log("logout url status ", JSON.stringify(body), status);

  await deleteRedisData(userId);
  res.clearCookie("user_id", {
    path: "/",
    domain: process.env.COOKIE_DOMAIN,
  });
  res.removeHeader("user_id");

};
