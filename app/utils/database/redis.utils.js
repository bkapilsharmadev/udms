const {redisClient} = require('../../config/redis');
const { CustomError } = require('../error/CustomError');

module.exports.setRedisData = async (key,value) => {
    await redisClient.set(key,JSON.stringify(value));
}

module.exports.getRedisData = async (key) => {
  
    if(key === undefined || !key) {
      throw new CustomError({
        modulename :'Cookie Not Found',
        httpStatus : 401,
        message : 'Invalid Request'
      });
    }

    const data = await redisClient.get(key);
    if(!data) {
      throw new CustomError({
        modulename :'Cookie Not Found',
        httpStatus : 401,
        message : 'Invalid Request'
      });
    }

    return JSON.parse(data)
}

