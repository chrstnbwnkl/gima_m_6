const CronJob = require('cron').CronJob;
const axios = require('axios');

var job = new CronJob('*/1 * * * *', function() {
    axios.get('https://data.melbourne.vic.gov.au/resource/d6mv-s43h.json?$$app_token=f7dQeUuh1t2suGE3q3WMH8PPF&$limit=60')
    .then(response => {
        console.log(response.data);
        counter +=1;
  })
    .catch(error => {
        console.log(error);
  });
});

    module.exports = {
        apiCall: function() {
            job.start();
        }
    };    
