var canvas;
var context;

var ropeImg;
var knotImg;
var ropeScale = 3;
var knotScale = 1;

var fromTheMiddle = 450;
var canvasWidth = 800;
var canvasHeight = 800;

$(function() {
	canvas = $("#canvas")[0];
	context = canvas.getContext('2d');
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	context.fillStyle= "#000000"; // sets color
	context.fillRect(0, 0, canvasWidth, canvasHeight); // sets top left location points x,y and then width and height
	
	loadImgs();
});

function loadImgs() {
	loadRope();
	loadKnot();
}

function loadRope() {
	this.ropeImg = new Image();

	ropeImg.onload = function() {
		var ropeLeft = (canvasWidth / 2) - (ropeImg.width / ropeScale / 2);
		var ropeTop = -fromTheMiddle;
		context.drawImage(ropeImg, ropeLeft, ropeTop, ropeImg.width / ropeScale, ropeImg.height + (fromTheMiddle * 2) + 4);
	};
	ropeImg.src = '/tow/img/rope.png';
}

function loadKnot() {
	this.knotImg = new Image();

	knotImg.onload = function() {
		var knotLeft = (canvasWidth / 2) - (knotImg.width * knotScale / 2);
		var knotTop = (canvasHeight / 2) - (knotImg.height * knotScale / 2);
		
		context.drawImage(knotImg, knotLeft, knotTop, knotImg.width * knotScale, knotImg.height * knotScale);
	};
	knotImg.src = '/tow/img/knot.png';
}