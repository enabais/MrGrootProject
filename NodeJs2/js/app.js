var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.jq', 'ui.load']);
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

app.factory("Statement", function StatementFactory($http) {
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

});


app.controller('StoreController', ['$http', 'Room', 'Sensor', 'Statement',
	function($http, Room, Sensor, Statement) {
		var store = this;
		store.rooms = [];
		store.sensors = [];
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

		Statement.all()
			.success(function(data) {
				store.statements = data;
				console.log("success!");
			});
			
		this.addRoom = function() {
			var value = {};
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

		this.deleteRoom = function(idRoom) {
			var value = {};
			console.log(idRoom);
			value = {
				id: idRoom
			};
			$http.post('/deleteRoom', value);
			Room.all()
				.success(function(data) {
					store.rooms = data;
					console.log("success!");
				});

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

app.controller("RoomController", ['$http', 'Room',
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
]);

app.controller("AssociateController", ['$http',
	function($http) {
		var value = {};
		this.associateSensor = function() {
			value = {
				idSensor: this.sensor,
				idRoom: this.room
			};
			$http.post('/associate', value)
				.success(function() {
					console.log("success associate : " + value.idSensor + ", " + value.idRoom);
				});

		};
	}
]);

app.controller('FlotChartDemoCtrl', ['$scope',
	function($scope) {
		$scope.axisAbs = "[ 0, '0h' ], [ 1, '1h' ], [ 2, '2h' ], [ 3, '3h' ], [ 4, '4h' ], [ 5, '5h' ], [ 6, '6h' ], [ 7, '7h' ], [ 8, '8h' ], [ 9, '9h' ], [ 10, '10h' ], [ 11, '11h' ], [ 12, '12h' ], [ 13, '13h' ], [ 14, '14h' ], [ 15, '15h' ], [ 16, '16h' ], [ 17, '17h' ], [ 18, '18h' ], [ 19, '19h' ], [ 20, '20h' ], [ 21, '21h' ], [ 22, '22h' ], [ 23, '23h' ]";

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

		$scope.refreshData = function(value) {
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

		};
	}
]);