var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.jq', 'ui.load', 'tc.chartjs', 'nvd3ChartDirectives']);
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
			$scope.allNotif.splice(index, 1);
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

		$scope.isSelected = function(sensor) {
			return (sensor.location == $scope.choixroom);
		};

		$scope.increase = function() {
			return ($scope.count = Math.abs($scope.count + 1) % 3);
		};

		$scope.descrease = function() {
			return ($scope.count = Math.abs($scope.count - 1) % 3);
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

		$scope.addCUs = function() {
			var value = {};
			var tmpOp = [];
			var tmpVal = [];
			var tmpSensor = [];
			if ($scope.isMotion($scope.choixsensor1)) {
				$scope.choixop1 = '=';
			}
			if ($scope.choixsensor1 && $scope.choixvalue1 != "" && $scope.choixop1) {
				tmpOp.push($scope.choixop1);
				tmpSensor.push($scope.choixsensor1);
				tmpVal.push($scope.choixvalue1);
			}

			if ($scope.isMotion($scope.choixsensor2)) {
				$scope.choixop2 = '=';
			}
			if ($scope.choixsensor2 && $scope.choixvalue2 != "" && $scope.choixop2) {
				tmpOp.push($scope.choixop2);
				tmpSensor.push($scope.choixsensor2);
				tmpVal.push($scope.choixvalue2);
			}

			if ($scope.isMotion($scope.choixsensor3)) {
				$scope.choixop3 = '=';
			}
			if ($scope.choixsensor3 && $scope.choixvalue3 != "" && $scope.choixop3) {
				tmpOp.push($scope.choixop3);
				tmpSensor.push($scope.choixsensor3);
				tmpVal.push($scope.choixvalue3);
			}

			if ($scope.isMotion($scope.choixsensor4)) {
				$scope.choixop4 = '=';
			}
			if ($scope.choixsensor4 && $scope.choixvalue4 != "" && $scope.choixop4) {
				tmpOp.push($scope.choixop4);
				tmpSensor.push($scope.choixsensor4);
				tmpVal.push($scope.choixvalue4);
			}
			value = {
				description: $scope.description,
				ref: tmpSensor,
				op: tmpOp,
				val: tmpVal
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


		/*$scope.addCC = function() {
			var value = {};
			value = {
				name: this.name,
				description: this.description
			};
			$http.post('/cc', value);
			$window.location.reload();
		};*/

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
	}

]);

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

app.controller("GraphCtrl", ['$scope', '$http', '$filter',
	function($scope, $http, $filter) {
		$scope.refreshData = function() {
			$scope.values = [];
			$scope.statements = [];
			$http.post('/statementId', {sensorId: $scope.selectSensor})
			.success(function(data) {
				$scope.values.push(data);
				angular.forEach($scope.values[0], function(eachValue) {
					var tmpDate1 = new Date(eachValue.date);//$filter('date')(eachValue.date, 'shortDate');
					var tmpDate = tmpDate1.getTime();
					//if ('7/10/15' == $filter('date')(eachValue.date, 'shortDate')) {
						if (eachValue.value == 'true') {
							$scope.statements.push([tmpDate, 1]);
						} else if (eachValue.value == 'false') {
							$scope.statements.push([tmpDate, 0]);
						} else {
							$scope.statements.push([tmpDate, parseFloat(eachValue.value)]);
						}
						console.log(d3.time.format('%d %M %Y')(new Date(eachValue.date)));
						console.log(tmpDate);
					//};
				});
				$scope.dataGraph = [
	            {
	                "key": "Graph",
	                "values": $scope.statements
	            }];
	            console.log($scope.statements);
			});
		};

        




		$scope.xAxisTickFormatFunction = function() {
		    return function(d){
		      	return d3.time.format('%H:%M %d/%m')(new Date(d));
		    }
		};
    }]
);
