const { Client } = require("undici");
const { config } = require("../../config");
const { transliterate } = require("../../helpers/index");

const { host, apiKey } = config.seaTable;

class SeaTable {
  client;
  #baseToken;
  #baseId;

  constructor() {
    this.client = new Client(host);
  }

  async authorize() {
    const response = await this.#fetch({
      path: "/api/v2.1/dtable/app-access-token/",
      method: "GET",
      headers: { authorization: `Token ${apiKey}` },
    });

    this.#baseToken = response.access_token;
    this.#baseId = response.dtable_uuid;
  }

  async getColumns(tableName) {
    const response = await this.#fetch({
      path: `/dtable-server/api/v1/dtables/${
        this.#baseId
      }/columns/?table_name=${tableName}`,
      method: "GET",
      headers: { authorization: `Token ${this.#baseToken}` },
    });

    const columns = {};

    for (const column of response.columns) {
      columns[column.name] = {
        cyrillicName: `${transliterate(column.name)}_`,
        type: column.type,
      };
    }

    return columns;
  }

  async getRows(tableName) {
    const response = await this.#fetch({
      path: `/dtable-server/api/v1/dtables/${
        this.#baseId
      }/rows/?table_name=${tableName}`,
      method: "GET",
      headers: { authorization: `Token ${this.#baseToken}` },
    });

    return response.rows;
  }

  async createSeaTable(tableData) {
    const response = await this.#fetch({
      path: `/dtable-server/api/v1/dtables/${this.#baseId}/tables/`,
      method: "POST",
      headers: {
        authorization: `Token ${this.#baseToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tableData),
    });
    return response;
  }

  async bulkInsert(rowsData) {
    console.log("rows", rowsData);
    const response = await this.#fetch({
      path: `/dtable-server/api/v1/dtables/${this.#baseId}/batch-append-rows/`,
      method: "POST",
      headers: {
        authorization: `Token ${this.#baseToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rowsData),
    });
    return response;
  }

  async #fetch(options) {
    const { statusCode, headers, body } = await this.client.request(options);
    console.log("statusCode", statusCode);

    return body.json();
  }
}

module.exports = {
  SeaTable,
};
