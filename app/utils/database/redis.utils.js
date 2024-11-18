const { redisClient } = require("../../config/redis");
const { unauthorizedAccessError,dbError,invalidRequestError } = require("../error/error");

module.exports.setRedisData = async (key, value) => {
  await redisClient.set(key, JSON.stringify(value));
};

module.exports.getRedisData = async (key) => {
  if (key === undefined || !key) {
    throw invalidRequestError({
      modulename: "redis.utils.js",
      message: "Invalid Request !",
    });
  }

  const data = await redisClient.get(key);
  if (!data) {
    throw dbError({
      modulename: "redis.utils.js",
      message: "Error In Getting Data !",
    });
  }

  return JSON.parse(data);
};

module.exports.deleteRedisData = async () => {
  if(key === undefined || !key) {
    throw invalidRequestError({
      modulename: "redis.utils.js",
      message: "Invalid Request !",
    });
  }

  const deleteCookies =  await redisClient.del(key);
  if(deleteCookies != 1) {
    throw dbError({
      modulename: "redis.utils.js",
      message: "Error In Deleting Data !",
    });
  }
    
}
