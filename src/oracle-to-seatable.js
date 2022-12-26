const Oracle = require("./services/oracle");
const OracleSeaTable = require("./services/adapter");

const YEAR = 2023;
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ORACLE_TABLE_NAME = "sql_vasilenokpv.df_manmatrix";
const ORACLE_QUERY = `select * from sql_vasilenokpv.df_manmatrix t where t.cst = 3 and t.country = 'KZ' and t.type = 'CHAINS' and substr(t.pbm,1,4) = '2023'`;
const SEATABLE_NAME = "3_KZ_CHAINS_2023";

async function run() {
  const oracle = new Oracle();
  await oracle.init();
  const oracleSeaTable = new OracleSeaTable();
  await oracleSeaTable.init();

  const tableMetadata = await oracle.getOracleTableMetadata(ORACLE_TABLE_NAME, [
    "r",
    "seller",
    "sname",
    "pb",
    "optypeid",
    "optypename",
    "linescount1",
    "packscount1",
    "linescount2",
    "packscount2",
    "reportfile",
    "comm",
  ]);

  for await (const month of MONTHS) {
    const tableName = `3_KZ_CHAINS_${YEAR}${month.toString().padStart(2, "0")}`;
    const tableData = await oracleSeaTable.createSeaTable(
      tableName,
      tableMetadata
    );

    const query = `
      select * from sql_vasilenokpv.df_manmatrix t
      where
        t.cst = 3
        and t.country = 'KZ'
        and t.type = 'CHAINS'
        and substr(t.pbm,1,4) = '2023'
        and TO_CHAR(pb,'YYYY-MM') = '${YEAR}-${month
      .toString()
      .padStart(2, "0")}'`;
    const rows = await oracle.getRows(query);
    const result = await oracleSeaTable.insertTable(tableName, rows);
    console.log(result);
  }
}

run();
