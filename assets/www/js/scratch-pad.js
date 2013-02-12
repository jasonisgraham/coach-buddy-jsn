$(document).ready(function() {
var myCanvas = document.getElementById("soccer-field");
	var ctx = myCanvas.getContext("2d");
	
	var drawSquare = function(x0, y0) {
		if (!x0) x0 = 0;		
		if (!y0)y0 = 0;
		
		ctx.fillRect(20+x0,20+y0,100,100);
		ctx.strokeRect(20+x0,20+y0,100,100);
		ctx.clearRect(45+x0,45+y0,50,50);
	};
	var drawTriangle = function(x0,y0) {
		if (!x0) x0 = 0;		
		if (!y0)y0 = 0;
		ctx.beginPath();
		ctx.moveTo(75+x0,0+y0);
		ctx.lineTo(150+x0,100+y0);
		ctx.lineTo(0+x0,100+y0);
		ctx.closePath();
		ctx.fill();		
	};
	
	var drawDiamond = function(x0,y0) {
		if (!x0) x0 = 0;		
		if (!y0)y0 = 0;
		ctx.beginPath();
		ctx.moveTo(75+x0,0+y0);
		ctx.lineTo(150+x0,100+y0);
		ctx.lineTo(75+x0,200+y0);
		ctx.lineTo(0+x0,100+y0);
		ctx.fillStyle = "rgb(102,204,0)";
		ctx.lineWidth = 1;
		ctx.strokeStyle = "rgb(0,50,200)";
		
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		
	}
	
//	drawSquare();
//	drawTriangle(250,10);
//	drawDiamond(100,150);
//	SoccerField.drawField();
});