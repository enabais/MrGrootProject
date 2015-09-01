var express = require('express');
var app = express();
var server = require('http').createServer(app);
//var io = require('socket.io')(server);
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
<<<<<<< HEAD
});

/*récupération des releves par rapport à un id dans la bdd*/
app.post('/statementId', function(req, res) {
        mongoose.listStatementId(req.body.sensorId, function(err, statement) {
                res.json(statement);
        });
});

/*récupération des releves par rapport à un id dans la bdd*/
app.post('/statementIdDate', function(req, res) {
        mongoose.listStatementIdDate(
                req.body.sensorId, 
                req.body.year1,
                req.body.month1,
                req.body.day1, 
                req.body.year2,
                req.body.month2,
                req.body.day2,
                function(err, statement) {
                        res.json(statement);
                }
        );
});

/*récupération des releves par rapport à un type de plusieurs capteurs dans la bdd*/
app.post('/statementTypeDate', function(req, res) {
        mongoose.listStatementTypeDate(
                req.body.sensorType, 
                req.body.year1,
                req.body.month1,
                req.body.day1, 
                req.body.year2,
                req.body.month2,
                req.body.day2,
                function(err, statement, types) {
                        res.json([types,statement]);
                }
        );
});

/*récupération des capteurs dans la bdd*/
app.get('/mainSensor', function(req, res) {
        mongoose.listMainSensor(function(err, msensors) {
                res.json(msensors);
        });
});

=======
});

/*récupération des capteurs dans la bdd*/
app.get('/mainSensor', function(req, res) {
        mongoose.listMainSensor(function(err, msensors) {
                res.json(msensors);
        });
});

>>>>>>> origin/master
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

<<<<<<< HEAD
/*ajout des cc*/
app.post('/cc', function(req, res) {
        mongoose.addCC(req.body.name, req.body.description);
=======
/*modification des cc*/
app.post('/modifycc', function(req, res) {
        mongoose.modifyNameCC(req.body.name, req.body.id);
>>>>>>> origin/master
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
<<<<<<< HEAD
        mongoose.listAlert(function(err, notif) {
=======
        mongoose.listNotif(function(err, notif) {
>>>>>>> origin/master
                res.json(notif);
        });
});

<<<<<<< HEAD
/*recuperation du nbe de notifs*/
app.get('/nbenotif', function(req, res) {
        mongoose.listData(function(err, mydata) {
                res.json(mydata);
        });
});

/*remise à 0 du compteur de notif*/
app.post('/resetcounter', function(req, res) {
        mongoose.resetCounter();
});

/*suppression de la notification selon son id*/
app.post('/deleteAlert', function(req, res) {
        mongoose.deleteAlert(req.body.id);
});

/*suppression de toutes les notifications*/
app.post('/removeAlert', function(req, res) {
        mongoose.removeAlert();
});

/*switch d'option d'alerte*/
app.post('/switchoption', function(req, res) {
        mongoose.switchOption(req.body.option);
})

=======
>>>>>>> origin/master
server.listen(8080);
mongoose.connect();