const express = require('express');
const app = express();
const apiTask = require('./apiTask');
const from = "688 Bourke Street, Melbourne, Australia";
const to = "356 Collins Street, Melbourne, Australia";

app.listen(3000, () => console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//Make scheduled API call
apiTask.apiUpdate();

//Testing Python child process
const spawn = require("child_process").spawn;
const pythonProcess = spawn('python',["./test.py", from, to]);
pythonProcess.stdout.on('data', (data) => {
    console.log(data.toString());
});