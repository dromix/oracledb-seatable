const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  database: {
    username: process.env.ORACLE_USERNAME,
    password: process.env.ORACLE_PASSWORD,
    connectionUrl: process.env.ORACLE_CONNECTION_URL,
  },
  seaTable: {
    host: process.env.SEATABLE_HOST,
    apiKey: process.env.SEATABLE_API_KEY,
  },
};
