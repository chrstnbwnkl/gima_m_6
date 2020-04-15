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

    module.exports = {
        apiUpdate: function() {
            job.start();
        }
    };    
