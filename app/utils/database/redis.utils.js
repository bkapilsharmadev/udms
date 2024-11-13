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


module.exports.deleteRedisData = async (key) => {
  if(key === undefined || !key) {
    throw new CustomError({
        modulename :'Cookie Not Found',
        httpStatus : 401,
        message : 'Invalid Request'
    });
  }

  const deleteCookies =  await redisClient.del(key);
  console.log('deleteCookies =====>>>>>', deleteCookies);
  return deleteCookies === 1 ? {
           status : 200,
           message : 'Session deleted'
  } : {
           status : 401,
           message : ' Failed  to session deleted' 
  }
}
