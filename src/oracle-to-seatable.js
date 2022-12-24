const Oracle = require("./services/oracle");
const OracleSeaTable = require("./services/adapter");

const ORACLE_TABLE_NAME = "sql_vasilenokpv.df_manmatrix";
const ORACLE_QUERY = `select * from sql_vasilenokpv.df_manmatrix t where t.cst = 3 and t.country = 'KZ' and t.type = 'CHAINS' and substr(t.pbm,1,4) = '2023'`;
const SEATABLE_NAME = "3_KZ_CHAINS_2023";

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
  const rows = await oracle.getRows(ORACLE_QUERY);
  const result = await oracleSeaTable.insertTable(SEATABLE_NAME, rows);
  console.log(result);
}

run();
