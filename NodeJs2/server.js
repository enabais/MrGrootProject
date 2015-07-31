var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('./moduleMongoose');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());


/*ajout de room*/
app.post('/room', function(req, res) {
        mongoose.addRoom(req.body.name, req.body.description);
});

/*recherche de room*/
app.get('/room', function(req, res) {
        mongoose.searchRoom(function(err, room) {
                res.json(room);
        });
});

/*suppression de room*/
app.post('/deleteRoom', function(req, res) {
        mongoose.deleteRoom(req.body.id);
});

/*récupération des capteurs dans la bdd*/
app.get('/sensor', function(req, res) {
        mongoose.listSensor(function(err, sensors) {
                res.json(sensors);
        });
});

/*récupération des releves dans la bdd*/
app.get('/statement', function(req, res) {
        mongoose.listStatement(function(err, statement) {
                res.json(statement);
        });
});

/*récupération des capteurs dans la bdd*/
app.get('/mainSensor', function(req, res) {
        mongoose.listMainSensor(function(err, msensors) {
                res.json(msensors);
        });
});

/*association des capteurs aux rooms*/
app.post('/associate', function(req, res) {
        mongoose.association(req.body.idRoom, req.body.idSensor);
});

/*dissociation*/
app.post('/removeAssociation', function(req, res) {
        mongoose.removeAssociation(req.body.idRoom, req.body.idSensor);
});

/*récupération des valeurs*/
app.post('/sensorStatement', function(req, res) {
        mongoose.searchStatementid(req.body.id);
});


/*ajout des cu*/
app.post('/cu', function(req, res) {
        mongoose.addCU(req.body.description, req.body.ref, req.body.op, req.body.val);
});

/*ajout des cus*/
app.post('/cus', function(req, res) {
        mongoose.addCUs(req.body.description, req.body.ref, req.body.op, req.body.val);
});

/*suppressin des cu*/
app.post('/deleteCU', function(req, res) {
        mongoose.deleteCU(req.body.id);
});

/*récupération des cu*/
app.get('/listcu', function(req, res) {
        mongoose.listCU(function(err, cu) {
                res.json(cu);
        });
});

/*modification des cc*/
app.post('/modifycc', function(req, res) {
        mongoose.modifyNameCC(req.body.name, req.body.id);
});

/*suppression des cc*/
app.post('/deleteCC', function(req, res) {
        mongoose.deleteCC(req.body.id);
});

/*récupération des cc*/
app.get('/listcc', function(req, res) {
        mongoose.listCC(function(err, cc) {
                res.json(cc);
        });
});

/*récupération des notifications*/
app.get('/notif', function(req, res) {
        mongoose.listNotif(function(err, notif) {
                res.json(notif);
        });
});

server.listen(8080);
mongoose.connect();