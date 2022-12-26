# OracleDB & SeaTable uploader

## Features

1. Upload data from seaTable to oracle db
2. Upload data from oracle to SeaTable

## How to run

1. Create .env file in root of project & fullfil all necessary data, like apiKey for seatable or credentials to oracle db with connection string
2. Define table name source table & destination table inside scripts
3. Run the certain script `node src/oracle-to-seatable.js` or `node src/seatable-to-oracle`
