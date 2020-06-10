const dotenv = require('dotenv');
dotenv.config();

const host = process.env.host; 
const port = process.env.port; 
const username = process.env.username; 
const password = process.env.username; 
const database = process.env.database; 
const ssl = false; // setup ssl for database
const max_client = 500; // max number of clients in the pool
// how long a client is allowed to remain idle before being closed
const idleTimeoutMillis = 30000;
// return an error after 1 second if connection could not be established
const connectionTimeoutMillis = 30000;
// set express server port
const port_exp = 5000;
const table = 'at_2po_4pgr';
const vertices_table = 'at_2po_4pgr_vertices_pgr';
const input_srid = '4326';
const output_srid = '4326';

exports.config_db = {
    host,
    port,
    username,
    password,
    database,
    ssl,
    max_client,
    idleTimeoutMillis,
    connectionTimeoutMillis,
  };

exports.exp_config = { port: port_exp };

exports.config_pg = {
    table, vertices_table, input_srid, input_srid, output_srid,
  };