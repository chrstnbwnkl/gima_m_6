const CronJob = require('cron').CronJob;
const axios = require('axios');
const pg = require('pg/lib');
const { config_db } = require('./pg_config');
const { exec } = require('child_process');
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
    console.log('Performing CRON Job');
    await axios.get('https://data.melbourne.vic.gov.au/resource/d6mv-s43h.json?$$app_token=f7dQeUuh1t2suGE3q3WMH8PPF&$limit=60')
    .then( response => {
      //console.log(response);
        const ped_count = JSON.stringify(response.data);
        pool.query(`
        UPDATE ped_count
SET total_of_directions = api.total_of_directions,
	time = api.time,
	date = api.date,
	date_time = api.date_time,
	direction_1 = api.direction_1,
	direction_2 = api.direction_2
FROM (SELECT * FROM jsonb_populate_recordset(NULL::ped_count, '${ped_count}'::jsonb)) AS api
WHERE api.sensor_id = ped_count.sensor_id; 
        `
        , (err, res) => {
            //console.log(err, res);
          });
          exec("Rscript krige_update.R", (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          });

  })
    .catch(error => {
        console.log(error);
  });
});
const apiUpdate = function() {
    job.start();
}



module.exports = {
    pool,
    query,
    apiUpdate,
    connect
}
