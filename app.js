const express = require('express');
const app = express();
const cors = require('cors');
const routing = require('./pg_Routing');
const { exp_config } = require('./config/pg_config');
var from;
var to;
var coords;

app.use(cors());


app.listen(5000, () => console.log('Listening at 5000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

//Make scheduled API call
//apiTask.apiUpdate();

// Check query validity -- should be modified later according to needs
function isValid(x) {
    return x.from && x.from.toString().trim() !== '' &&
        x.to && x.to.toString().trim() !== '';
}

// Receive address and spawn Python child process for geocoding, send coordinates back to client
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

app.post('/route', (req, res, next) => {
    console.log(req.body);
    from = req.body.from;
    to = req.body.to;
    routing.route(from, to)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((reason) => {
        res.status(500).json(reason);
      });
  });
