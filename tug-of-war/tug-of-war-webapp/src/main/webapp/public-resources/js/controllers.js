var towControllers = angular.module('towControllers', []);

var host = "http://" + window.location.host + "/tow";

towControllers.controller('mainController', [ '$interval', '$cookies', '$scope', '$routeParams', '$http', function($interval, $cookies, $scope, $routeParams, $http) {
	$scope.name = null;

	$scope.socket = null;
	$scope.phones = [];
	$scope.recordNames = {};

	$scope.recording = false;

	$scope.onePhone = {};

	$scope.BTN_HOME = 102;
	$scope.BTN_BACK = 158;
	$scope.BTN_MENU = 139;
	$scope.BTN_SEARCH = 217;

	$scope.goHome = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 6,
			'keyStroke' : $scope.BTN_HOME,
			'phoneId' : phoneId
		}));
	}

	$scope.goBack = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 6,
			'keyStroke' : $scope.BTN_BACK,
			'phoneId' : phoneId
		}));
	}

	$scope.goMenu = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 6,
			'keyStroke' : $scope.BTN_MENU,
			'phoneId' : phoneId
		}));
	}

	$scope.goSearch = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 6,
			'keyStroke' : $scope.BTN_SEARCH,
			'phoneId' : phoneId
		}));
	}

	$scope.record = function(phoneId) {
		var request = $http({
			method : "post",
			url : host + "/" + phoneId + "/record"
		});

		// Store the data-dump of the FORM scope.
		request.success(function(body) {
			for ( var i = 0; i < $scope.phones.length; i++) {
				var phone = $scope.phones[i];

				if (phone.phoneId == phoneId) {
					phone.isRecording = body.isRecording;
				}
			}
		});
	}

	$scope.stopRecording = function(phoneId) {
		var request = $http({
			method : "post",
			url : host + "/" + phoneId + "/recordings/" + $scope.recordNames[phoneId].name
		});

		request.success(function(body) {
			for ( var i = 0; i < $scope.phones.length; i++) {
				var phone = $scope.phones[i];

				if (phone.phoneId == phoneId) {
					phone.isRecording = body.isRecording;
					phone.recordNames = body.recordNames;
				}
			}
		});
	}

	$scope.runRecording = function(phoneId, recordName) {
		var request = $http({
			method : "post",
			url : host + "/" + phoneId + "/recordings/" + recordName + "/run"
		});

		request.success(function(body) {
			for ( var i = 0; i < $scope.phones.length; i++) {
				var phone = $scope.phones[i];

				if (phone.phoneId == phoneId) {
					phone.isRecording = body.isRecording;
					phone.recordNames = body.recordNames;
				}
			}
		});
	}

	$scope.getRecordings = function(phoneId) {
		var request = $http({
			method : "post",
			url : host + "/" + phoneId + "/recordings/" + $scope.recordNames[phoneId].name
		});

		// Store the data-dump of the FORM scope.
		request.success(function(body) {
			for ( var i = 0; i < $scope.phones.length; i++) {
				$scope.phones[i].isRecording = body.isRecording;
			}
		});
	}

	$scope.doneRecordingInputNotFilledOut = function(recordInputId) {
		if ($('#' + 'doneRecordingInput' + recordInputId).val() == undefined) {
			return true;
		}

		if ($('#' + 'doneRecordingInput' + recordInputId).val().length < 1) {
			return true;
		}

		return false;
	}

	$scope.toggleRecording = function() {
		$scope.recording = !$scope.recording;
	}

	$scope.initPhone = function() {
		$scope.connect();
	}

	$scope.shiftPressed = false;

	$scope.phoneInput = function(e, phoneId) {
		if (e.shiftKey && e.keyCode != 16) {
			$scope.socket.send(JSON.stringify({
				'op' : 6,
				'phoneId' : phoneId,
				'keyStroke' : 16
			}));

			$scope.socket.send(JSON.stringify({
				'op' : 6,
				'phoneId' : phoneId,
				'keyStroke' : e.keyCode
			}));

			return;
		}

		if (e.keyCode != 16) {
			$scope.socket.send(JSON.stringify({
				'op' : 6,
				'phoneId' : phoneId,
				'keyStroke' : e.keyCode
			}));
		}
	};

	$scope.moveUpdate = function(x, y, phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 2,
			'x' : x,
			'y' : y,
			'phoneId' : phoneId
		}));
	}

	$scope.phoneMouseDown = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 0,
			'phoneId' : phoneId
		}));
	}

	$scope.phoneMouseUp = function(phoneId) {
		$scope.socket.send(JSON.stringify({
			'op' : 1,
			'phoneId' : phoneId
		}));
	}

	$scope.phoneMouseMove = function(phoneId, e) {
		var parentOffset = $("#" + phoneId).parent().offset();
		// or $(this).offset(); if you really just want
		// the current
		// element's offset
		$scope.onePhone = {
			x : e.pageX - parentOffset.left,
			y : e.pageY - parentOffset.top
		}

		$scope.moveUpdate($scope.onePhone.x * $scope.phoneXMultiplier, $scope.onePhone.y * $scope.phoneYMultiplier, phoneId);
	}

	function setConnected(connected) {
		document.getElementById('connect').disabled = connected;
		document.getElementById('disconnect').disabled = !connected;
		document.getElementById('conversationDiv').style.visibility = connected ? 'visible' : 'hidden';
		document.getElementById('response').innerHTML = '';
	}

	$scope.parseSS = function(ss) {
//		console.log(blob);
		
		$("#imgimg").attr('src', "data:image/jpg;base64," + ss.screenShotData);
	}
	
	$scope.connect = function() {
		$scope.socket = new WebSocket("ws://" + window.location.host + '/tow/update');
		$scope.socket.onopen = function(event) {
			$scope.socket.send(JSON.stringify({
				'op' : 4
			}));
		}

		$scope.socket.onmessage = function(event) {
			var data = JSON.parse(event.data);
			if (data.op == 7) {
				$scope.parseSS(data);
			}
			
			if (data.op == 3) {
				$scope.phones = data.phones;

				$scope.$apply();

				if (data.phones.length == 0) {
					for ( var i = 0; i < $scope.phones.length; i++) {
						$('#' + $scope.phones[i].phoneId).css("width", 0);
						$('#' + $scope.phones[i].phoneId).css("height", 0);

						$('#phone-input-' + $scope.phones[i].phoneId).css("width", 0);
						$('#phone-control-' + $scope.phones[i].phoneId).css("width", 0);
					}

					return;
				}

				for ( var i = 0; i < $scope.phones.length; i++) {
					var phoneX = data.phones[i].x;
					var phoneY = data.phones[i].y;

					var xOverY = phoneX / phoneY;

					var widthContainer = phoneY / 3 * xOverY;
					var heightContainer = phoneY / 3;

					$scope.phoneXMultiplier = phoneX / widthContainer;
					$scope.phoneYMultiplier = phoneY / heightContainer;

					$('#' + $scope.phones[i].phoneId).css("width", widthContainer);
					$('#' + $scope.phones[i].phoneId).css("height", heightContainer);

					$('#imgimg').css("width", widthContainer);
					$('#imgimg').css("height", heightContainer);
					
					$("#imgimg").mousedown(function( event ) {
						  event.preventDefault();
					});
					
					$('#phone-input-' + $scope.phones[i].phoneId).css("width", widthContainer);
					$('#phone-control-' + $scope.phones[i].phoneId).css("width", widthContainer);
				}
			}
		}
	}

	function disconnect() {
		console.log("Disconnected");
	}

	function showGreeting(message) {
		var response = document.getElementById('response');
		var p = document.createElement('p');
		p.style.wordWrap = 'break-word';
		p.appendChild(document.createTextNode(message));
		response.appendChild(p);
	}
} ]);