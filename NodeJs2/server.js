var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/'));

io.on('connection', function(client) {
	console.log('Client connected...');
});
app.get('/trucs', function(req, res) {
	mongoose.searchStatementid('temperature_3', function(err, state) {
		res.json(state);

	});
});

server.listen(8080);