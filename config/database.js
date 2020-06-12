const CronJob = require('cron').CronJob;
const axios = require('axios');
const pg = require('pg/lib');
const { config_db } = require('./pg_config');
const conString = process.env.DATABASE_URL;

const config_connection = {
  host: config_db.host,
  port: config_db.port,
  user: config_db.username,
  password: config_db.password,
  database: config_db.database,
  ssl: config_db.ssl,
  max: config_db.max_client,
  idleTimeoutMillis: config_db.idleTimeoutMillis,
  connectionTimeoutMillis: config_db.connectionTimeoutMillis
}

const pool = new pg.Pool({
  connectionString: conString
});

//Conn check
const connect = function (callback) {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      console.log("database poll connection successful at "+ result.rows[0].now)
    })
  })
  return pool.connect(callback);
};

// First connection
connect();
pool.on('error', (err, client) => {
  // generate error
  console.log(client);
  console.error('idle client error', err.message, err.stack);
});

// Pass each query to pool
const query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

// Scheduled API query from Melbourne -- maybe change this to ID and total count only?
var job = new CronJob('*/1 * * * *', async function() {
    await axios.get('https://data.melbourne.vic.gov.au/resource/d6mv-s43h.json?$$app_token=f7dQeUuh1t2suGE3q3WMH8PPF&$limit=60')
    .then( response => {
        const ped_count = JSON.stringify(response.data);
        pool.query(`
        INSERT INTO ped_count SELECT * FROM jsonb_populate_recordset(NULL::ped_count, '${ped_count}'::jsonb); 
        `
        , (err, res) => {
            console.log(err, res);
            pool.end()
          });
  })
    .catch(error => {
        console.log(error);
  });
});
const apiUpdate = function() {
    job.start;
}





// PgRouting query
function routeQuery(start, end) {
    const query = `
    SELECT *, st_transform(geom_way, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom, ${config_pg.output_srid})) wkt FROM pgr_dijkstra(
        'SELECT id, source, target, cost_len as cost, rcost_len as reverse_cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1),
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(the_geom, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1),
        false) as dj, ${config_pg.table} as ln where dj.edge=ln."id";`;
    return query;
}


module.exports = {
    pool,
    query,
    apiUpdate,
    connect
}
