const { SeaTable } = require("../lib/sea-table/sea-table");
const { getValueLength } = require("../helpers/index");

class OracleSeaTable {
  seaTable;

  async init() {
    this.seaTable = new SeaTable();
    await this.seaTable.authorize();
  }

  async getTable(tableName) {
    const columns = await this.seaTable.getColumns(tableName);
    const rows = await this.seaTable.getRows(tableName);

    const result = {
      metadata: {},
      data: [],
    };

    // Init metadata
    Object.keys(columns).forEach((column) => {
      result.metadata[columns[column].cyrillicName] = {
        type: columns[column].type,
        maxLength: 5,
      };
    });

    for (const row of rows) {
      const newRow = {};
      for (const column of Object.keys(row)) {
        if (columns.hasOwnProperty(column)) {
          const columnData = columns[column];

          newRow[columnData.cyrillicName] =
            columnData.type === "multiple-select"
              ? row[column].join(" ")
              : row[column];

          newRow[columnData.cyrillicName] =
            columnData.type === "file"
              ? JSON.stringify(row[column][0])
              : row[column];

          if (
            result.metadata[columnData.cyrillicName].maxLength <
            getValueLength(newRow[columnData.cyrillicName])
          ) {
            result.metadata[columnData.cyrillicName].maxLength = getValueLength(
              newRow[columnData.cyrillicName]
            );
          }
        }
      }
      result.data.push(newRow);
    }

    return result;
  }

  async createSeaTable(tableName, tableMetadata) {
    const typeMapper = {
      NUMBER: "number",
      VARCHAR2: "text",
      DATE: "date",
    };

    const tableData = {
      table_name: tableName,
      columns: tableMetadata.map((column) => ({
        column_name: column.column_name,
        column_type: column.column_name.includes("file")
          ? "file"
          : typeMapper[column.type] || "text",
        column_data: null,
      })),
    };

    return this.seaTable.createSeaTable(tableData);
  }

  async insertTable(tableName, rows) {
    const data = { rows, table_name: tableName };
    const result = await this.seaTable.bulkInsert(data);
    return result;
  }
}

module.exports = OracleSeaTable;
