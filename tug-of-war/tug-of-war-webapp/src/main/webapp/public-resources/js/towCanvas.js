var canvas;
var context;
var ws;
var wsUrl = "ws://192.168.1.101:8082/tow/update";
var wsConnected = false;
var gameStarted = false;

// tug vars
var tick = 500; // ms
var currTick = -1;
var tugged = 0; // - how much i tugged last refresh
var gameTugged = 0; // - total tugged between 2 players

var ropeImg;
var knotImg;
var ropeScale = 3;
var knotScale = 1;
var ropeVibrationX = 4;

var fromTheMiddle = 300;
var canvasWidth = 800;
var canvasHeight = 800;
var semiCircleWidth = 5;
var semiCircleStrokeStyle = 'white';

var animations = [];

var backgroundOrder = 0;
var semiCircleOrder = 1;
var ropeOrder = 2;

var mousedown = false;
var mousemoving = false;

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame
			|| function(callback) { // - fallback
				window.setTimeout(callback, 1000 / 60);
			};
})();

$(function() {
	ws = connectToWS();
	
	var jCanvas = $("#canvas");
	canvas = $("#canvas")[0];
	context = canvas.getContext('2d');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	jCanvas.mousedown(function(){
		mousedown = true;
	});

	var prevY = -1;
	
	jCanvas.mousemove(function(event){
		if(!gameStarted) {
			return;
		}
		
		if (mousedown) {
			mousemoving = true;
			
			if(prevY == -1){
				prevY = event.clientY; 
			} else {
				var t = (event.clientY - prevY);
				if (t > 0) {
					tugged += t;
					prevY = event.clientY;					
				}
			}
		}
	});
	
	jCanvas.mouseup(function(){
		mousedown = false;
		mousemoving = false;
	});
	
	drawImgs();
});

function connectToWS() {
	var ws = new WebSocket(wsUrl);
	
	ws.onopen = function(event) {
		wsConnected = true;
		console.log("connected to ws server");
		
		// - tell server to start the game
		ws.send(JSON.stringify({
			op : 0
		}));
	};
	
	ws.onmessage = function(event) {
		var data = JSON.parse(event.data);
		
		if (data.op == 0) {
			gameStarted = true;
		} else if (data.op == 1) {
			gameTugged = data.tug;
		}
	}
	
	return ws;
}

function drawImgs() {
 drawBackground();
 drawSemiCircles();
 drawRope();
	
	animate();
}

function drawBackground() {
	context.fillStyle = "#000000"; // sets color
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	
	addToAnimStack(backgroundOrder, function() {
		context.fillRect(0, 0, canvasWidth, canvasHeight);
	});
}

function drawSemiCircles() {
	var radius = fromTheMiddle;
	var topLine = canvasHeight / 2 - fromTheMiddle - radius;
	var bottomLine = canvasHeight / 2 + fromTheMiddle + radius;
	var lineLeft = canvasWidth / 2 - radius;
	
	addToAnimStack(semiCircleOrder, function(){
		drawSemiCircle(radius, lineLeft, topLine, true);
 drawSemiCircle(radius, lineLeft, bottomLine, false);
	});
}

function drawSemiCircle(radius, x, y, isSmile) {
	var offset = (radius / 2);
	var a = -radius + offset;
	var x1 = x + offset;
	var radiusSqrd = radius * radius;

	var y1;

	if (isSmile) {
		y1 = y + Math.sqrt(radiusSqrd - (a * a));
	} else {
		y1 = y - Math.sqrt(radiusSqrd - (a * a));
	}

	context.beginPath();
	context.moveTo(x1, y1);

	for (var i = (-radius + offset + 1); i < radius - offset + 1; i++) {
		var dy = Math.sqrt(radiusSqrd - (i * i));

		var x3 = x1 + 1;
		var y3 = 0;

		if (isSmile) {
			y3 = y + dy;
		} else {
			y3 = y - dy;
		}

		var x2 = (x1 + x3) / 2;
		var y2 = (y1 + y3) / 2;
		context.quadraticCurveTo(x2, y2, x3, y3);
		x1 = x3;
		y1 = y3;
	}
	
	context.lineWidth = 5;
	context.strokeStyle = semiCircleStrokeStyle;
	context.stroke();
}

function addToAnimStack(order, func){
	var obj = {};
	obj.order = order;
	obj.func = func;

	animations.push(obj);
	sortAnimations(animations);
}

function animate() {
	for ( var i = 0; i < animations.length; i++) {
		(animations[i].func)();
	}
	;

	updateTug();
	
	requestAnimFrame(function() {
		animate();
	});
}

function updateTug(){
	if (tugged == 0) {
		return;
	}
	
	console.log("tugged: " + tugged);
	
	var milli = (new Date).getTime();
	if (milli - currTick > tick) {
		if (wsConnected) {
			ws.send(JSON.stringify({
				op : 1,
				tug : tugged
			}));
			
			currTick = milli;
			tugged = 0;
		}
	}
}

function getVibration() {
	if(mousemoving) {
		var leftOrRight = nextBoolean();
		return (leftOrRight == true) ? (Math.random() * ropeVibrationX) : (-1 * Math.random() * ropeVibrationX);
	} else {
		return 0;
	}
}

function drawRope() {
	this.ropeImg = new Image();
	this.knotImg = new Image();

	var ropeLeft;
	var ropeTop;
	var knotLeft;
	var knotTop;
	
	// - load the rope and knot sequentially to avoid complicated sync logic
	
	ropeImg.onload = function() {
		knotImg.src = '/tow/img/knot.png';
	};

	knotImg.onload = function() {
		ropeLeft = (canvasWidth / 2) - (ropeImg.width / ropeScale / 2);
		ropeTop = -fromTheMiddle;
		knotLeft = (canvasWidth / 2) - (knotImg.width * knotScale / 2);
		knotTop = (canvasHeight / 2) - (knotImg.height * knotScale / 2);

		addToAnimStack(ropeOrder, function() {
			var vib = getVibration()
			var ropeLeftV = vib + ropeLeft;
			var knotLeftV = vib + knotLeft;
			context.drawImage(ropeImg, ropeLeftV, ropeTop + gameTugged, ropeImg.width / ropeScale, ropeImg.height + (fromTheMiddle * 2) + 4);
			context.drawImage(knotImg, knotLeftV, knotTop + gameTugged, knotImg.width * knotScale, knotImg.height * knotScale);
		});
	};
	
	ropeImg.src = '/tow/img/rope.png';
}

function sortAnimations(arr) {
	arr.sort(function(a, b) {
		if (a.order > b.order) {
			return 1;
		} else {
			return -1;
		}
	});
}