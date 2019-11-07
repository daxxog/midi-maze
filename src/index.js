r(function() {
	var DEBUG = false,
		alertOne = true;

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
		height: 16,
		solid: true
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
		}).save();

	// create an objective object
	var objectiveInit = Game.findID(Maze, 3);

	Game.obj.objective = new Game.object(canvas, {
		x: objectiveInit.x,
		y: objectiveInit.y,
		width: 16,
		height: 16,
		solid: true
	});

		// debug bounding box
		if(DEBUG) {
			Game.obj.objective.add(new fabric.Rect({
			  left: Game.obj.objective.x,
			  top: Game.obj.objective.y,
			  fill: 'red',
			  width: Game.obj.objective.width,
			  height: Game.obj.objective.height
			}));
		}

	Game.obj.objective.add(new fabric.Circle({
		left: Game.obj.objective.x,
		top: Game.obj.objective.y,
		fill: 'green',
		radius: Game.obj.objective.width / 2
	})).onIntersect(Game.obj.ball, function() {
		if(alertOne) {
			alert('good job');

			alertOne = false;
		}
	});

	// create an hazard object
	Game.findIDs(Maze, 4).forEach(function(hazardInit, i) {
		Game.obj["hazard_" + i] = new Game.object(canvas, {
			x: hazardInit.x,
			y: hazardInit.y,
			width: 32,
			height: 32,
			solid: true
		});

			// debug bounding box
			if(DEBUG) {
				Game.obj["hazard_" + i].add(new fabric.Rect({
				  left: Game.obj["hazard_" + i].x,
				  top: Game.obj["hazard_" + i].y,
				  fill: 'green',
				  width: Game.obj["hazard_" + i].width,
				  height: Game.obj["hazard_" + i].height
				}));
			}

		Game.obj["hazard_" + i].add(new fabric.Circle({
			left: Game.obj["hazard_" + i].x,
			top: Game.obj["hazard_" + i].y,
			fill: 'red',
			radius: Game.obj["hazard_" + i].width / 2
		})).onIntersect(Game.obj.ball, function() {
			Game.obj.ball.reset();
		});
	});

	// walls
	Game.buildMaze(canvas, Maze.Data);

	var tick = function() {
		for(var objName in Game.obj) {
			if(objName !== 'walls') {
				Game.obj[objName].preDraw();
				Game.obj[objName].draw();
			}
		}

		canvas.renderAll();

		for(var objName in Game.obj) {
			if(objName !== 'walls') {
				Game.obj[objName].postDraw();
			}
		}

		Game.ticks++;

		setTimeout(tick, Game.tickspace);
	}; setTimeout(tick, Game.tickspace);
});