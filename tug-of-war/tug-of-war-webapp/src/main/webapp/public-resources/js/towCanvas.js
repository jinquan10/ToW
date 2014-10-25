var canvas;
var context;
var ws;
var wsUrl = "ws://192.168.1.101:8082/tow/update";
var wsConnected = false;
var gameStarted = false;

// tug vars
var tick = 0; // ms
var currTick = -1;
var tugged = 0; // - how much i tugged last refresh
var prevGameTugged = null;
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

var staticAnimations = [];

var backgroundOrder = 1;
var semiCircleOrder = 2;
var ropeOrder = 3;

var mousedown = false;
var mousemoving = false;

var ropeChanged = false;

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

	var prevY = -1;
	var currY = -1;
	
	jCanvas.mousedown(function(){
		mousedown = true;
		prevY = -1;
		
		console.log("mousedown");
	});
	
	jCanvas.mousemove(function(event){
		if(!gameStarted) {
			return;
		}
		
		if (mousedown) {
			mousemoving = true;
			
			if(prevY == -1){
				prevY = event.clientY; 
			}
			
			currY = event.clientY;
		}
	});
	
	jCanvas.mouseup(function(){
		var t = (currY - prevY);
		
		console.log("t: " + t);
		
		if (t > 0) {
			tugged += t;
			prevY = event.clientY;					
		}
		
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
			if (prevGameTugged == null) {
				prevGameTugged = 0;
			} else {
				prevGameTugged = gameTugged; 
			}
			
			gameTugged = data.tug;
			ropeChanged = true;
		}
	}
	
	return ws;
}

function drawImgs() {
	drawStatic();
	
	animate();
}

function drawStatic() {
	staticAnimations = [];
	drawBackground(true);
	drawSemiCircles(true);
	drawRope(true);
}

function drawBackground() {
	context.fillStyle = "#000000"; // sets color
	
	if(!ropeChanged) {
		addToAnimStack(backgroundOrder, function() {
			context.fillRect(0, 0, canvasWidth, canvasHeight);
		});
	} else {
		context.fillRect(0, 0, canvasWidth, canvasHeight);
	}
}

var radius = fromTheMiddle;
var topLine = canvasHeight / 2 - fromTheMiddle - radius;
var bottomLine = canvasHeight / 2 + fromTheMiddle + radius;
var lineLeft = canvasWidth / 2 - radius;

function drawSemiCircles() {
	if (!ropeChanged) {
		addToAnimStack(semiCircleOrder, function(){
			drawSemiCircle(radius, lineLeft, topLine, true);
			drawSemiCircle(radius, lineLeft, bottomLine, false);
		});
	} else {
		drawSemiCircle(radius, lineLeft, topLine, true);
		drawSemiCircle(radius, lineLeft, bottomLine, false);
	}
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

	staticAnimations.push(obj);
	sortStaticAnimations(staticAnimations);
}

function animate() {
	if (ropeChanged) {
		animateRopeChange(0);
		
		return;
	} 
	
	updateTug();
	animateStatic();
	updateTug();
	
	requestAnimFrame(function() {
		animate();
	});
}

function animateRopeChange(i) {
	drawBackground();
	drawSemiCircles();
	
	if (gameTugged > prevGameTugged) {
		drawRope(prevGameTugged + i);			
	} else {
		drawRope(prevGameTugged - i);
	}
	
	requestAnimFrame(function() {
		if (i <= Math.abs(gameTugged - prevGameTugged)) {
			animateRopeChange(i + 1);
		} else {
			ropeChanged = false;			
			animate();
		}
	});
}

function animateStatic() {
	for ( var i = 0; i < staticAnimations.length; i++) {
		(staticAnimations[i].func)();
	}
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
				tug : tugged / canvasHeight
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

var ropeLeft;
var ropeTop;
var knotLeft;
var knotTop;

function drawRope(tuggg) {
	if (ropeChanged) {
		var vib = getVibration()
		var ropeLeftV = vib + ropeLeft;
		var knotLeftV = vib + knotLeft;
		
		context.drawImage(ropeImg, ropeLeftV, ropeTop + tuggg, ropeImg.width / ropeScale, ropeImg.height + (fromTheMiddle * 2) + 4);
		context.drawImage(knotImg, knotLeftV, knotTop + tuggg, knotImg.width * knotScale, knotImg.height * knotScale);
		
		return;
	}
	
	this.ropeImg = new Image();
	this.knotImg = new Image();

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

function sortStaticAnimations(arr) {
	arr.sort(function(a, b) {
		if (a.order > b.order) {
			return 1;
		} else {
			return -1;
		}
	});
}