// Inclusion de Mongoose
var mongoose = require('mongoose');
var async = require('async');


var connect = function() {
	// On se connecte à la base de données
	// N'oubliez pas de lancer ~/mongodb/bin/mongod dans un terminal !
	mongoose.connect('mongodb://localhost/Capteurs', function(err) {
		if (err) {
			throw err;
		}
	});
}


//Definition des 2 schemas capteurs et releve
var roomSchema = new mongoose.Schema({
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	sensor: [],
	date: {
		type: Date,
		default: Date.now
	}
});


//Architecture du réel capteur
var mainSensorSchema =  new mongoose.Schema({
	_id: String, //productname_nbre(productname)
	name: String, //ex: FGMS-001
	battery: String,
	nodeid: String, //variable selon le réseau zwave
	location: String,
	sensors: []
});

//Architecture d'un capteur
var sensorSchema = new mongoose.Schema({
	_id: String,
	CC_id: String,
	description: String,
	type: String, //label: Temperature, Luminance...
	units: String, //C, lux(%)...
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
	op:  String,
	value: String,
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


//schema pour les notifications
var alertSchema = new mongoose.Schema({
	_id: String,
	name: {
		type: String,
		match: /^[a-zA-Z0-9-_]+$/
	},
	description: String,
	location: String,
	values: [], // opérande + valeur (> 25)
	types: [], //Temperature, Luminance ...
	date: {
		type: Date,
		default: Date.now
	}
});

//schema des conditions de déclenchement
var triggerSchema = new mongoose.Schema({
	_id: String,
	CC_id: String,
	triggered: String, //true ou false
	isReady: String //isReady every 15 min
});

var notifCounterSchema = new mongoose.Schema({
	_id: String,
	counter: String
});

// Création du Model pour les commentaires
var mainSensorModel = mongoose.model('MCapteur', mainSensorSchema);
var sensorModel = mongoose.model('Capteurs', sensorSchema);
var statementModel = mongoose.model('Releves', statementSchema);

var roomModel = mongoose.model('Room', roomSchema);
var CUModel = mongoose.model('CU', CUSchema);
var CCModel = mongoose.model('CC', CCSchema);
var alertModel = mongoose.model('Alert', alertSchema);
var triggerModel = mongoose.model('Trigger', triggerSchema);
var notifCounterModel = mongoose.model('NotifCounter', notifCounterSchema);

//Fonction pour se deconnecter de la BDD
var disconnect = function() {
	mongoose.connection.close();
}


//Fonction pour ajouter une nouvelle piece
var addRoom = function(nameRoom, descriptionRoom) {
	// On crée une instance du Model
	var myRoom = new roomModel({});
	myRoom.name = nameRoom;
	myRoom.description = descriptionRoom;

	// On le sauvegarde dans MongoDB !
	myRoom.save(function(err) {
		if (err) {
			throw err;
		}

		console.log('Room ajouté avec succès !');
	});


}


var containsId = function(objId, arr){
	for(var i = 0; i<arr.length; ++i){
		if(objId == arr[i]._id) return true;
	}
	return false;
}

//Fonction pour ajouter la condition composée avec ses nouvelles conditions unitaires
var addCUs = function(descriptionCU, refCU, opCU, valCU) {
	// On crée une instance du Model
	var incr = 0;
	if(!refCU) return;
	if(refCU.length != opCU.length || refCU.length != valCU.length)
		return;

	CCModel.find({

	}).exec(function(err,myCCs){
		if(err) throw err;

		var tmp = 0;
		while(containsId('CC_' + tmp, myCCs)) tmp++; 
		var myCC = new CCModel({
			_id: 'CC_' + tmp
		});
		myCC.name = "";
		myCC.description = "";

		CUModel.find({
		}).exec(function(err,myCUs){
			if(err) throw err;
			for(var i = 0; i<refCU.length; ++i){				
				var tmp = incr; 
				while(containsId('CU_' + tmp, myCUs)) tmp++; 
				var myCU = new CUModel({
					_id: 'CU_' + tmp
				});

				myCU.CC_id = myCC._id;
				myCU.description = descriptionCU;
				myCU.ref = refCU[i];
				myCU.op = opCU[i];
				myCU.value = valCU[i];

				myCC.ref.push(myCU._id);
				if(i == refCU.length -1){
					myCC.save(function(err) {
						if (err) {
							throw err;
						}
					});
				}

				incr = tmp+1;
				// On le sauvegarde dans MongoDB !
				myCU.save(function(err) {
					if (err) {
						throw err;
					}

					console.log('condition unitaire ajoutée avec succès !');
				});
			}
		});
	});
}

//Fonction pour ajouter la condition composée avec sa nouvelle condition unitaire
var addCU = function(descriptionCU, refCU, opCU, valCU){
	if(valCU && refCU && opCU){
		CCModel.find({

		}).exec(function(err,myCCs){
			if(err) throw err;
			var tmp = 0;
			while(containsId('CC_' + tmp, myCCs)) tmp++; 
			var myCC = new CCModel({
				_id: 'CC_' + tmp
			});
			myCC.name = "";
			myCC.description = "";


			CUModel.find({

			}).exec(function(err,myCUs){
				if(err) throw err;
				var tmp = 0; 
				while(containsId('CU_' + tmp, myCUs)) tmp++; 
				var myCU = new CUModel({
					_id: 'CU_' + tmp
				});

				myCU.CC_id = myCC._id;
				myCU.description = descriptionCU;
				myCU.ref = refCU;
				myCU.op = opCU;
				myCU.value = valCU;

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
		});
	}
}


/*var addCC = function(nameCC, descriptionCC) {
	// On crée une instance du Model
	CCModel.find({

	}).exec(function(err,myCCs){
		if(err) throw err;
		var tmp = 0;
		while(containsId('CC_' + tmp, myCCs)) tmp++; 
		var myCC = new CCModel({
			_id: 'CC_' + tmp
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
	});
}*/

var modifyNameCC = function(nameCC, idCC){
	CCModel.findOne({
		_id: idCC
	}).exec(function(err,myCC){
		if(err) throw err;
		if(!myCC) return;
		myCC.name = nameCC;
		myCC.save(function(err){
			if(err) throw err;

		});
	});
}


//Fonction pour ajouter une nouvelle notification
var addAlert = function(ccid, description, location, values, types, callback) {
	// On crée une instance du Model
	alertModel.find({

	}).exec(function(err, myNotifs){
		if(err) throw err;
		var tmp = myNotifs.length;
		while(containsId('Notif_' + tmp, myNotifs)) tmp++;
		var myNotif = new alertModel({
			_id: 'Notif_' + tmp
		});
		myNotif.CC_id = ccid;
		myNotif.description = description;
		myNotif.location = location;
		myNotif.values = values;
		myNotif.types = types;

		myNotif.save(function(err){
			if(err) throw err;
			callback();
		});
	});
	
}

//Fonction pour ajouter un compteur
var addCounter = function() {
	var counter = new notifCounterModel({
		_id: 'counter'
	});
	counter.counter=0;
	counter.save(function(err) {
		if(err) throw err;
	});
}

//Fonction pour ajouter une nouvelle condition Composée
/*var addCC = function(nameCC, descriptionCC) {
	// On crée une instance du Model
	CCModel.find({

	}).exec(function(err,myCCs){
		if(err) throw err;
		var tmp = myCCs ? myCCs.length : 0;
		var myCC = new CCModel({
			_id: 'CC_' + tmp
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
	});
}
*/
/*************************************Main Sensor****************************************/
//fonction d'ajout d'un multi capteur
//renvoie _id du mainSensor
var addMainSensor = function(productName, batteryLvl, snsrs, _nodeid, callback){
	var myMainSensor = new mainSensorModel({});
	var nameSnsr = productName.replace(' ','_').replace(' ','_'); 
	mainSensorModel.findOne({
		nodeid: _nodeid
	}).exec(function(err, myMS){
		if(err) throw err;
		if(myMS){
			console.log('Capteur déjà enregistré');
		}
		else{
			myMainSensor._id = nameSnsr + '_' + _nodeid;
			myMainSensor.name = productName + ' ' + _nodeid;
			myMainSensor.battery = batteryLvl;
			myMainSensor.sensors = snsrs;
			myMainSensor.nodeid = _nodeid;
			myMainSensor.location = '';
			myMainSensor.save(function(err){
				if(err) throw err;
				console.log('Capteur principal ajouté avec succès');
				callback(myMainSensor._id);
			});
		}
	});
		
}

//fonction de mise à jour du capteur dans le réseau zwave avec son nouveau nodeid
//ajoute le capteur s'il n'est pas dans la base de données
/*var updateMainSensor = function(nameid, newNodeId, productname, batteryLvl, snsrs, callback){
	mainSensorModel.findOne({
		_id: nameid.replace(' ','_').replace(' ','_')
	}).exec(function(err, myMainSensor){
		if(err) throw err;
		if(myMainSensor){
			if(myMainSensor.nodeid != newNodeId){
				myMainSensor.nodeid = newNodeId;
				myMainSensor.save(function(err){
					if(err) throw err;
					console.log('Capteur mis à jour avec succès !');
				});
			}
		}
		else{
			addMainSensor(productname, batteryLvl, snsrs, newNodeId, callback);
		}
	});
}*/

//fonction prenant  en argument le nom d'un capteur
//renvoie id associé
var idMainSensor = function(_nodeid, productName, callback){
	mainSensorModel.findOne({
		nodeid: _nodeid
	}).exec(function(err, myMainSensor){
		if(err) throw err;
		if(myMainSensor)
			callback(myMainSensor._id);
		else{
			var tmpProduct = productName.replace(' ','_').replace(' ','_');
			mainSensorModel.find({
				name: tmpProduct
			}).exec(function(err, mainSnsrs){
				if(err) throw err;
				callback(tmpProduct + '_' + _nodeid);
			});
		}
	});
}

var updateBattery = function(_nodeid, newBatteryLvl){
	mainSensorModel.findOne({
		nodeid: _nodeId
	}).exec(function(err, myMainSensor){
		if(err) throw err;
		if(myMainSensor){
			myMainSensor.battery = newBatteryLvl;
			myMainSensor.save(function(err){
				if(err) throw err;
				console.log('Battery level mis à jour');
			});
		}
		else
			console.log('Error update battery: sensor not found');
	})
}
/****************************************************************************/

/****************************************************************************/
//Fonction pour ajouter un nouveau capteur
var addSensor = function(label, nameSensor, descriptionSensor, locationSensor, newId, unit) {
	// On crée une instance du Model
	var mySensor = new sensorModel({
		_id: newId
	});
	mySensor.name = nameSensor;
	mySensor.description = descriptionSensor;
	mySensor.type = label.replace('_', ' ');
	mySensor.location = locationSensor;
	mySensor.units = unit;

	// On le sauvegarde dans MongoDB !
	mySensor.save(function(err) {
		if (err) {
			throw err;
		}
		console.log('Capteur ajouté avec succès !');
	});
}

//fonction verifiant l'existence du capteur
var existSensor = function(idSnsr, callback){
	sensorModel.findOne({
		_id: idSnsr
	}).exec(function(err, mySensor){
		if(err) throw err;
		callback(mySensor);
	});
}

/****************************************************************************/

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
		if(!mySensor){
			console.log('Error add Stattement: sensor not found');
			return ;
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
			console.log('Relevé ajouté avec succès !');
		});
	});
}



//Fonction pour supprimer les main capteurs
var removeMainSensor = function() {
	mainSensorModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Main capteurs supprimés !');
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
var removeAlert = function() {
	alertModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Notifications supprimées !');
	});
}

//Fonction pour supprimer un CC
var removeCC = function() {
	CCModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('CC supprimées !');
	});
}

//Fonction pour supprimer un CU
var deleteCC = function(idCC) {
	CCModel.findOne({
		_id: idCC
	}).exec(function(err, myCC){
		if(err) throw err;
		if(!myCC) return;
		for(var i=0; i<myCC.ref.length; ++i){
			CUModel.remove({
				_id: myCC.ref[i]
			}, function(err) {
				if (err) {
					throw err;
				}
				console.log('CU supprimée !');
			});
		}
	}).then(function(){
		CCModel.remove({
			_id: idCC
		}, function(err) {
			if (err) 
				throw err;
			console.log('CC supprimée !');
		});
	});
}

//Fonction pour supprimer les CUs
var removeCU = function() {
	CUModel.remove({}, function(err) {
		if (err) {
			throw err;
		}
		console.log('CU supprimées !');
	});
}

//Fonction pour supprimer un CU
var deleteCU = function(idCU) {
	CUModel.findOne({
		_id: idCU
	}).exec(function(err, myCU){
		if(err) throw err;
		if(!myCU) return;
		CCModel.findOne({
			_id: myCU.CC_id
		}).exec(function(err, myCC){
			if(err) throw err;
			if(!myCC) return;

			var index = myCC.ref.indexOf(idCU);
			if(index>=0)
				myCC.ref.splice(index,1);
			else
				console.log('CC: ref not found')
			if(myCC.ref.length >0){
				myCC.save(function(err){
					if(err) throw err;
				});
			}
			else{
				CCModel.remove({_id: myCC._id}, function(err){
					if(err) throw err;
				});
			}
			

			CUModel.remove({
				_id: idCU
			}, function(err) {
				if (err) {
					throw err;
				}
				console.log('CU supprimé !');
			});
		});
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

//Fonction pour supprimer une room avec id
var deleteRoom = function(idRoom) {
	roomModel.remove({
		_id: idRoom
	}, function(err) {
		if (err) {
			throw err;
		}
		console.log('Room supprimés !');
	});
}


/**********************************************************/
//fonction pour afficher un main sensor
var showMainSensor = function() {
	var query = mainSensorModel.find();
	query.exec(function(err, capts) {
		if (err) {
			throw err;
		}
		// On va parcourir le résultat et les afficher joliment
		var capt;
		for (var i = 0, l = capts.length; i < l; i++) {
			capt = capts[i];
			console.log('--------------Main----------------');
			console.log('ID : ' + capt._id);
			console.log('Nom : ' + capt.name);
			console.log('Node Id : ' + capt.nodeid);
			console.log('Localisation : ' + capt.location);
			console.log('Battery : ' + capt.battery);
			//On parcourt le tableau des états
			for (var j = 0; j < capt.sensors.length; j++) {
				var sensor = capt.sensors[j];
				console.log('IDSensor : ' + sensor);
			}

			console.log('----------------------------------');
		}

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
			console.log('Units : ' + capt.units);
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
	});
}


//Fonction pour afficher une room
var showRoom = function() {
	var query = roomModel.find();
	query.exec(function(err, rooms) {
		if (err) {
			throw err;
		}
		//Parcours des resultats et affichage
		var room;
		for (var i = 0, l = rooms.length; i < l; i++) {
			room = rooms[i];
			console.log('------------------------------');
			console.log('ID : ' + room._id);
			console.log('Nom : ' + room.name);
			console.log('Description : ' + room.description);
			console.log('Date : ' + room.date);
			console.log('List sensors : ' + room.sensor);
			console.log('------------------------------');
		}
	});
}

//Fonction pour chercher une alerte
var isThereAnAlert = function(sensorID) {

	var regVar = sensorID;
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
			searchCCid(CU.CC_id);
		}
	});
}



//Fonction pour vérifier si la condition unitaire a été vérifiée
var isThisAnAlert = function(CUid, callback) {

	var nb = 0;
	var val, type, location;
	CUModel.findOne({
			_id: CUid
		}

		,
		function(err, CU) {
			if(!CU) return;
			val = CU.op + ' ' + CU.value;

			sensorModel.findOne({
				name: CU.ref
			}).exec(function(err, mySensor){
				if(err) throw err;
				if(!mySensor) return;
				type = mySensor.type;
				location = mySensor.location;

				statementModel.findOne({
					sensor_id: mySensor._id
				}, {}, {
					sort: {
						'date': -1
					}
				}, function(err, State) {
					if(err) callback(err);
					if(!State) return;
					if (eval(State.value + (CU.op == '=' ? '==' : CU.op) + CU.value)) {

						console.log('Alerte : ' + State.value + CU.op + CU.value);
						nb = 1;

					}
					else {
						nb = 0;
					}

					return callback(null, nb, val, location, type);
				});
			});
		});

}


//Fonction pour chercher une condition composée
var searchCCid = function(varID, callback) {
	var values = [], types = [];
	CCModel.findOne({
			_id: varID

		},
		function(err, CC) {
			if (CC !== null) {
				
				//On parcourt le tableau des conditions composées
				var test = 0;
				for (var j = 0, k = CC.ref.length; j < k; j++) {
					var ref = CC.ref[j];

					isThisAnAlert(ref, function(err, nb, value, location, type) {
						if(err) callback(err);
						values.push(value);
						types.push(type);
						test += nb;
						if (test == k) {
							callback(null, location, values, types);
						}
					});
				}
			}
		}
	);
}


//fonction d'ajout des notifs en fonctions des conditions vérifiées
var addNotif = function(){
	var asyncTasks = [];
	var locations = [], values = [], types = [];
	var j = -1;


	CCModel.find ({

	}).exec(function(err, myCCs){
		if(err) throw err;
		async.each(myCCs, function(myCC, callback){

			searchCCid(myCC._id, function(err, location, vals, typs){
				if(err) throw err;
				locations.push(location);
				values.push(vals);
				types.push(typs);

				asyncTasks.push(function(cb){
					++j;
					addAlert(myCC._id, '', locations[j], values[j], types[j], cb);
				});
				callback();
			});

		},//Ajout du compteur de notif dans la fonction d'ajout des notifs
		function(err){
			if(err) throw err;
			async.series(asyncTasks, function(){
				notifCounterModel.findOne ({
					_id: 'counter'
				})
				.exec(function(err, mycounter){
					if(mycounter==null){
						var mycounter = new notifCounterModel({
							_id: 'counter'
						});
						mycounter.counter=j+1;
						mycounter.save(function(err) {
							if(err) throw err;
						});
					}
					else {
						mycounter.counter+=j+1;
						mycounter.save(function(err) {
							if(err) throw err;
						})
					} 	
					
				});
			});
		});
	});
}
/*
//Fonction pour chercher la liste des notifications
var listNotif = function(callback) {
	var results = {};
	alertModel.find({

	}).sort({date: -1}).exec(function(err, myNotifs) {
		async.forEachOf(myNotifs, function(myNotif, key, cb) {
			results[key] = myNotif;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}
*/

//liste counter
var listCounter = function(callback) {
	var mycounter={};

	notifCounterModel.findOne({
		_id: 'counter'

	})
	.exec(function (err, myonecounter) {
		if(err) {
			console.error(err.message)
			return callback(err);
		}
		mycounter=myonecounter;
		return callback(null, mycounter);
	});
}

//Remise a 0 du compteur
var resetCounter = function() {
	
	notifCounterModel.findOne({
		_id: 'counter'
	})
	.exec(function(err, mycounter){
		if(mycounter==null){
			var mycounter = new notifCounterModel({
				_id: 'counter'
			});
			mycounter.counter=0;
			mycounter.save(function(err) {
				if(err) throw err;
			});
		}
		else {
			mycounter.counter=0;
			mycounter.save(function(err) {
				if(err) throw err;
			});
		}
	});
}

//Affiche les relevés en fonction d'un capteur
var showStatementBySensor = function(varSensor, callback) {
	var query = statementModel.find({
		sensor_id: varSensor
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

			console.log(relev.date.getHours() + relev.date.getMin());

		}
		return callback(null, relevs);
	});
}

//Fonction pour chercher les capteurs
var searchSensors = function(callback) {

	var query = sensorModel.find({

	});
	query.exec(function(err, sensrs) {
		if (err) {
			throw err;
		}
		return callback(null, sensrs);
	});
}

//Fonction pour chercher un releve avec id
var searchStatementid = function(varID, callback) {
	statementModel.findOne({
		sensor_id: varID
	}, {}, {
		sort: {
			'date': -1
		}
	}, function(err, state) {
		callback(err, state);
	});
}

//Fonction pour chercher la liste des capteurs
var listSensor = function(callback) {
	var results = {};
	searchSensors(function(err, sensors) {
		async.forEachOf(sensors, function(sensor, key, cb) {
			searchStatementid(sensor._id, function(err, stat) {
				if (err) cb(err);
				if (stat) {
					sensor.description = stat.value;
					results[key] = sensor;
					results[key].date = stat.date;
				}
				else
					results[key] = sensor;
				cb();
			});
		}, function(err) {
			if (err) {
				console.error(err.message)
				callback(err);
			}
			callback(null, results);
		});
	});
}

/*********************************************************/
//Fonction pour chercher les capteurs
var searchMainSensors = function(callback) {
	var query = mainSensorModel.find({});
	query.exec(function(err, sensrs) {
		if (err) {
			throw err;
		}
		return callback(null, sensrs);
	});
}

//Fonction pour chercher la liste des capteurs
var listMainSensor = function(callback) {
	var results = {};
	searchMainSensors(function(err, mainSensors) {
		async.forEachOf(mainSensors, function(mainSensor, key, cb) {
			if(mainSensor.nodeid != 1){
				results[key] = mainSensor;
			}
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}

//Fonction pour chercher la liste des relevés
var listStatement = function(callback) {
	var results = {};
	statementModel.find({

	}).sort({date: 1}).exec(function(err, statements) {
		async.forEachOf(statements, function(statement, key, cb) {
			results[key] = statement;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}

//Fonction pour chercher la liste des relevés
var listStatementId = function(sensorid, callback) {
	var results = {};
	statementModel.find({
		sensor_id: sensorid
	}).sort({date: 1}).exec(function(err, statements) {
		async.forEachOf(statements, function(statement, key, cb) {
			results[key] = statement;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}


//Fonction pour chercher la liste des CU
var listCU = function(callback) {
	var results = {};
	CUModel.find({

	}).exec(function(err, myCUs) {
		async.forEachOf(myCUs, function(myCU, key, cb) {
			results[key] = myCU;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}

//Fonction pour chercher la liste des CC
var listCC = function(callback) {
	var results = {};
	CCModel.find({

	}).exec(function(err, myCCs) {
		async.forEachOf(myCCs, function(myCC, key, cb) {
			results[key] = myCC;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}

//Fonction pour chercher la liste des notifications
var listNotif = function(callback) {
	var results = {};
	alertModel.find({

	}).sort({date: -1}).exec(function(err, myNotifs) {
		async.forEachOf(myNotifs, function(myNotif, key, cb) {
			results[key] = myNotif;
			return cb();
		}, function(err) {
			if (err) {
				console.error(err.message)
				return callback(err);
			}
			return callback(null, results);
		});
	});
}
/*********************************************************/

//Fonction pour afficher la liste des capteurs
var affichelistSensor = function(roomVar) {

	listSensor(roomVar, function(err, relevs) {
		for (var i = 0, l = relevs.length; i < l; i++) {
			relev = relevs[i];
			console.log('------------------------------');
			console.log('lastStat : ' + relev.lastStat);
			console.log('------------------------------');
		};


	});


}

//Fonction pour chercher une salle
var searchRoom = function(callback) {
	var query = roomModel.find({});
	query.exec(function(err, rooms) {
		if (err) {
			throw err;
		}
		return callback(null, rooms);
	});
}


//Fonction pour ajouter une association d'un sous-capteur
var associationAux = function(idRoom, idSensor) {
	// On crée une instance du Model
	var querySensor = sensorModel.findOne({
		_id: idSensor
	});
	querySensor.exec(function(err, mySensor) {
		if (err) {
			throw err;
		}
		if(!mySensor) return;

		var query = roomModel.findOne({
			_id: idRoom
		});
		query.exec(function(err, myRoom) {
			if (err) {
				throw err;
			}
			if(!myRoom) return;
			myRoom.sensor.push(mySensor._id);
			myRoom.save(function(err) {
				if (err) {
					throw err;
				}

			});
			mySensor.location = myRoom.name;

			// On le sauvegarde dans MongoDB !
			mySensor.save(function(err) {
				if (err) {
					throw err;
				}
				console.log('association réalisée avec succès !');
			});
		});
	});
}

//Fonction permettant d'ajouter un main capteur
var association = function(idRoom, idMainSensor){
	mainSensorModel.findOne({
		_id: idMainSensor
	}).exec(function(err, myMainSensor){
		if(err) throw err;
		if(!myMainSensor) return;
		for(var i = 0; i<myMainSensor.sensors.length; ++i){
			associationAux(idRoom, myMainSensor.sensors[i])
		}
		roomModel.findOne({
			_id: idRoom
		}).exec(function(err,myRoom){
			if(err) throw err;
			if(!myRoom) return;
			myMainSensor.location = myRoom.name;
			myMainSensor.save(function(err){
				if(err) throw err;
			});
		});
	});

}

var removeAssociationAux = function(idSensor){
	var querySensor = sensorModel.findOne({
		_id: idSensor
	});
	querySensor.exec(function(err, mySensor) {
		if (err) {
			throw err;
		}
		if(!mySensor) return;
		mySensor.location = "";

		// On le sauvegarde dans MongoDB !
		mySensor.save(function(err) {
			if (err) {
				throw err;
			}
			console.log('suppression de l\'association réalisée avec succès !');
		});
	});
}

//Fonction permettant d'ajouter un main capteur
var removeAssociation = function(idRoom, idMainSensor){
	var asyncTasks = [];
	mainSensorModel.findOne({
		_id: idMainSensor
	}).exec(function(err, myMainSensor){
		if(err) throw err;
		if(!myMainSensor) return;
		roomModel.findOne({
			_id: idRoom
		}).exec(function(err, myRoom){
			if(err) throw err;
			if(!myRoom) return;
			for(var i = 0; i<myMainSensor.sensors.length; ++i){
				var index = myRoom.sensor.indexOf(myMainSensor.sensors[i]);
				if(index>=0)
					myRoom.sensor.splice(index,1);
				else
					console.log("Association introuvable");
				removeAssociationAux(myMainSensor.sensors[i]);
			}
			myRoom.save(function(err) {
				if (err) throw err;
				myMainSensor.location = "";
				myMainSensor.save(function(err){
					if(err) throw err;
				});
			});
		});
	});
}
/*Exportation des fonctions*/
//exports.updateMainSensor = updateMainSensor;

exports.idMainSensor = idMainSensor;

exports.existSensor = existSensor;

exports.addMainSensor = addMainSensor;
exports.addSensor = addSensor;
exports.addStatement = addStatement;
exports.addRoom = addRoom;
exports.addCU = addCU;
exports.addCUs = addCUs;
//exports.addCC = addCC;

exports.modifyNameCC = modifyNameCC;

exports.showMainSensor = showMainSensor;
exports.showStatement = showStatement;
exports.showSensor = showSensor;
exports.showCC = showCC;
exports.showCU = showCU;
exports.showRoom = showRoom;

exports.removeMainSensor = removeMainSensor;
exports.removeStatement = removeStatement;
exports.removeRoom = removeRoom;
exports.removeAlert = removeAlert
exports.removeCU = removeCU;
exports.removeCC = removeCC;
exports.removeSensor = removeSensor;
exports.removeAssociation = removeAssociation;

exports.deleteRoom = deleteRoom;
exports.deleteCU = deleteCU;
exports.deleteCC = deleteCC;

exports.disconnect = disconnect;
exports.connect = connect;

exports.searchStatementid = searchStatementid;

exports.addNotif = addNotif;

exports.affichelistSensor = affichelistSensor;
exports.listMainSensor = listMainSensor;
exports.listSensor = listSensor;
exports.listStatement = listStatement;
exports.listStatementId = listStatementId;
exports.listCU = listCU;
exports.listCC = listCC;
exports.listNotif = listNotif;
exports.searchRoom = searchRoom;

exports.association = association;
exports.showStatementBySensor = showStatementBySensor;

exports.resetCounter = resetCounter;
exports.listCounter = listCounter;
exports.addCounter = addCounter;