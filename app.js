const express = require('express');
const app = express();
const cors = require('cors');
const routing = require('./pg_Routing');
const database = require('./config/database');
const { exp_config } = require('./config/pg_config');
var from;
var to;
var coords;

app.use(cors());


app.listen(5000, () => console.log('Listening at 5000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

app.get('/about', function (req, res) {
    res.sendFile( __dirname + "/" + "public/about.html" );
 })

 
//Make scheduled API call
database.apiUpdate();

app.post('/route', (req, res, next) => {
    from = req.body.from;
    to = req.body.to;
    routing.route(from, to)
      .then((result) => {
        //console.log("Returned Res:", result);
        res.status(200).json(result);
      })
      .catch((reason) => {
        res.status(500).json(reason);
      });
  });
