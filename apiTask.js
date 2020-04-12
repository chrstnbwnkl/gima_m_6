const CronJob = require('cron').CronJob;
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const { Pool, Client } = require('pg');
const conString = process.env.DATABASE_URL;

var job = new CronJob('*/1 * * * *', async function() {
    await axios.get('https://data.melbourne.vic.gov.au/resource/d6mv-s43h.json?$$app_token=f7dQeUuh1t2suGE3q3WMH8PPF&$limit=60')
    .then( response => {
        const pool = new Pool({
            connectionString: conString
        });
        pool.query('SELECT * FROM test_table;'
            , (err, res) => {
            console.log(err, res, "Test")
            pool.end()
          });
  })
    .catch(error => {
        console.log(error);
  });
});

    module.exports = {
        apiUpdate: function() {
            job.start();
        }
    };    
