const dotenv = require('dotenv');

const read_db_config = {
  host: process.env.DB_HOST_1,
  user: process.env.DB_USER_1,
  password: process.env.DB_PASS_1,
  database: process.env.DB_NAME_1,
  port: process.env.DB_PORT_1,
  min:1,
  max: 1,
  application_name: 'UDMS Read Pool',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 200000,
};

const write_db_config = {
  host: process.env.DB_HOST_1,
  user: process.env.DB_USER_1,
  password: process.env.DB_PASS_1,
  database: process.env.DB_NAME_1,
  port: process.env.DB_PORT_1,
  min:1,
  max: 1,
  application_name: 'UDMS Write Pool',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
};


module.exports = { read_db_config, write_db_config }