var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('./moduleMongoose');
app.use(express.static(__dirname + '/'));

io.on('connection', function(client) {
        console.log('Client connected...');
});
app.get('/trucs', function(req, res) {
        mongoose.searchStatementid('temperature_3', function(err, state) {
                console.log('dans mongoose mon gars');
                res.json(state);

        });
});

app.get('/room', function(req, res) {
        mongoose.searchRoom(function(err, room) {
                res.json(room);
        });
});

app.get('/sensor', function(req, res) {
        mongoose.listSensor(function(err, sensors) {
                res.json(sensors);
        });
});

app.post('/associate', function(req, res) {
        //mongoose.association(req.idRoom, req.idSensor);
        mongoose.showSensor();
});

server.listen(8080);
mongoose.connect();