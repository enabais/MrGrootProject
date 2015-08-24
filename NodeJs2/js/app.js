var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.jq', 'ui.load', 'tc.chartjs', 'nvd3ChartDirectives', 'ngSanitize', 'ngCsv']);
app.constant('JQ_CONFIG', {
	plot: ['vendors/jquery/charts/flot/jquery.flot.js',
		'vendors/jquery/charts/flot/jquery.flot.tooltip.min.js',
		'vendors/jquery/charts/flot/jquery.flot.spline.js'
	]
});

app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.when('#/accueil', {
			templateUrl: 'templates/pages/accueil/index.html',
		})
			.when('/releves', {
				templateUrl: 'templates/pages/releves/index.html',
			})
			.when('/alertes', {
				templateUrl: 'templates/pages/alertes/index.html',
			})
			.when('/parametre', {
				templateUrl: 'templates/pages/parametre/index.html',
			})
			.when('/capteurs', {
				templateUrl: 'templates/pages/capteurs/index.html',
			})
			.when('/', {
				templateUrl: 'templates/pages/accueil/index.html',
			})
			.otherwise({
				redirectTo: '/'
			});
	}
]);
app.directive('bootstrapSwitch', [

	function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, ngModel) {
				element.bootstrapSwitch();

				element.on('switchChange.bootstrapSwitch', function(event, state) {
					if (ngModel) {
						scope.$apply(function() {
							ngModel.$setViewValue(state);
						});
					}
				});

				scope.$watch(attrs.ngModel, function(newValue, oldValue) {
					if (newValue) {
						element.bootstrapSwitch('state', true, true);
					} else {
						element.bootstrapSwitch('state', false, true);
					}
				});
			}
		};
	}
]);

app.directive('uiToggleClass', ['$timeout', '$document',
	function($timeout, $document) {
		return {
			restrict: 'AC',
			link: function(scope, el, attr) {
				el.on('click', function(e) {
					e.preventDefault();
					var classes = attr.uiToggleClass.split(','),
						targets = (attr.target && attr.target.split(',')) || Array(el),
						key = 0;
					angular.forEach(classes, function(_class) {
						var target = targets[(targets.length && key)];
						(_class.indexOf('*') !== -1) && magic(_class, target);
						$(target).toggleClass(_class);
						key++;
					});
					$(el).toggleClass('active');

					function magic(_class, target) {
						var patt = new RegExp('\\s' +
							_class.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') +
							'\\s', 'g');
						var cn = ' ' + $(target)[0].className + ' ';
						while (patt.test(cn)) {
							cn = cn.replace(patt, ' ');
						}
						$(target)[0].className = $.trim(cn);
					}
				});
			}
		};
	}
]);
/*
app.directive('scrollable', [function () {
	return {
		restrict: 'A',
		link: function (scope, elem) {
			elem.mCustomScrollbar({
				autoHideScrollbar: false,
				theme:'dark',
				advanced:{
					updateOneContentResize: true
				}
			});
		}
	};
}]);
*/

app.factory("Room", function RoomFactory($http) {
	return {
		all: function() {
			return $http.get('/room')
		},
		create: function() {
			return $http.post('/room', value)
		}
	}

});

app.factory("Sensor", function SensorFactory($http) {
	return {
		all: function() {
			return $http.get('/sensor')
		},
		create: function(value) {
			return $http.post('sensor.json', value)
		}
	}

});

app.factory("MainSensor", function MainSensorFactory($http) {
	return {
		all: function() {
			return $http.get('/mainSensor')
		},
		create: function(value) {
			return $http.post('mainSensor.json', value)
		}
	}
});

app.factory("CU", function CUFactory($http) {
	return {
		all: function() {
			return $http.get('/listcu')
		},
		create: function(value) {
			return $http.post('listcu.json', value)
		}
	}
});

app.factory("CC", function CCFactory($http) {
	return {
		all: function() {
			return $http.get('/listcc')
		},
		create: function(value) {
			return $http.post('listcc.json', value)
		}
	}
});

/*app.factory("Statement", function StatementFactory($http) {
	var factory = {
		all: function() {
			return $http.get('statement.json')
		},
		get: function(id) {
			var stat = {};
			var all = factory.all();
			angular.forEach(all, function(value, key) {
				if (value.id == id) {
					stat = value;
				}
			});
			return stat;
		},
		create: function(value) {
			return $http.post('statement.json', value)
		}
	}

	return factory;

});*/


app.controller('StoreController', ['$http', '$window', 'Room', 'Sensor', 'MainSensor',
	function($http, $window, Room, Sensor, MainSensor) {
		var store = this;
		store.rooms = [];
		store.sensors = [];
		store.mainSensors = [];

		Room.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					store.rooms.push(value);
				});
			});

		Sensor.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					store.sensors.push(value);
				});
			});

		MainSensor.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					store.mainSensors.push(value);
				});
			});

		this.addRoom = function() {
			var value = {};
			value = {
				name: this.name,
				description: this.description
			};
			$http.post('/room', value);
			$window.location.reload();
		};

		this.deleteRoom = function(idRoom) {
			var value = {};
			value = {
				id: idRoom
			};
			$http.post('/deleteRoom', value);
			$window.location.reload();
		};

		this.removeAssociation = function(_idRoom, _idSensor) {
			var value = {};
			value = {
				idRoom: _idRoom,
				idSensor: _idSensor
			};
			$http.post('/removeAssociation', value);
			$window.location.reload();
		};

		this.contains = function(mainSensor, sensor) {
			for (var index in store.mainSensors) {
				if (mainSensor._id == store.mainSensors[index]._id) {
					for (var j = 0; j < store.mainSensors[index].sensors.length; ++j) {
						if (sensor._id == store.mainSensors[index].sensors[j]) return true;
					}
					return false;
				}
			}
			return false;
		};
	}
]);


app.controller('NotifController', ['$http', '$scope', '$window', 'Sensor',
	function($http, $scope, $window, Sensor) {

		$scope.allNotif = [];
		$scope.allSensor = [];
		$scope.counter = [];
		$scope.data = [];


		$http.get('/notif').success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allNotif.push(value);
				});
			});

		$http.get('/nbenotif')
			.success(function(compteur) {
				$scope.counter=compteur;
				console.log(compteur);
			})

		/*Sensor.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allSensor.push(value);
				});
			});*/

		$scope.closeAlert = function(index) {
			var value = {
				id: $scope.allNotif.splice(index, 1)[0]._id
			};
			$http.post('/deleteAlert', value);				
		};

		$scope.removeAlert = function() {
			$http.post('/removeAlert');
			$scope.allNotif.length = 0;
		};
	}
]);

/*
app.controller('AlertDemoCtrl', function ($scope) {
  $scope.alerts = [
    { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
    { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
  ];

  $scope.addAlert = function() {
    $scope.alerts.push({msg: 'Another alert!'});
  };
});*/

app.controller('AlertController', ['$http', '$scope', '$window', 'CU', 'CC', 'Sensor', '$route',
	function($http, $scope, $window, CU, CC, Sensor, $route) {


		$scope.allCU = [];
		$scope.allCC = [];
		$scope.count = 0;
		$scope.comparator = ['=', '>', '<'];
		$scope.countBool = 0;
		$scope.bool = ['true', 'false'];
		$scope.allSensor = [];

		$scope.namecapteur = "";
		$scope.roomcapteur = "";
		$scope.operateur = '=';

		$scope.choixtype = [];
		$scope.choixname = [];
		$scope.choixop = [];
		$scope.choixvalue = [];
		$scope.choixroom = [];
		
		CU.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allCU.push(value);
				});
			});
		CC.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allCC.push(value);
				});
			});
		Sensor.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allSensor.push(value);
				});
			});

		$scope.isSelected = function(sensor) {
			return (sensor.location == $scope.choixroom);
		};

		$scope.increase = function() {
			var tmp = $scope.count;
			$scope.count = (((tmp + 1) % 3) + 3) % 3;
			$scope.operateur = $scope.comparator[$scope.count];
		};

		$scope.descrease = function() {
			var tmp = $scope.count;
			$scope.count = (((tmp - 1) % 3) + 3) % 3;
			$scope.operateur = $scope.comparator[$scope.count];
		};
		$scope.increaseBool = function() {
			var tmp = $scope.countBool;
			$scope.countBool = (((tmp + 1) % 2) + 2) % 2;
			$scope.valeur = $scope.bool[$scope.countBool];
		};
		$scope.decreaseBool = function() {
			var tmp = $scope.countBool;
			$scope.countBool = (((tmp - 1) % 2) + 2) % 2;
			$scope.valeur = $scope.bool[$scope.countBool];
		};

		$scope.addCU = function() {
			var value = {};
			if ($scope.isMotion($scope.choixsensor)) {
				$scope.choixop = '=';
			}
			value = {
				description: $scope.description,
				ref: $scope.choixsensor,
				op: $scope.choixop,
				val: $scope.choixvalue
			};
			$http.post('/cu', value);
			$window.location.reload();
			//$route.reload();
		};

		$scope.ajoutCU = function() {
			var value = {};
		
			if ($scope.isMotion($scope.choixsensor1)) {
				$scope.choixop = '=';
			}
			if ($scope.typecapteur && $scope.valeur != "" && $scope.operateur) {
				$scope.choixtype.push($scope.typecapteur);
				$scope.choixvalue.push($scope.valeur);
				$scope.choixop.push($scope.operateur);
				$scope.choixroom.push($scope.roomcapteur);
				$scope.choixname.push($scope.namecapteur);
			}
		};


		$scope.isNumeric = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};

		$scope.updatetype = function(sensor) {
			$scope.typecapteur = sensor.type;
			$scope.roomcapteur = sensor.location;
			$scope.namecapteur = sensor.name;
			if($scope.isMotion(sensor.name)) $scope.valeur = 'true';
			else if(!$scope.isNumeric($scope.valeur)) $scope.valeur = '';
		};

		$scope.addCUs = function() {
			value = {
				description: $scope.description,
				ref: $scope.choixname,
				op: $scope.choixop,
				val: $scope.choixvalue
			};
			$http.post('/cus', value);
			$window.location.reload();
		};

		$scope.deleteCU = function(idCU) {
			var value = {};
			value = {
				id: idCU
			};
			$http.post('/deleteCU', value);
			$window.location.reload();
		};

		$scope.modifyNameCC = function(ccid, name) {
			var value = {};
			value = {
				name: name,
				id: ccid
			};
			$http.post('/modifycc', value);
			$window.location.reload();
		};

		$scope.deleteCC = function(idCC) {
			var value = {};
			value = {
				id: idCC
			};

			$http.post('/deleteCC', value);
			$window.location.reload();
		};

		$scope.isMotion = function(choixsensor) {
			for (var i = 0; i < $scope.allSensor.length; ++i) {
				if ($scope.allSensor[i].name == choixsensor) {
					return $scope.allSensor[i].type == 'Motion Sensor';
				}
			}
			return false;
		};

		$scope.sensorLocation = function(sensorName) {
			for (var i = 0; i < $scope.allSensor.length; ++i) {
				if ($scope.allSensor[i].name == sensorName) {
					return $scope.allSensor[i].location;
				}
			}
			return "";
		};

		$scope.sensorUnits = function(choixsensor) {
			for (var i = 0; i < $scope.allSensor.length; ++i) {
				if ($scope.allSensor[i].name == choixsensor) {
					return $scope.allSensor[i].units;
				}
			}
			return "";
		};

		$scope.sensorType = function(sensorName) {
			for (var i = 0; i < $scope.allSensor.length; ++i) {
				if ($scope.allSensor[i].name == sensorName) {
					return $scope.allSensor[i].type;
				}
			}
			return "";
		};

		$scope.switchoption = function() {
			var value = {
				option:$scope.state?"regularAlert":"beginEndAlert"
			};
			$http.post('/switchoption', value);
		};
	}

]);

app.controller('ExportController', function ($scope) {
    $scope.filename = "releves";
    $scope.getArray = [{a: 1, b:2}, {a:3, b:4}];

    $scope.getHeader = function () {
		return ["Valeur", "Date"]
	};
/*
	$scope.addRandomRow = function() {
		$scope.getArray.push({
			a: Math.floor((Math.random()*10)+1), 
			b: Math.floor((Math.random()*10)+1)
		});
	};
*/
/*
	$scope.clickFn = function() {
		console.log("click click click");
	};
*/
});


app.controller('NavController', function() {
	this.onglet = 1;

	this.setTab = function(newValue) {
		this.onglet = newValue;
	};

	this.isSet = function(ongletName) {
		return this.onglet === ongletName;
	};
});

app.controller('AccordionDemoCtrl', function() {
	this.oneAtATime = true;

	this.addItem = function() {
		var newItemNo = this.items.length + 1;
		this.items.push('Item ' + newItemNo);
	};

	this.status = {
		isFirstOpen: true,
		isFirstDisabled: false
	};
});


app.controller("AssociateController", ['$http', '$window',
	function($http, $window) {

		this.associateSensor = function() {
			var value = {};
			value = {
				idSensor: this.sensor,
				idRoom: this.room
			};
			$http.post('/associate', value);
			$window.location.reload();
		};
	}
]);


/*Controleur utilisé dans la page relevé, il sert à récupérer les données 
  relevées dans la base de données et permet de les mettre sous forme de graphe*/
app.controller("GraphCtrl", ['$scope', '$http', '$filter',
	function($scope, $http, $filter) {
		//Mode simple: line-chart, un seul capteur choisi et affiché
		var monthName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 
		'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
		var today = new Date();
		$scope.selected = '';
		$scope.month = today.getMonth(); //janvier 0-11 decembre
		$scope.year = today.getFullYear();
		$scope.navDate = monthName[$scope.month] + ' ' + $scope.year;
		$scope.month1 = today.getMonth(); //janvier 0-11 decembre
		$scope.year1 = today.getFullYear();
		$scope.navDate1 = monthName[$scope.month1] + ' ' + $scope.year1;

		/********Export datas*********/
		$scope.filename = "releves";
	    $scope.getArray = [];

	    $scope.getHeader = function () {
			return ["Date", "", "Valeur", "", $scope.selectSensor]
		};

		$scope.decimalSeparator = ",";
		$scope.separator = ";";
		/****************************/
		//fonction permettant la navigation mensuel
		$scope.navDecrease = function(){
			if($scope.month == 0){
				$scope.month = 11;
				$scope.year--;
			}
			else{
				$scope.month--;
			}
			$scope.navDate = monthName[$scope.month] + ' ' + $scope.year;
			if($scope.selectSensor) $scope.refreshData(); 
		};

		//fonction permettant la navigation mensuel
		$scope.navIncrease = function(){
			if($scope.month == 11){
				$scope.month = 0;
				$scope.year++;
			}
			else{
				$scope.month++;
			}
			$scope.navDate = monthName[$scope.month] + ' ' + $scope.year;
			if($scope.selectSensor) $scope.refreshData(); 
		};

		$scope.refreshData = function() {
			var tmpMonth, tmpYear;
			if($scope.month == 11){
				tmpMonth =0;
				tmpYear = $scope.year + 1;
			}
			else{
				tmpMonth = $scope.month + 1;
				tmpYear = $scope.year;
			}

			var value = {
				sensorId: $scope.selectSensor,
				day1: 1,
				month1: $scope.month,
				year1: $scope.year,
				day2: 1,
				month2: tmpMonth,
				year2: tmpYear
			};
			$scope.values = [];
			$scope.statements = [];
			$scope.getArray.length = 0;
			$http.post('/statementIdDate', value)
			.success(function(data) {
				angular.forEach(data, function(eachValue) {
					var tmpDate1 = new Date(eachValue.date);
					var tmpDate = tmpDate1.getTime();
					var tmpDate2 = $filter('date')(eachValue.date, 'dd/MM/yyyy h:mm:ss');
					if (eachValue.value == 'true') {
						$scope.statements.push([tmpDate, 1]);
						$scope.getArray.push([tmpDate2, 1]);
					} else if (eachValue.value == 'false') {
						$scope.statements.push([tmpDate, 0]);
						$scope.getArray.push([tmpDate2, 0]);
					} else {
						$scope.statements.push([tmpDate, parseFloat(eachValue.value)]);
						$scope.getArray.push([tmpDate2, parseFloat(eachValue.value)]);
					}
				});
				$scope.dataGraph = [
	            {
	                "key": "Graph",
	                "values": $scope.statements
	            }];
	
			});
		};

		/*********************** Multi Graph *****************************/
		$scope.navDecrease1 = function(){
			if($scope.month1 == 0){
				$scope.month1 = 11;
				$scope.year1--;
			}
			else{
				$scope.month1--;
			}
			$scope.navDate1 = monthName[$scope.month1] + ' ' + $scope.year1;
			if($scope.selectType) $scope.refreshMultiData(); 
		};

		$scope.navIncrease1 = function(){
			if($scope.month1 == 11){
				$scope.month1 = 0;
				$scope.year1++;
			}
			else{
				$scope.month1++;
			}
			$scope.navDate1 = monthName[$scope.month1] + ' ' + $scope.year1;
			if($scope.selectType) $scope.refreshMultiData(); 
		};

		$scope.refreshMultiData = function() {
			var tmpMonth, tmpYear;
			if($scope.month1 == 11){
				tmpMonth =0;
				tmpYear = $scope.year1 + 1;
			}
			else{
				tmpMonth = $scope.month1 + 1;
				tmpYear = $scope.year1;
			}

			var value = {
				sensorType: $scope.selectType,
				day1: 1,
				month1: $scope.month1,
				year1: $scope.year1,
				day2: 1,
				month2: tmpMonth,
				year2: tmpYear
			};
			$scope.multiStatements = [];
			$http.post('/statementTypeDate', value)
			.success(function(multiData) {//multiData contient les ids en 0, et les valeurs dans 1
				angular.forEach(multiData[1], function(data, key){
					$scope.multiStatements[key] = [];
					angular.forEach(data, function(eachValue){
						var tmpDate1 = new Date(eachValue.date);
						var tmpDate = tmpDate1.getTime();
						if (eachValue.value == 'true') {
							$scope.multiStatements[key].push([tmpDate, 1]);
						} else if (eachValue.value == 'false') {
							$scope.multiStatements[key].push([tmpDate, 0]);
						} else {
							$scope.multiStatements[key].push([tmpDate, parseFloat(eachValue.value)]);
						}
					});
				});
				var tmp = [];
				for(var i = 0; i<$scope.multiStatements.length; ++i){
					tmp.push({
						"key": multiData[0][i],
	                	"values": $scope.multiStatements[i]
					});
				}
				$scope.dataMultiGraph = tmp;
			});
		};
		/**************************************************/

        $scope.xFunction = function(){
            return function(d) {
                return d[0];
            }
        };

        $scope.yFunction = function(){
            return function(d) {
                return d[1]/100;
            }
        };

		$scope.xAxisTickFormatFunction = function() {
		    return function(d){
		      	return d3.time.format('%H:%M %d/%m')(new Date(d));
		    }
		};

		//Mode: multiple, basé sur les types (température, luminance, humidité)
		//cumulative-line-chart
		/*$scope.exampleData = [
	  		{
	      		"key": "Series 1",
	          	"values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
	      	},
	      	{
	      		"key": "Series 2",
	          	"values": [ [ 1025409600000 , 0] , [ 1028088000000 , 0] , [ 1030766400000 , 0] , [ 1033358400000 , 0] , [ 1036040400000 , 0] , [ 1038632400000 , 0] , [ 1041310800000 , 0] , [ 1043989200000 , 0] , [ 1046408400000 , 0] , [ 1049086800000 , 0] , [ 1051675200000 , 0] , [ 1054353600000 , 0] , [ 1056945600000 , 0] , [ 1059624000000 , 0] , [ 1062302400000 , 0] , [ 1064894400000 , 0] , [ 1067576400000 , 0] , [ 1070168400000 , 0] , [ 1072846800000 , 0] , [ 1075525200000 , -0.049184266875945] , [ 1078030800000 , -0.10757569491991] , [ 1080709200000 , -0.075601531307242] , [ 1083297600000 , -0.061245277988149] , [ 1085976000000 , -0.068227316401169] , [ 1088568000000 , -0.11242758058502] , [ 1091246400000 , -0.074848439408270] , [ 1093924800000 , -0.11465623676497] , [ 1096516800000 , -0.24370633342416] , [ 1099195200000 , -0.21523268478893] , [ 1101790800000 , -0.37859370911822] , [ 1104469200000 , -0.41932884345151] , [ 1107147600000 , -0.45393735984802] , [ 1109566800000 , -0.50868179522598] , [ 1112245200000 , -0.48164396881207] , [ 1114833600000 , -0.41605962887194] , [ 1117512000000 , -0.48490348490240] , [ 1120104000000 , -0.55071036101311] , [ 1122782400000 , -0.67489170505394] , [ 1125460800000 , -0.74978070939342] , [ 1128052800000 , -0.86395050745343] , [ 1130734800000 , -0.78524898506764] , [ 1133326800000 , -0.99800440950854] , [ 1136005200000 , -1.1177951153878] , [ 1138683600000 , -1.4119975432964] , [ 1141102800000 , -1.2409959736465] , [ 1143781200000 , -1.3088936375431] , [ 1146369600000 , -1.5495785469683] , [ 1149048000000 , -1.1563414981293] , [ 1151640000000 , -0.87192471725994] , [ 1154318400000 , -0.84073995183442] , [ 1156996800000 , -0.88761892867370] , [ 1159588800000 , -0.81748513917485] , [ 1162270800000 , -1.2874081041274] , [ 1164862800000 , -1.9234702981339] , [ 1167541200000 , -1.8377768147648] , [ 1170219600000 , -2.7107654031830] , [ 1172638800000 , -2.6493268125418] , [ 1175313600000 , -3.0814553134551] , [ 1177905600000 , -3.8509837783574] , [ 1180584000000 , -5.2919167850718] , [ 1183176000000 , -5.2297750650773] , [ 1185854400000 , -3.9335668501451] , [ 1188532800000 , -2.3695525190114] , [ 1191124800000 , -2.3084243151854] , [ 1193803200000 , -3.0753680726738] , [ 1196398800000 , -2.2346609938962] , [ 1199077200000 , -3.0598810361615] , [ 1201755600000 , -1.8410154270386] , [ 1204261200000 , -1.6479442038620] , [ 1206936000000 , -1.9293858622780] , [ 1209528000000 , -3.0769590460943] , [ 1212206400000 , -4.2423933501421] , [ 1214798400000 , -2.6951491617768] , [ 1217476800000 , -2.8981825939957] , [ 1220155200000 , -2.9662727940324] , [ 1222747200000 , 0.21556750497498] , [ 1225425600000 , 2.6784995167088] , [ 1228021200000 , 4.1296711248958] , [ 1230699600000 , 3.7311068218734] , [ 1233378000000 , 4.7695330866954] , [ 1235797200000 , 5.1919133040990] , [ 1238472000000 , 4.1025856045660] , [ 1241064000000 , 2.8498939666225] , [ 1243742400000 , 2.8106017222851] , [ 1246334400000 , 2.8456526669963] , [ 1249012800000 , 0.65563070754298] , [ 1251691200000 , -0.30022343874633] , [ 1254283200000 , -1.1600358228964] , [ 1256961600000 , -0.26674408835052] , [ 1259557200000 , -1.4693389757812] , [ 1262235600000 , -2.7855421590594] , [ 1264914000000 , -1.2668244065703] , [ 1267333200000 , -2.5537804115548] , [ 1270008000000 , -4.9144552474502] , [ 1272600000000 , -6.0484408234831] , [ 1275278400000 , -3.3834349033750] , [ 1277870400000 , -0.46752826932523] , [ 1280548800000 , -1.8030186027963] , [ 1283227200000 , -0.99623230097881] , [ 1285819200000 , -3.3475370235594] , [ 1288497600000 , -3.8187026520342] , [ 1291093200000 , -4.2354146250353] , [ 1293771600000 , -5.6795404292885] , [ 1296450000000 , -6.2928665328172] , [ 1298869200000 , -6.8549277434419] , [ 1301544000000 , -6.9925308360918] , [ 1304136000000 , -8.3216548655839] , [ 1306814400000 , -7.7682867271435] , [ 1309406400000 , -6.9244213301058] , [ 1312084800000 , -5.7407624451404] , [ 1314763200000 , -2.1813149077927] , [ 1317355200000 , 2.9407596325999] , [ 1320033600000 , -1.1130607112134] , [ 1322629200000 , -2.0274822307752] , [ 1325307600000 , -1.8372559072154] , [ 1327986000000 , -4.0732815531148] , [ 1330491600000 , -6.4417038470291]]
	     	},
	     	{
	     		"key": "Series 3",
	         	"values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.693972514363] , [ 1078030800000 , 29.489903107308] , [ 1080709200000 , 30.756096054034] , [ 1083297600000 , 27.992822746720] , [ 1085976000000 , 29.225852107431] , [ 1088568000000 , 30.156836480689] , [ 1091246400000 , 24.859678459498] , [ 1093924800000 , 24.151326522641] , [ 1096516800000 , 26.974088564049] , [ 1099195200000 , 30.587369307288] , [ 1101790800000 , 35.952410049136] , [ 1104469200000 , 42.723169856608] , [ 1107147600000 , 40.104326572110] , [ 1109566800000 , 42.034940590574] , [ 1112245200000 , 41.201940741519] , [ 1114833600000 , 35.959307673456] , [ 1117512000000 , 40.234785495828] , [ 1120104000000 , 43.347252675906] , [ 1122782400000 , 49.122142270314] , [ 1125460800000 , 46.336213226596] , [ 1128052800000 , 45.738022352292] , [ 1130734800000 , 40.782535587694] , [ 1133326800000 , 46.298919327736] , [ 1136005200000 , 46.525174496692] , [ 1138683600000 , 49.369518277658] , [ 1141102800000 , 51.359233230659] , [ 1143781200000 , 54.290790853085] , [ 1146369600000 , 56.370809889665] , [ 1149048000000 , 52.347251720842] , [ 1151640000000 , 52.651049262704] , [ 1154318400000 , 49.006082346714] , [ 1156996800000 , 53.833722685976] , [ 1159588800000 , 57.368751084016] , [ 1162270800000 , 62.620657436870] , [ 1164862800000 , 67.843814831233] , [ 1167541200000 , 70.696236558827] , [ 1170219600000 , 75.281054033390] , [ 1172638800000 , 75.494257592448] , [ 1175313600000 , 80.620943351778] , [ 1177905600000 , 87.289875534061] , [ 1180584000000 , 93.299043821956] , [ 1183176000000 , 91.015859689151] , [ 1185854400000 , 88.392797582470] , [ 1188532800000 , 94.699212813219] , [ 1191124800000 , 103.50183124741] , [ 1193803200000 , 111.30811970524] , [ 1196398800000 , 101.36138850420] , [ 1199077200000 , 98.665003256909] , [ 1201755600000 , 87.999132307989] , [ 1204261200000 , 85.315653328802] , [ 1206936000000 , 82.146119346213] , [ 1209528000000 , 90.093146599737] , [ 1212206400000 , 99.385987481068] , [ 1214798400000 , 84.763092203314] , [ 1217476800000 , 82.910191547323] , [ 1220155200000 , 90.191781675161] , [ 1222747200000 , 66.188819887335] , [ 1225425600000 , 47.259186154933] , [ 1228021200000 , 40.548648265024] , [ 1230699600000 , 42.458784966634] , [ 1233378000000 , 41.462207260082] , [ 1235797200000 , 35.224936113579] , [ 1238472000000 , 40.810117767284] , [ 1241064000000 , 55.041351655012] , [ 1243742400000 , 59.168485702020] , [ 1246334400000 , 60.474654847301] , [ 1249012800000 , 67.306616497709] , [ 1251691200000 , 70.539019993440] , [ 1254283200000 , 77.571962668603] , [ 1256961600000 , 72.108784451998] , [ 1259557200000 , 80.269048905849] , [ 1262235600000 , 84.754250235173] , [ 1264914000000 , 83.053938255703] , [ 1267333200000 , 88.067497980334] , [ 1270008000000 , 97.556993569060] , [ 1272600000000 , 96.744762710807] , [ 1275278400000 , 87.146301147104] , [ 1277870400000 , 76.113331725206] , [ 1280548800000 , 84.745960774176] , [ 1283227200000 , 80.883421033110] , [ 1285819200000 , 98.377963136001] , [ 1288497600000 , 104.16094587057] , [ 1291093200000 , 101.92699168281] , [ 1293771600000 , 109.16314556604] , [ 1296450000000 , 115.31506669000] , [ 1298869200000 , 126.55944572261] , [ 1301544000000 , 118.47392959295] , [ 1304136000000 , 121.44619467743] , [ 1306814400000 , 120.38970188330] , [ 1309406400000 , 114.99946573061] , [ 1312084800000 , 110.95959856356] , [ 1314763200000 , 86.186386929240] , [ 1317355200000 , 62.100425398325] , [ 1320033600000 , 78.680507428540] , [ 1322629200000 , 73.876351797642] , [ 1325307600000 , 70.866962301942] , [ 1327986000000 , 80.863709250982] , [ 1330491600000 , 86.946444823715]]
	     	},
	     	{
	     		"key": "Series 4",
	         	"values": [ [ 1025409600000 , -7.0674410638835] , [ 1028088000000 , -14.663359292964] , [ 1030766400000 , -14.104393060540] , [ 1033358400000 , -23.114477037218] , [ 1036040400000 , -16.774256687841] , [ 1038632400000 , -11.902028464000] , [ 1041310800000 , -16.883038668422] , [ 1043989200000 , -19.104223676831] , [ 1046408400000 , -20.420523282736] , [ 1049086800000 , -19.660555051587] , [ 1051675200000 , -13.106911231646] , [ 1054353600000 , -8.2448460302143] , [ 1056945600000 , -7.0313058730976] , [ 1059624000000 , -5.1485118700389] , [ 1062302400000 , -3.0011028761469] , [ 1064894400000 , -4.1367265281467] , [ 1067576400000 , 1.5425209565025] , [ 1070168400000 , 2.7673533607299] , [ 1072846800000 , 7.7077114755360] , [ 1075525200000 , 9.7565015112434] , [ 1078030800000 , 11.396888609473] , [ 1080709200000 , 10.013964745578] , [ 1083297600000 , 8.0558890950562] , [ 1085976000000 , 9.6081966657458] , [ 1088568000000 , 11.918590426432] , [ 1091246400000 , 7.9945345523982] , [ 1093924800000 , 8.3201276776796] , [ 1096516800000 , 9.8283954846342] , [ 1099195200000 , 11.527125859650] , [ 1101790800000 , 16.413657596527] , [ 1104469200000 , 20.393798297928] , [ 1107147600000 , 17.456308413907] , [ 1109566800000 , 20.087778400999] , [ 1112245200000 , 17.988336990817] , [ 1114833600000 , 15.378490151331] , [ 1117512000000 , 19.474322935730] , [ 1120104000000 , 20.013851070354] , [ 1122782400000 , 24.749943726975] , [ 1125460800000 , 23.558710274826] , [ 1128052800000 , 24.558915040889] , [ 1130734800000 , 22.355860488034] , [ 1133326800000 , 27.138026265756] , [ 1136005200000 , 27.202220808591] , [ 1138683600000 , 31.219437344964] , [ 1141102800000 , 31.392355525125] , [ 1143781200000 , 33.373099232542] , [ 1146369600000 , 35.095277582309] , [ 1149048000000 , 30.923356507615] , [ 1151640000000 , 31.083717332561] , [ 1154318400000 , 31.290690671561] , [ 1156996800000 , 34.247769216679] , [ 1159588800000 , 37.411073177620] , [ 1162270800000 , 42.079177096411] , [ 1164862800000 , 44.978191659648] , [ 1167541200000 , 46.713271025310] , [ 1170219600000 , 49.203892437699] , [ 1172638800000 , 46.684723471826] , [ 1175313600000 , 48.385458973500] , [ 1177905600000 , 54.660197840305] , [ 1180584000000 , 60.311838415602] , [ 1183176000000 , 57.583282204682] , [ 1185854400000 , 52.425398898751] , [ 1188532800000 , 54.663538086985] , [ 1191124800000 , 60.181844325224] , [ 1193803200000 , 62.877219773621] , [ 1196398800000 , 55.760611512951] , [ 1199077200000 , 54.735280367784] , [ 1201755600000 , 45.495912959474] , [ 1204261200000 , 40.934919015876] , [ 1206936000000 , 40.303777633187] , [ 1209528000000 , 47.403740368773] , [ 1212206400000 , 49.951960898839] , [ 1214798400000 , 37.534590035098] , [ 1217476800000 , 36.405758293321] , [ 1220155200000 , 38.545373001858] , [ 1222747200000 , 26.106358664455] , [ 1225425600000 , 4.2658006768744] , [ 1228021200000 , -3.5517839867557] , [ 1230699600000 , -2.0878920761513] , [ 1233378000000 , -10.408879093829] , [ 1235797200000 , -19.924242196038] , [ 1238472000000 , -12.906491912782] , [ 1241064000000 , -3.9774866468346] , [ 1243742400000 , 1.0319171601402] , [ 1246334400000 , 1.3109350357718] , [ 1249012800000 , 9.1668309061935] , [ 1251691200000 , 13.121178985954] , [ 1254283200000 , 17.578680237511] , [ 1256961600000 , 14.971294355085] , [ 1259557200000 , 21.551327027338] , [ 1262235600000 , 24.592328423819] , [ 1264914000000 , 20.158087829555] , [ 1267333200000 , 24.135661929185] , [ 1270008000000 , 31.815205405903] , [ 1272600000000 , 34.389524768466] , [ 1275278400000 , 23.785555857522] , [ 1277870400000 , 17.082756649072] , [ 1280548800000 , 25.248007727100] , [ 1283227200000 , 19.415179069165] , [ 1285819200000 , 30.413636349327] , [ 1288497600000 , 35.357952964550] , [ 1291093200000 , 35.886413535859] , [ 1293771600000 , 45.003601951959] , [ 1296450000000 , 48.274893564020] , [ 1298869200000 , 53.562864914648] , [ 1301544000000 , 54.108274337412] , [ 1304136000000 , 58.618190111927] , [ 1306814400000 , 56.806793965598] , [ 1309406400000 , 54.135477252994] , [ 1312084800000 , 50.735258942442] , [ 1314763200000 , 42.208170945813] , [ 1317355200000 , 31.617916826724] , [ 1320033600000 , 46.492005006737] , [ 1322629200000 , 46.203116922145] , [ 1325307600000 , 47.541427643137] , [ 1327986000000 , 54.518998440993] , [ 1330491600000 , 61.099720234693]]
	     	}
	 	];*/

    }]
);



/*
app.controller("LineCtrl", ['$scope', '$http', '$filter',
	function($scope, $http, $filter) {

		$scope.refreshData = function() {
			$scope.values = [];
			$scope.statements = [];
			$scope.labels = [];
			$scope.now = $filter('date')(new Date, 'shortDate');
			$http.get('/statement')
				.success(function(data) {
					$scope.values.push(data);
					console.log("success!");
					angular.forEach($scope.values[0], function(eachValue) {
						$scope.result = $filter('date')(eachValue.date, 'shortDate');
						if ('7/10/15' == $scope.result) {
							if ($scope.selectSensor == eachValue.sensor_id) {
								if (eachValue.value == 'true') {
									$scope.statements.push('1');
								} else if (eachValue.value == 'false') {
									$scope.statements.push('0');
								} else {
									$scope.statements.push(eachValue.value);
								}
								$scope.labels.push($filter('date')(eachValue.date, 'HH:mm').replace(':', 'h'));
							};
						};
					});



					// Chart.js Data
					$scope.data = {
						labels: $scope.labels,
						datasets: [{
							label: 'My First dataset',
							fillColor: 'rgba(220,220,220,0.2)',
							strokeColor: 'rgba(220,220,220,1)',
							pointColor: 'rgba(220,220,220,1)',
							pointStrokeColor: '#fff',
							pointHighlightFill: '#fff',
							pointHighlightStroke: 'rgba(220,220,220,1)',
							data: $scope.statements
						}]
					};

					// Chart.js Options
					$scope.options = {
						// Sets the chart to be responsive
						responsive: true,
						///Boolean - Whether grid lines are shown across the chart
						scaleShowGridLines: true,
						//String - Colour of the grid lines
						scaleGridLineColor: "rgba(0,0,0,.05)",
						//Number - Width of the grid lines
						scaleGridLineWidth: 1,
						//Boolean - Whether the line is curved between points
						bezierCurve: true,
						//Number - Tension of the bezier curve between points
						bezierCurveTension: 0.4,
						//Boolean - Whether to show a dot for each point
						pointDot: true,
						//Number - Radius of each point dot in pixels
						pointDotRadius: 4,
						//Number - Pixel width of point dot stroke
						pointDotStrokeWidth: 1,
						//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
						pointHitDetectionRadius: 20,
						//Boolean - Whether to show a stroke for datasets
						datasetStroke: true,
						//Number - Pixel width of dataset stroke
						datasetStrokeWidth: 2,
						//Boolean - Whether to fill the dataset with a colour
						datasetFill: false,
						// Function - on animation progress
						onAnimationProgress: function() {},
						// Function - on animation complete
						onAnimationComplete: function() {},
						//String - A legend template
						legendTemplate: '<ul class="tc-chartjs-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
					};
				});
		}
	}
]);
*/