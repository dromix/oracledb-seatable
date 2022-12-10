const oracledb = require("oracledb");
const { config } = require("../config");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

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
      file: "BLOB",
      text: "VARCHAR2",
      "multiple-select": "VARCHAR2",
      date: "DATE",
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
        const data =
          typeof row[metaKey] === "string" ? `'${row[metaKey]}'` : row[metaKey];
        return data || null;
      });

      let str = "";
      for (let i = 0; i < rowData.length; i++) {
        str += `${rowData[i]},`;
      }
      const newStr = str.slice(0, -1);
      rows.push(newStr);
    });

    // rows[0] = rows[0].replace("union all ", "");
    const selects = [];
    rows.forEach((row) => {
      const select = `SELECT ${row} FROM dual UNION ALL `;
      selects.push(select);
    });

    selects[selects.length - 1] = selects.at(-1).replace(/union all /gi, "");

    console.log("#### INSERT TABLE " + tableName + " #######");
    const query = `INSERT INTO ${tableName} (${columns})
    WITH p AS (
      ${selects.join(" ")}
    )
    SELECT * FROM p
    `;
    console.log(query);

    const result = await this.execute(query);
    console.log(result);
    await this.connection.commit();
  }

  async execute(query) {
    return this.connection.execute(query);
  }
}

module.exports = Oracle;
