const Oracle = require("./services/oracle");
const OracleSeaTable = require("./services/oracle-manager");

const SEATABLE_NAME = "Table1";
const ORACLE_TABLE_NAME = "test_20221210";

async function run() {
  const oracle = new Oracle();
  await oracle.init();
  const oracleSeaTable = new OracleSeaTable();
  await oracleSeaTable.init();

  const tableData = await oracleSeaTable.getTable(SEATABLE_NAME);
  console.log(tableData);
  await oracle.createTableFromMetadata(ORACLE_TABLE_NAME, tableData.metadata);
  const result = await oracle.insertTable(ORACLE_TABLE_NAME, tableData);
  console.log("result", result);
  // try {
  //   const result = await oracle.execute(
  //     `create table todoitem (
  //       id number,
  //       description varchar2(4000),
  //       creation_ts timestamp,
  //       done number(1,0))`
  //   );
  //   console.log(result.rows);
  // } catch (err) {
  //   console.error(err);
  // } finally {
  //   if (oracle.connection) {
  //     try {
  //       await oracle.close();
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // }
}

run();
