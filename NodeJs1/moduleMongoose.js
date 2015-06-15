// Inclusion de Mongoose
var mongoose = require('mongoose');

var connect = function() {
	// On se connecte à la base de données
	// N'oubliez pas de lancer ~/mongodb/bin/mongod dans un terminal !
	mongoose.connect('mongodb://172.16.13.112/Capteurs', function(err) {
		if (err) {
			throw err;
		}
	});
}


//Definition des 2 schemas capteurs et releve
var sensorSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	type: String,
	location: String,
	date: {
		type: Date,
		default: Date.now
	}
});

var statementSchema = new mongoose.Schema({
	sensor_id: String,
	value: String,
	date: {
		type: Date,
		default: Date.now
	}
});


// Création du Model pour les commentaires
var sensorModel = mongoose.model('Capteurs', sensorSchema);
var statementModel = mongoose.model('Releves', statementSchema);


//Fonction pour se deconnecter de la BDD
var disconnect = function() {
	mongoose.connection.close();
}


//Fonction pour ajouter un nouveau capteur
var addSensor = function(label, nodeIDSensor, nameSensor, descriptionSensor, typeSensor, locationSensor) {
	// On crée une instance du Model
	var mySensor = new sensorModel({
		_id: label + '_' + nodeIDSensor
	});
	mySensor.name = nameSensor;
	mySensor.description = descriptionSensor;
	mySensor.type = typeSensor;
	mySensor.location = locationSensor;

	// On le sauvegarde dans MongoDB !
	mySensor.save(function(err) {
		if (err) {
			throw err;
		}
		console.log('Capteur ajouté avec succès !');
	});


}


//Fonction pour ajouter un nouveau releve
var addStatement = function(nodeIDSensor, label, valueStatement) {
	// On crée une instance du Model
	var myStatement = new statementModel({
		sensor_id: label + '_' + nodeIDSensor
	});
	myStatement.value = valueStatement;

	// On le sauvegarde dans MongoDB !
	myStatement.save(function(err) {
		if (err) {
			throw err;
		}
		console.log('Releve ajouté avec succès !');
	});
}


//Fonction pour supprimer un capteur
var removeSensor = function() {
	sensorModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Capteurs supprimés !');
	});
}


//Fonction pour supprimer un releve
var removeStatement = function() {
	statementModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Releves supprimés !');
	});
}


//Fonction pour afficher un capteur
var showSensor = function() {
	var query = sensorModel.find();
	query.exec(function(err, capts) {
		if (err) {
			throw err;
		}
		// On va parcourir le résultat et les afficher joliment
		var capt;
		for (var i = 0, l = capts.length; i < l; i++) {
			capt = capts[i];
			console.log('------------------------------');
			console.log('ID : ' + capt._id);
			console.log('Nom : ' + capt.name);
			console.log('Type : ' + capt.type);
			console.log('Localisation : ' + capt.location);
			console.log('Date Ajout : ' + capt.date);
			console.log('Description : ' + capt.description);
			console.log('------------------------------');
		}

	});

}


//Fonction pour afficher un releve
var showStatement = function() {
	var query = statementModel.find();
	query.exec(function(err, relevs) {
		if (err) {
			throw err;
		}
		// On va parcourir le résultat et les afficher joliment
		var relev;
		for (var i = 0, l = relevs.length; i < l; i++) {
			relev = relevs[i];
			console.log('------------------------------');
			console.log('ID : ' + relev.sensor_id);
			console.log('value : ' + relev.value);
			console.log('Date : ' + relev.date);
			console.log('------------------------------');
		}
	});
}



var searchStatementId = function(label, node) {
	var regVar = label+'_'+node
	var query = statementModel.find({sensor_id : { $regex: regVar, $options: 'xi' }});
	query.exec(function(err, relevs) {
		if (err) {
			throw err;
		}
		// On va parcourir le résultat et les afficher joliment
		var relev;
		for (var i = 0, l = relevs.length; i < l; i++) {
			relev = relevs[i];
			console.log('------------------------------');
			console.log('ID : ' + relev.sensor_id);
			console.log('value : ' + relev.value);
			console.log('Date : ' + relev.date);
			console.log('------------------------------');
		}
	});
}

exports.showSensor = showSensor;
exports.removeSensor = removeSensor;
exports.addSensor = addSensor;
exports.showStatement = showStatement;
exports.removeStatement = removeStatement;
exports.addStatement = addStatement;
exports.disconnect = disconnect;
exports.connect = connect;
exports.test = test;