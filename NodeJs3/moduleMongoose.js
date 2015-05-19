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

var roomSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	location: String,
	sensor: [],
	date: {
		type: Date,
		default: Date.now
	}
});


//Architecture d'un capteur
var sensorSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	type: String,
	location: String,
	statement: [],
	date: {
		type: Date,
		default: Date.now
	}
});


//Architecture d'une valeur
var statementSchema = new mongoose.Schema({
	sensor_id: String,
	value: String,
	date: {
		type: Date,
		default: Date.now
	}
});


//schema condition unitaire
var CUSchema = new mongoose.Schema({
	_id: String,
	CC_id: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	ref: String,
	op: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	val: String,
	ref2: String,
	date: {
		type: Date,
		default: Date.now
	}
});


//schema condition Composée
var CCSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	ref: [],
	date: {
		type: Date,
		default: Date.now
	}
});


//schema Déclencheur
var triggerSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	CC_id: String,
	Statement_id: String,
	date: {
		type: Date,
		default: Date.now
	}
});


//schema Déclencheur
var alertSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	trigger_id: String,
	action: String,
	date: {
		type: Date,
		default: Date.now
	}
});



// Création du Model pour les commentaires
var sensorModel = mongoose.model('Capteurs', sensorSchema);
var statementModel = mongoose.model('Releves', statementSchema);
var roomModel = mongoose.model('Room', roomSchema);
var CUModel = mongoose.model('CU', CUSchema);
var CCModel = mongoose.model('CC', CCSchema);
var triggerModel = mongoose.model('trigger', triggerSchema);
var alertModel = mongoose.model('alert', alertSchema);


//Fonction pour se deconnecter de la BDD
var disconnect = function() {
	mongoose.connection.close();
}


//Fonction pour ajouter une nouvelle piece
var addRoom = function(idRoom, nameRoom, descriptionRoom, locationRoom) {
	// On crée une instance du Model
	var myRoom = new roomModel({
		_id: idRoom
	});
	myRoom.name = nameRoom;
	myRoom.description = descriptionRoom;
	myRoom.location = locationRoom;

	// On le sauvegarde dans MongoDB !
	myRoom.save(function(err) {
		if (err) {
			throw err;
		}

		console.log('Room ajouté avec succès !');
	});


}



//Fonction pour ajouter une nouvelle condition unitaire
var addCU = function(idCU, CCCU, descriptionCU, refCU, opCU, valCU) {
	// On crée une instance du Model
	var myCU = new CUModel({
		_id: idCU
	});
	myCU.CC_id = CCCU;
	myCU.description = descriptionCU;
	myCU.ref = refCU;
	myCU.op = opCU;
	myCU.val = valCU;


	var query = CCModel.findOne({
		_id: CCCU
	});
	query.exec(function(err, myCC) {
		if (err) {
			throw err;
		}

		myCC.ref.push(myCU._id);
		myCC.save(function(err) {
			if (err) {
				throw err;
			}

		});

		// On le sauvegarde dans MongoDB !
		myCU.save(function(err) {
			if (err) {
				throw err;
			}

			console.log('condition unitaire ajoutée avec succès !');
		});
	});


}


//Fonction pour ajouter une nouvelle condition Composée
var addCC = function(idCC, nameCC, descriptionCC) {
	// On crée une instance du Model
	var myCC = new CCModel({
		_id: idCC
	});
	myCC.name = nameCC;
	myCC.description = descriptionCC;

	// On le sauvegarde dans MongoDB !
	myCC.save(function(err) {
		if (err) {
			throw err;
		}

		console.log('condition composé ajoutée avec succès !');
	});


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

	/*
		var query = roomModel.findOne({
			_id: locationSensor
		});
		query.exec(function(err, myRoom) {
			if (err) {
				throw err;
			}

			myRoom.sensor.push(label + '_' + nodeIDSensor);
			myRoom.save(function(err) {
				if (err) {
					throw err;
				}

			});

		});

	*/

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



	var query = sensorModel.findOne({
		_id: label + '_' + nodeIDSensor
	});
	query.exec(function(err, mySensor) {
		if (err) {
			throw err;
		}

		mySensor.statement.push(myStatement._id);
		mySensor.save(function(err) {
			if (err) {
				throw err;
			}

		});
		// On le sauvegarde dans MongoDB !
		myStatement.save(function(err) {
			if (err) {
				throw err;
			}
			console.log('Releve ajouté avec succès !');
		});
	});
}


//Fonction pour ajouter un nouveau releve
var addTrigger = function(nodeIDSensor, label, valueStatement) {
	// On crée une instance du Model
	var myStatement = new statementModel({
		sensor_id: label + '_' + nodeIDSensor
	});
	myStatement.value = valueStatement;



	var query = sensorModel.findOne({
		_id: label + '_' + nodeIDSensor
	});
	query.exec(function(err, mySensor) {
		if (err) {
			throw err;
		}

		mySensor.statement.push(myStatement._id);
		mySensor.save(function(err) {
			if (err) {
				throw err;
			}

		});
		// On le sauvegarde dans MongoDB !
		myStatement.save(function(err) {
			if (err) {
				throw err;
			}
			console.log('Releve ajouté avec succès !');
		});
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


//Fonction pour supprimer un CC
var removeCC = function() {
	CCModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('CC supprimés !');
	});
}


//Fonction pour supprimer un CU
var removeCU = function() {
	CUModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('CU supprimés !');
	});
}


//Fonction pour supprimer une room
var removeRoom = function() {
	roomModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Room supprimés !');
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
			//On parcourt le tableau des états
			for (var j = 0, k = capt.statement.length; j < k; j++) {
				var statements = capt.statement[j];
				console.log('IDStatement : ' + statements);
			}

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


//Fonction pour afficher une condition composée
var showCC = function() {
	var query = CCModel.find();
	query.exec(function(err, CCs) {
		if (err) {
			throw err;
		}
		//On parcours les résultats et on les affiche
		var CC;
		for (var i = 0, l = CCs.length; i < l; i++) {
			CC = CCs[i];
			console.log('------------------------------');
			console.log('ID : ' + CC._id);
			console.log('Nom : ' + CC.name);
			console.log('Description : ' + CC.description);
			//On parcourt le tableau des relevé
			for (var j = 0, k = CC.ref.length; j < k; j++) {
				var ref = CC.ref[j];
				console.log('ID_reference : ' + ref);
			}
			console.log('------------------------------');
		}
	});
}


//Fonction pour afficher une condition unitaire
var showCU = function() {
	var query = CUModel.find();
	query.exec(function(err, CUs) {
		if (err) {
			throw err;
		}
		//Parcours des resultats et affichage
		var CU;
		for (var i = 0, l = CUs.length; i < l; i++) {
			CU = CUs[i];
			console.log('------------------------------');
			console.log('ID : ' + CU._id);
			console.log('CC_ID : ' + CU.CC_id);
			console.log('Nom : ' + CU.name);
			console.log('Description : ' + CU.description);
			console.log('Valeur : ' + CU.val);
			console.log('Reference CU : ' + CU.ref);
			console.log('------------------------------');
		}
	})
}



//Fonction pour chercher un releve
var searchStatementId = function(label, node) {
	var regVar = label + '_' + node
	var query = statementModel.find({
		sensor_id: {
			$regex: regVar,
			$options: 'xi'
		}
	});
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



//Fonction pour chercher une alerte
var isThereAnAlert = function(sensorID) {



	var regVar = statement.sensor_id
	var query = CUModel.find({ //vérifier les duplicata des CC
		ref: {
			$regex: regVar,
			$options: 'xi'
		}
	});

	query.exec(function(err, CUs) {
		if (err) {
			throw err;
		}
		// On va parcourir le résultat et les afficher joliment
		var CU;
		for (var i = 0, l = CUs.length; i < l; i++) {
			CU = CUs[i];
			console.log('------------------------------');
			console.log('ID : ' + CU._id);
			console.log('Ref : ' + CU.ref);
			console.log('Op : ' + CU.op);
			console.log('value : ' + relev.val);
			console.log('------------------------------');

			//Là je fait appel à la fonction en envoyant le CC déclencheur
			var searchVar = CU.CC_id
			var query2 = CCModel.findOne({
				_id: {
					$regex: searchVar,
					$options: 'xi'
				}
			});



			query2.exec(function(err, CC) {
				if (err) {
					throw err;
				}
				console.log('------------------------------');
				isThisAnAlert(CC);



			});
		}
	});
}



//Fonction pour chercher un releve
var isThisAnAlert = function(CUid, callback) {



	///////////////////////////////////////////////////////////////////////////////////////////////
	var nb = 0;
	CUModel.findOne({
			_id: CUid
		}

		,
		function(err, CU) {
			console.log('------------------------------');
			console.log('ID : ' + CU._id);
			console.log('CC_ID : ' + CU.CC_id);
			console.log('Op : ' + CU.op);
			console.log('Description : ' + CU.description);
			console.log('Valeur : ' + CU.val);
			console.log('Reference CU : ' + CU.ref);
			console.log('------------------------------');



			statementModel.findOne({
				sensor_id: CU.ref
			}, {}, {
				sort: {
					'date': -1
				}
			}, function(err, State) {
				console.log('------------------------------')
				console.log('ID : ' + State.sensor_id);
				console.log('value : ' + State.value);
				console.log('Nom : ' + State.date);
				console.log('------------------------------');
				if (eval(State.value + CU.op + CU.val)) {

					console.log('Alerte : ' + State.value + CU.op + CU.val);
					nb = 1;

				} else {
					nb = 0;


				}
				return callback(null, nb);
			})


			//ici déclancher l'ajout du trigger
		});

}



//Fonction pour chercher un releve
var searchCCid = function(varID) {
	CCModel.findOne({
			_id: varID

		},
		function(err, CC) {
			if (CC !== null) {
				console.log('------------------------------');
				console.log('ID : ' + CC._id);
				console.log('Nom : ' + CC.name);
				console.log('Description : ' + CC.description);
				//On parcourt le tableau des relevé



				var test = 0;
				for (var j = 0, k = CC.ref.length; j < k; j++) {
					var ref = CC.ref[j];
					console.log('ID_reference : ' + ref);



					isThisAnAlert(ref, function(err, nb) {
						console.log('test : ' + test);
						console.log('k : ' + k);
						test += nb;
						if (test == k) {

							console.log('hey ya une alerte');
						}
					});



				}



			}
		}
	);

}

//Fonction pour chercher un releve
var searchStatementid = function(varID) {
	/*var query = statementModel.find({
		sensor_id: varID

	});

	query.exec(function(err, States) {
		if (err) {
			throw err;
		}

		var State;
		for (var i = 0, l = States.length; i < l; i++) {
			State = States[i];
			console.log('------------------------------');
			console.log('ID : ' + State.sensor_id);
			console.log('Nom : ' + State.value);
			console.log('i : ' + i);
			console.log('------------------------------');



		}
	});
*/



	statementModel.findOne({
		sensor_id: varID
	}, {}, {
		sort: {
			'date': -1
		}
	}, function(err, State) {

		console.log('------------------------------')
		console.log('ID : ' + State.sensor_id);
		console.log('value : ' + State.value);
		console.log('Nom : ' + State.date);
		console.log('------------------------------');
		return State;
	})



}



/*Exportation des fonctions*/
exports.removeSensor = removeSensor;
exports.addSensor = addSensor;
exports.addStatement = addStatement;
exports.addRoom = addRoom;
exports.addCU = addCU;
exports.addCC = addCC;
exports.showStatement = showStatement;
exports.showSensor = showSensor;
exports.showCC = showCC;
exports.showCU = showCU;
exports.removeStatement = removeStatement;
exports.removeRoom = removeRoom;
exports.removeCU = removeCU;
exports.removeCC = removeCC;

exports.disconnect = disconnect;
exports.connect = connect;
exports.searchCCid = searchCCid;
exports.searchStatementid = searchStatementid;
//exports.searchStatementId = searchStatementId;
//exports.isThereAnAlert = isThereAnAlert;
exports.isThisAnAlert = isThisAnAlert;