var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.jq', 'ui.load', 'tc.chartjs']);
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
		store.statements = [];

		Room.all()
			.success(function(data) {
				store.rooms = data;
				console.log("success!");
			});

		Sensor.all()
			.success(function(data) {
				store.sensors = data;
				console.log("success!");
			});

		MainSensor.all()
			.success(function(data) {
				store.mainSensors = data;
				console.log('success!');
			});
		/*Statement.all()
			.success(function(data) {
				store.statements = data;
				console.log("success!");
			});*/

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

app.controller('AlertController', ['$http', '$scope', '$window', 'CU', 'CC', 'Sensor',
	function($http, $scope, $window, CU, CC, Sensor) {
		/*var store = this;
		alert.cc = [];
		alert.cu = [];

		CU.all()
			.success(function(data) {
				alert.cu = data;
				console.log("success!");
			});

		CC.all()
			.success(function(data) {
				alert.cc = data;
				console.log("success!");
			});*/
		$scope.allCU = [];
		$scope.allCC = [];
		$scope.allSensor = [];

		Sensor.all()
			.success(function(data) {
				angular.forEach(data, function(value) {
					$scope.allSensor.push(value);
				});
			});

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

		$scope.addCU = function() {
			var value = {};
			if ($scope.isMotion()) {
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
		};

		$scope.deleteCU = function(idCU) {
			var value = {};
			value = {
				id: idCU
			};
			$http.post('/deleteCU', value);
			$window.location.reload();
		};


		$scope.addCC = function() {
			var value = {};
			value = {
				name: this.name,
				description: this.description
			};
			$http.post('/cc', value);
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

		$scope.isMotion = function() {
			for (var i = 0; i < $scope.allSensor.length; ++i) {
				if ($scope.allSensor[i].name == $scope.choixsensor) {
					return $scope.allSensor[i].type == 'Motion Sensor';
				}
			}
			return false;
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

/*app.controller("RoomController", ['$http', 'Room',
	function($http, Room) {
		var store = this;
		store.rooms = [];
		var value = {};
		this.addRoom = function() {
			value = {
				name: this.name,
				description: this.description
			};
			$http.post('/room', value);
			Room.all()
				.success(function(data) {
					store.rooms = data;
					console.log("success!");
				});
		};
	}
]);*/

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

/*app.controller('FlotChartDemoCtrl', ['$scope',
	function($scope) {
		$scope.axisAbs = "[ 0, '0h' ], [ 1, '1h' ], [ 2, '2h' ], [ 3, '3h' ], [ 4, '4h' ], [ 5, '5h' ], [ 6, '6h' ], [ 7, '7h' ], [ 8, '8h' ], [ 9, '9h' ], [ 10, '10h' ], [ 11, '11h' ], [ 12, '12h' ], [ 13, '13h' ], [ 14, '14h' ], [ 15, '15h' ], [ 16, '16h' ], [ 17, '17h' ], [ 18, '18h' ], [ 19, '19h' ], [ 20, '20h' ], [ 21, '21h' ], [ 22, '22h' ], [ 23, '23h' ]";
		$scope.d = [];
		$scope.d0 = [
			[1, 6.5],
			[2, 6.5],
			[3, 7],
			[4, 8],
			[5, 7.5],
			[6, 7],
			[7, 6.8],
			[8, 7],
			[9, 7.2],
			[10, 7],
			[11, 6.8],
			[12, 7],
			[16, 6.5]
		];
		$scope.d0_1 = [
			[1, 6.5],
			[2, 12.5],
			[3, 7],
			[4, 9],
			[5, 6],
			[6, 11],
			[7, 6.5]
		];

		$scope.d0_2 = [
			[1, 4.5],
			[2, 7],
			[3, 4.5],
			[4, 3],
			[5, 3.5],
			[6, 6],
			[7, 3],
			[8, 4],
			[9, 3]
		];

		$scope.d = $scope.d0;

		$scope.refreshData = function() {
			if (value === 'month') {
				$scope.d = $scope.d0_2;
				$scope.axisAbs = "[ 1, 'Jan' ], [ 2, 'Feb' ], [ 3, 'Mar' ], [ 4, 'Apr' ], [ 5, 'May' ], [ 6, 'Jun' ], [ 7, 'Jul' ], [ 8, 'Aug' ], [ 9, 'Sep' ], [ 10, 'Oct' ], [ 11, 'Nov' ], [ 12, 'Dec' ]";
			} else if (value === 'week') {
				$scope.d = $scope.d0_1;
				$scope.axisAbs = "[ 1, 'Lun' ], [ 2, 'Mar' ], [ 3, 'Mer' ], [ 4, 'Jeu' ], [ 5, 'Ven' ], [ 6, 'Sam' ], [ 7, 'Dim' ]";
			} else if (value === 'day') {
				$scope.d = $scope.d0;
				$scope.axisAbs = "[ 0, '0h' ], [ 1, '1h' ], [ 2, '2h' ], [ 3, '3h' ], [ 4, '4h' ], [ 5, '5h' ], [ 6, '6h' ], [ 7, '7h' ], [ 8, '8h' ], [ 9, '9h' ], [ 10, '10h' ], [ 11, '11h' ], [ 12, '12h' ], [ 13, '13h' ], [ 14, '14h' ], [ 15, '15h' ], [ 16, '16h' ], [ 17, '17h' ], [ 18, '18h' ], [ 19, '19h' ], [ 20, '20h' ], [ 21, '21h' ], [ 22, '22h' ], [ 23, '23h' ]";

			}
			$scope.axisAbs = "[ 0, '0h' ], [ 1, '1h' ], [ 2, '2h' ], [ 3, '3h' ], [ 4, '4h' ], [ 5, '5h' ], [ 6, '6h' ], [ 7, '7h' ], [ 8, '8h' ], [ 9, '9h' ], [ 10, '10h' ], [ 11, '11h' ], [ 12, '12h' ], [ 13, '13h' ], [ 14, '14h' ], [ 15, '15h' ], [ 16, '16h' ], [ 17, '17h' ], [ 18, '18h' ], [ 19, '19h' ], [ 20, '20h' ], [ 21, '21h' ], [ 22, '22h' ], [ 23, '23h' ]";

			if ($scope.selectSensor === 'AeonTemp') {
				$scope.d = [
					[11, 18],
					[13, 23],
					[15, 25],
					[16, 20],
					[16.5, 20]
				];
			} else if ($scope.selectSensor === 'ZipatoLum') {
				$scope.d = [
					[11, 250],
					[13, 250],
					[15, 350],
					[16, 300],
					[16.5, 280]
				];
			} else if ($scope.selectSensor === 'ZipatoHum') {
				$scope.d = [
					[11, 16],
					[13, 19],
					[15, 18],
					[16, 19],
					[16.5, 23]
				];
			} else {
				$scope.d = [];
			}


		};
	}
]);*/