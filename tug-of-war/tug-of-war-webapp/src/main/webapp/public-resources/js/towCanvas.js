var canvas;
var context;

var ropeImg;
var knotImg;
var ropeScale = 3;
var knotScale = 1;
var ropeVibrationX = 4;

var fromTheMiddle = 450;
var canvasWidth = 800;
var canvasHeight = 800;

var animations = [];

var backgroundOrder = 0;
var ropeOrder = 1;
var knotOrder = 2;

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
	
	loadImgs();
});

function loadImgs() {
	context.fillStyle = "#000000"; // sets color
	context.fillRect(0, 0, canvasWidth, canvasHeight);
	
	addToAnimStack(backgroundOrder, function() {
		context.fillRect(0, 0, canvasWidth, canvasHeight);
	});
	
	loadRope();
}

function addToAnimStack(order, func){
	var obj = {};
	obj.order = order;
	obj.func = func;

	animations.push(obj);
	sortAnimations(animations);
	animate();
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

function loadRope() {
	this.ropeImg = new Image();
	this.knotImg = new Image();

	var ropeLeft;
	var ropeTop;
	var knotLeft;
	var knotTop;
	
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