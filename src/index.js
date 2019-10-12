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
		x: 300,
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

	var buildWall = function(orix, oriy, tox, toy) { //turn a line into a boxed wall
		var wallz = [],
			baseLine = new Game.Line(orix, oriy, tox, toy),
			thickness = 5;
			pLine1 = baseLine.parallel(thickness),
			pLine2 = baseLine.parallel(-1*thickness);

		//original line
		//wallz.push([orix, oriy, tox, toy]);

		//pLine1 (top)
		wallz.push([pLine1.x1, pLine1.y(pLine1.x1), pLine1.x2, pLine1.y(pLine1.x2, true)]);

		//pLine2 (bottom)
		wallz.push([pLine2.x1, pLine2.y(pLine2.x1), pLine2.x2, pLine2.y(pLine2.x2, true)]);

		//edge1
		wallz.push([pLine1.x1, pLine1.y(pLine1.x1, true), pLine2.x1, pLine2.y(pLine2.x1, true)]);

		//edge2
		wallz.push([pLine1.x2, pLine1.y(pLine1.x2), pLine2.x2, pLine2.y(pLine2.x2)]);

		return wallz;
	};

	// walls
	[
		buildWall(100,100,100,200),
		buildWall(100,100,200,100),
		buildWall(200,200,100,300),
		buildWall(300,300,350,350),
		buildWall(200,200,400,200),
	].collapse().forEach(function(v) {
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