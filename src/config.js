const nodeConfig = require("config");

const config = {
  database: nodeConfig.get("database"),
  seaTable: nodeConfig.get("seaTable"),
};

module.exports = {
  config,
};
