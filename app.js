const express = require('express');
const app = express();
const apiTask = require('./apiTask');

app.listen(3000, () => console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

// Make scheduled API call
//apiTask.apiUpdate();

// Testing Python child process
const spawn = require("child_process").spawn;
const pythonProcess = spawn('python',["./test.py", "Say hello ", "from "]);
pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString());
});
