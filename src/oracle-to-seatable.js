const Oracle = require("./services/oracle");
const OracleSeaTable = require("./services/adapter");

const ORACLE_TABLE_NAME = "test_view_20221213";
const SEATABLE_NAME = "test_1234";

async function run() {
  const oracle = new Oracle();
  await oracle.init();
  const oracleSeaTable = new OracleSeaTable();
  await oracleSeaTable.init();

  const tableMetadata = await oracle.getOracleTableMetadata(ORACLE_TABLE_NAME);
  const tableData = await oracleSeaTable.createSeaTable(
    SEATABLE_NAME,
    tableMetadata
  );
  console.log(tableData);
  const rows = await oracle.getRows(ORACLE_TABLE_NAME);
  const result = await oracleSeaTable.insertTable(SEATABLE_NAME, rows);
  console.log(result);
}

run();
