var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('./moduleMongoose');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());

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

app.post('/room', function(req, res) {
        mongoose.addRoom(req.body.name, req.body.description);
});

app.post('/associate', function(req, res) {
        mongoose.association(req.body.idRoom, req.body.idSensor);
});

app.post('/deleteRoom', function(req, res) {
        mongoose.deleteRoom(req.body.id);
});

server.listen(8080);
mongoose.connect();