r(function() {
	var DEBUG = false;

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
	
	//debug accel line
	if(DEBUG) {
		var line = new fabric.Line([0, 0, 40, 40], {
		  stroke: 'green'
		});

		canvas.add(line);
	}

	var aLine = new Game.Line(0,0,0,0);

	// create a ball object
	var ballInit = Game.findID(Maze, 2);

	Game.obj.ball = new Game.object(canvas, {
		x: ballInit.x,
		y: ballInit.y,
		width: 16,
		height: 16
	});

		// debug bounding box
		if(DEBUG) {
			Game.obj.ball.add(new fabric.Rect({
			  left: Game.obj.ball.x,
			  top: Game.obj.ball.y,
			  fill: 'red',
			  width: Game.obj.ball.width,
			  height: Game.obj.ball.height
			}));
		}

		// a circle
		Game.obj.ball.add(new fabric.Circle({
		  left: Game.obj.ball.x,
		  top: Game.obj.ball.y,
		  fill: 'black',
		  radius: Game.obj.ball.width / 2
		})).setPreDraw(function() {
			aLine = new Game.Line(Game.obj.ball.x, Game.obj.ball.y, mh.mouse.x, mh.mouse.y);
			if(DEBUG) {
				line.set(aLine.getSetter());
			}

			this.xAccel = -((aLine.x1 - aLine.x2)/300);
			this.yAccel = -((aLine.y1 - aLine.y2)/300);
			this.friction = 0.2;
		}).setPostDraw(function() {
		});

	// walls
	Game.buildMaze(canvas, Maze.Data);

	var tick = function() {
		Game.obj.ball.preDraw();
		Game.obj.ball.draw();
		canvas.renderAll();
		Game.obj.ball.postDraw();
		Game.ticks++;

		setTimeout(tick, Game.tickspace);
	}; setTimeout(tick, Game.tickspace);
});