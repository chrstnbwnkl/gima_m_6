const express = require('express');
const app = express();
const apiTask = require('./apiTask')


app.listen(3000, () => console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// Make scheduled API call
apiTask.apiCall();
