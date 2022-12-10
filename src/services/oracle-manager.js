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
}

module.exports = OracleSeaTable;
