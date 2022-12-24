const oracledb = require("oracledb");
const { config } = require("../config");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

function toLowerKeys(obj) {
  return Object.keys(obj).reduce((accumulator, key) => {
    const newKey = key.toLowerCase();
    const key_ = newKey.endsWith("_") ? newKey.slice(0, -1) : newKey;

    const isFile = obj[key]?.toString()?.includes(`"type":"file"`);
    if (isFile) {
      console.log("file", isFile, obj);
    }
    accumulator[key_] = isFile ? [JSON.parse(obj[key])] : obj[key];
    return accumulator;
  }, {});
}

class Oracle {
  connection;

  constructor() {}

  async init() {
    const { username, password, connectionUrl } = config.database;

    this.connection = await oracledb.getConnection({
      user: username,
      password,
      connectString: connectionUrl,
    });
  }

  async close() {
    await this.connection.close();
  }

  async createTableFromMetadata(tableName, metadata) {
    const types = {
      number: "NUMBER",
      "auto-number": "NUMBER",
      file: "VARCHAR2",
      text: "VARCHAR2",
      "multiple-select": "VARCHAR2",
      date: "VARCHAR2",
    };

    const typesWithoutLength = ["DATE", "BLOB"];

    const columns = [];

    for (let [key, value] of Object.entries(metadata)) {
      const oracleType = types[value.type];
      if (!oracleType)
        throw new Error(
          "Wrong type mapping for metadata type: " + value.type,
          oracleType
        );

      let type = "";

      if (typesWithoutLength.includes(oracleType)) {
        type += oracleType;
      } else {
        type += oracleType + "(" + value.maxLength + ")";
      }

      const column = `${key} ${type}`;
      columns.push(column);
    }

    const query = `
      CREATE TABLE ${tableName} (
        ${columns.join(", ")}
      )
    `;

    console.log("###### CREATE TABLE " + tableName + " ##################");
    console.log(query);

    await this.execute(query);
  }

  async insertTable(tableName, tableData) {
    const columns = Object.keys(tableData.metadata).join(",");
    const rows = [];
    tableData.data.forEach((row) => {
      const rowData = Object.keys(tableData.metadata).map((metaKey) => {
        const data = typeof row[metaKey] === "object" ? null : row[metaKey];
        // typeof row[metaKey] === "string" ? `'${row[metaKey]}'` : row[metaKey];
        return data || null;
      });

      // let str = "";
      // for (let i = 0; i < rowData.length; i++) {
      //   str += `${rowData[i]},`;
      // }
      // const newStr = str.slice(0, -1);
      rows.push(rowData);
    });
    console.log("rows", rows);
    const sql = `insert into ${tableName} (${columns}) values(${new Array(
      columns.length
    )
      .fill(0)
      .map((_, index) => `:${index + 1}`)
      .join(" ")})`;
    const result = await this.connection.executeMany(sql, rows);
    console.log(result);
    await this.connection.commit();
  }

  async execute(query) {
    return this.connection.execute(query);
  }

  async getOracleTableMetadata(tableName) {
    const isAnotherUserTable = tableName.includes(".");
    const [owner, table] = tableName.split(".");

    const sql = `
      select lower(column_name) column_name, data_type type
      from all_tab_columns
      where
      ${
        isAnotherUserTable
          ? `TABLE_NAME = upper('${table}') AND owner = upper('${owner}')`
          : `TABLE_NAME = upper('${tableName}')`
      }
    `;
    console.log("sql", sql);
    const response = await this.execute(sql);
    console.log("response", response);
    const data = response.rows.map((row) => toLowerKeys(row));
    console.log("data", data);

    return data.map((row) => ({
      ...row,
      column_name: row.column_name.endsWith("_")
        ? row.column_name.slice(0, -1)
        : row.column_name,
    }));
  }

  async getRows(query) {
    const response = await this.execute(query);
    const rows = response.rows.map((row) => toLowerKeys(row));
    return rows;
  }
}

module.exports = Oracle;
