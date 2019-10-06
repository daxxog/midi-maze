r(function() {
	// create a wrapper around native canvas element (with id="c")
	var canvas = new fabric.StaticCanvas('c');

	// handle mouse events on canvas
	var mh = handleMouse('c');

	// create background
	Game.bg = new fabric.Rect({
	  left: 0,
	  top: 0,
	  fill: 'white',
	  width: Game.w,
	  height: Game.h
	});

	// add it to the canvas
	canvas.add(Game.bg);
	
	//create a line and add it
	var line = new fabric.Line([0, 0, 40, 40], {
	  stroke: 'green'
	});

	canvas.add(line);

	// create a ball object
	Game.obj.ball = new Game.object(canvas);

		// debug bounding box
		Game.obj.ball.add(new fabric.Rect({
		  left: Game.obj.ball.x,
		  top: Game.obj.ball.y,
		  fill: 'red',
		  width: 20,
		  height: 20
		}));

		// a circle
		Game.obj.ball.add(new fabric.Circle({
		  left: Game.obj.ball.x,
		  top: Game.obj.ball.y,
		  fill: 'black',
		  radius: 20 / 2
		})).setPreDraw(function() {
			line.set({
				x1: Game.obj.ball.x,
				y1: Game.obj.ball.y,
				x2: mh.mouse.x,
				y2: mh.mouse.y
			});

			this.xAccel = -((line.x1 - line.x2)/200);
			this.yAccel = -((line.y1 - line.y2)/200);
			this.friction = 0.2;
		}).setPostDraw(function() {
			//this.x = 0;
		});

	canvas.on('mouse:move', function(options) {
	    console.log(options.e.layerX, options.e.layerY);
	});

	var tick = function() {
		Game.obj.ball.preDraw();
		Game.obj.ball.draw();
		canvas.renderAll();
		Game.obj.ball.postDraw();
		Game.ticks++;

		setTimeout(tick, Game.tickspace);
	}; setTimeout(tick, Game.tickspace);
});