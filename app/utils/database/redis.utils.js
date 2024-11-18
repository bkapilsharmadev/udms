const { redisClient } = require("../../config/redis");
const { unauthorizedAccessError } = require("../error/error");

module.exports.setRedisData = async (key, value) => {
  await redisClient.set(key, JSON.stringify(value));
};

module.exports.getRedisData = async (key) => {
  if (key === undefined || !key) {
    throw unauthorizedAccessError({
      modulename: "redis.utils.js",
      message: "Invalid Request !",
    });
  }

  const data = await redisClient.get(key);
  if (!data) {
    throw unauthorizedAccessError({
      modulename: "redis.utils.js",
      message: "Invalid Request !",
    });
  }

  return JSON.parse(data);
};
