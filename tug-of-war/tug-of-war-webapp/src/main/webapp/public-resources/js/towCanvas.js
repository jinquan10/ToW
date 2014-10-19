var canvas;
var context;

var ropeImg;
var knotImg;

$(function(){
	canvas = $("#canvas")[0];
	context = canvas.getContext('2d');
	
	loadImgs();
});

function loadImgs() {
	ropeImg = new Image();

	ropeImg.onload = function() {
      context.drawImage(ropeImg, 69, 50);
    };
    ropeImg.src = '/tow/img/rope.png';
}