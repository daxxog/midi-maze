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
	Game.obj.ball = new Game.object(canvas, {
		x: 200,
		y: 100,
		width: 20,
		height: 20
	});

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

			this.xAccel = -((line.x1 - line.x2)/300);
			this.yAccel = -((line.y1 - line.y2)/300);
			this.friction = 0.2;
		}).setPostDraw(function() {
			//this.x = 0;
		});

	var buildWall = function(ori) { //working on, turn a line into a boxed in wall
		var wallz = [];
	};

	// walls
	[
		[100, 100, 110, 100],
		[100, 100, 100, 200],
		[110, 100, 110, 200],
		[100, 200, 110, 200],
	].forEach(function(v) {
		var wallID = Game.obj.walls.push(new Game.object(canvas)) - 1;

		Game.obj.walls[wallID].add(new fabric.Line(v, {
			stroke: 'black'
		}));

		new Game.wall(v[0], v[1], v[2], v[3])
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