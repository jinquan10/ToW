var canvas;
var context;

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
	var jCanvas = $("#canvas");
	canvas = $("#canvas")[0];
	context = canvas.getContext('2d');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	jCanvas.mousedown(function(){
		mousedown = true;
	});
	
	jCanvas.mousemove(function(event){
		if (mousedown) {
			mousemoving = true;
		}
	});
	
	jCanvas.mouseup(function(){
		mousedown = false;
		mousemoving = false;
	});
	
	drawImgs();
});

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

	requestAnimFrame(function() {
		animate();
	});
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
			context.drawImage(ropeImg, ropeLeftV, ropeTop, ropeImg.width / ropeScale, ropeImg.height + (fromTheMiddle * 2) + 4);
			context.drawImage(knotImg, knotLeftV, knotTop, knotImg.width * knotScale, knotImg.height * knotScale);
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