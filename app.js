const express = require('express');
const app = express();
const apiTask = require('./apiTask');
const cors = require('cors');
var from;
var to;
var coords;

app.use(cors());

app.listen(3000, () => console.log('Listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//Make scheduled API call
//apiTask.apiUpdate();

function isValid(x) {
    return x.from && x.from.toString().trim() !== '' &&
        x.to && x.to.toString().trim() !== '';
}

app.post('/navigate', (req, res) => {
    if (isValid(req.body)) {
        from = req.body.from.toString();
        to = req.body.to.toString();
        const spawn = require("child_process").spawn;
        const pythonProcess = spawn('python',["./test.py", from, to]);
        pythonProcess.stdout.on('data', (data) => {
            coords = JSON.parse(data.toString());
            res.json({message: coords});
            console.log(coords);
        });

    } else {
        res.status(422);
        res.json({
            message: 'Request can not be empty!'
        });
    }
});