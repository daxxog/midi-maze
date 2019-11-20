var Game = {};

Game.tps = 40;
Game.tickspace = Math.ceil(1000 / Game.tps);
Game.ticks = 0;

Game.width = 640;
Game.height = 480;

Game.w = Game.width;
Game.h = Game.height;

Game.objects = {};
Game.walls = {};
Game.obj = Game.objects;
Game.obj.walls = [];
Game.events = [];
Game.level = 0;

Game.addEvent = function(event) {
	Game.events.push(event);
};

Game.processEvents = function() {
	if(Game.events.length > 0) {
		Game.events.pop()();
	}
};

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
// https://stackoverflow.com/a/24392281
Game.intersects = function(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

//remove everything from the Game window
Game.clear = function() {
	for(var name in Game.obj) {
		if(name !== 'walls') {
			Game.obj[name].destroy();
		}
	}

	Game.obj.walls.forEach(function(wall) {
		wall.destroy();
	});

	Game.objects = {};
	Game.obj = Game.objects;
	Game.obj.walls = [];
	Game.walls = {};
};

//Line class, formed by two points
//used by buildWall function
Game.Line = function(x1,y1,x2,y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.slope = (y2 - y1) / (x2 - x1),
	this.intercept = y1 - this.slope * x1;
};

Game.Line.prototype.y = function(x, infSelect) {
	if(Math.abs(this.slope) === Infinity) {
		return infSelect ? this.y1 : this.y2;
	} else {
		return this.slope*x + this.intercept;
	}
};

Game.Line.prototype.parallel = function(offset) {
	var newLine;

	if(Math.abs(this.slope) === Infinity) {
		newLine = new Game.Line(this.x1 + offset, this.y1, this.x2 + offset, this.y2);
	} else {
		newLine = new Game.Line(this.x1,this.y1,this.x2,this.y2);
		newLine.intercept += offset;
	}

	return newLine;
};

Game.Line.prototype.getSetter = function() {
	return {
		x1: this.x1,
		y1: this.y1,
		x2: this.x2,
		y2: this.y2
	}
};

//gets all the the points between two points by plugging integers into a Y slope equation of the line
//note, the points must be in least to greatest order for this to work!
Game.pointsBetween = function(x1,y1,x2,y2,forceRange) {
	var slope = (y2 - y1) / (x2 - x1),
		intercept = y1 - slope * x1,
		range = (typeof forceRange === 'number') ? forceRange : Math.abs(x2 - x1),
		points = [],
		swap = {};

	if(Math.abs(slope) === Infinity) { //slope "magic"
		swap = Game.pointsBetween(y1,x1,y2,x2,forceRange); //notice we are swaping X and Y !

		swap.points = swap.points.map(function(v) {
				return v.reverse(); //and swaping back !
		});

		return swap;
	} else {
		for(var i = 0; i<=range; i++) {
			points.push([x1 + i, ((x1 + i) * slope) + intercept]);
		}

		return {
			points: points,
			slope: slope,
			intercept: intercept,
			range: range
		};
	}
};

//runs Game.pointsBetween twice and gives us a pretty Object Array format
Game.pointsBetween2 = function(a,b,c,d,p,q,r,s) {
	var p1 = Game.pointsBetween(a,b,c,d),
		p2 = Game.pointsBetween(p,q,r,s,p1.range);

	return p1.points.map(function(v,i) {
		return {
			x: v[0],
			y: v[1],
			xt: p2.points[i][0],
			yt: p2.points[i][1]
		}
	});
};

Game.buildMaze = function(canvas, _maze) {
	Game.findWalls(_maze).map(function(v) {
		return Game.buildWall(_maze, v[0] * 32, v[1] * 32, v[2] * 32, v[3] * 32);
	}).flat().forEach(function(v) {
		var wallID = Game.obj.walls.push(new Game.object(canvas)) - 1;

		Game.obj.walls[wallID].add(new fabric.Line(v, {
			stroke: 'black'
		}));

		new Game.wall(v[0], v[1], v[2], v[3])
	});
};

Game.findWalls = function(_maze) {
	var skipa = {},
		skipb = {},
		skipc = {},
		skipd = {},
		lines = [];

	_maze.Data.forEach(function(v, i, a) {
		v.forEach(function(w, j, b) {
			var testa = 1, //horizontal
				testb = 1, //vertical
				testc = 1, //diagonal \
				testd = 1; //diagonal /

			if((w === 1) && (skipa[[i,j].join('-')] !== true)) {

				//detect horizontal walls
				while(b[j + testa] === w) {
					skipa[[i,j + testa].join('-')] = true;
					testa++;
				}

				//push found horizontal walls
				if(testa > 2) {
					lines.push([j, i, j + testa, i]);
				}
			}

			if((w === 1) && (skipb[[i,j].join('-')] !== true)) {
				//detect vertical walls
				while((a.length > i + testb) && (a[i + testb][j] === w)) {
					skipb[[i + testb,j].join('-')] = true;
					testb++;
				}

				//push found vertical walls
				if(testb > 2) {
					lines.push([j, i, j, i + testb]);
				}
			}

			if((w === 1) && (skipc[[i,j].join('-')] !== true)) {
				//detect diagonal \ walls
				while((a.length > i + testc) && (a[i + testc][j + testc] === w)) {
					skipc[[i + testc,j + testc].join('-')] = true;
					testc++;
				}

				//push found diagonal \ walls
				if(testc > 2) {
					lines.push([j, i, j + testc, i + testc]);
				}
			}

			if((w === 1) && (skipd[[i,j].join('-')] !== true)) {
				//detect diagonal / walls
				while((a.length > i + testd) && (a[i + testd][j - testd] === w)) {
					skipd[[i + testd,j - testd].join('-')] = true;
					testd++;
				}

				//push found diagonal / walls
				if(testd > 2) {
					lines.push([j, i, j - testd, i + testd]);
				}
			}
		});
	});

	return lines;
};

Game.findID = function(maze, objID) {
	var found;

	maze.Data.forEach(function(v, i) {
		v.forEach(function(w, j) {
			if(w === objID) {
				found = {
					x: j * maze.Scale,
					y: i * maze.Scale
				};
			}
		})
	});

	return found;
};

Game.findIDs = function(maze, objID) {
	return maze.Data.map(function(v, i) {
		return v.map(function(w, j) {
			if(w === objID) {
				return {
					x: j * maze.Scale,
					y: i * maze.Scale
				};
			}
		}).filter(function (el) {
			return el != null;
		});
	}).filter(function (el) {
		return el.length !== 0;
	}).flat();
};

Game.buildWall = function(mazeData, orix, oriy, tox, toy) { //turn a line into a boxed wall
	var wallz = [],
		baseLine = new Game.Line(orix, oriy, tox, toy),
		thickness = mazeData.Scale;
		pLine1 = baseLine,
		pLine2 = baseLine.parallel(thickness);

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

Game.wall = function(x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	Game.walls[x1+'-'+y1+'_'+x2+'-'+y2] = this;
};

Game.findObjectNameById = function(objID) {
	for(var objName in Game.obj) {
		if(Game.obj[objName].id === objID) {
			return objName;
		}
	}
};

Game.findObjectByID = function(objID) {
	return Game.obj[Game.findObjectNameById(objID)];
};

Game.object = function(canvas, attr) {
	this.canvas = canvas;
	this.fabrics = [];

	this.x = 0;
	this.y = 0;

	this.width = 0; //bounding box width
	this.height = 0; //bounding box height

	this.xAccel = 0;
	this.yAccel = 0;

	this.xSpeed = 0;
	this.ySpeed = 0;

	this.friction = 0;

	this.solid = false;

	this.postDraw = this.preDraw = function () {};
	this.doOnIntersect = {};

	//unique object id
	this.id = (+new Date()) + '-' + Math.floor(Math.random() * 2048);

	if(typeof attr === 'object') {
		for(var key in attr) {
			this[key] = attr[key];
		}
	}

	//these should be equal when the object is created
	this.xt = this.x;
	this.yt = this.y;

	this.save(); //saves the init
};

Game.object.prototype.save= function() {
	var save = {};

	for(var key in this) {
		save[key] = this[key];
	}

	this.state = save;

	return this;
};

Game.object.prototype.reset = function() {
	for(var key in this.state) {
		this[key] = this.state[key];
	}

	return this.save();
};

Game.object.prototype.add = function(fabric) {
	this.canvas.add(fabric);
	this.fabrics.push(fabric);

	return this;
};

//removes the sprite from the fabric
Game.object.prototype.destroy = function() {
	var that = this;

	this.fabrics.forEach(function(fabric) {
		that.canvas.remove(fabric);
	});

	return this;
};

Game.object.prototype.set = function(data) {
	this.fabrics.forEach(function(v,i,a) {
		v.set(data);
	});

	return this;
};

//returns if the object has a pending motion test
Game.object.prototype.motionPending = function() {
	return (this.x !== this.xt) || (this.y !== this.yt);
};

//return the bounding box for the object
Game.object.prototype.getBounds = function() {
	var allPoints = [],
		pushPoints = function(v) {
			allPoints.push(v);
		};

	if(this.motionPending()) {
		//north wall of bounding box
		Game.pointsBetween2(this.x,  this.y,  this.x  + this.width, this.y,
							this.xt, this.yt, this.xt + this.width, this.yt
		).forEach(pushPoints);

		//south wall of bounding box
		Game.pointsBetween2(this.x,  this.y  + this.height, this.x  + this.width, this.y  + this.height,
							this.xt, this.yt + this.height, this.xt + this.width, this.yt + this.height
		).forEach(pushPoints);

		//east wall of bounding box
		Game.pointsBetween2(this.x  + this.width,  this.y, this.x  + this.width,  this.y  + this.height,
							this.xt + this.width,  this.yt, this.xt + this.width, this.yt + this.height
		).forEach(pushPoints);

		//west wall of bounding box
		Game.pointsBetween2(this.x,  this.y, this.x,   this.y  + this.height,
							this.xt, this.yt, this.xt, this.yt + this.height
		).forEach(pushPoints);
	} else {
		//north wall of bounding box
		allPoints.push({
			x: this.x,
			y: this.y,
			xt: this.x + this.width,
			yt: this.y
		});

		//south wall of bounding box
		allPoints.push({
			x: this.x,
			y: this.y + this.height,
			xt: this.x + this.width,
			yt: this.y + this.height
		});

		//east wall of bounding box
		allPoints.push({
			x: this.x + this.width,
			y: this.y,
			xt: this.x + this.width,
			yt: this.y + this.height
		});

		//west wall of bounding box
		allPoints.push({
			x: this.x,
			y: this.y,
			xt: this.x,
			yt: this.y + this.height
		});
	}

	return allPoints;
};

//this stuff handles object movement / collisions more than drawing
Game.object.prototype.draw = function() {

	//make the object slow down
	if(this.friction !== 0) {
		if(this.xSpeed > 0) {
			this.xSpeed -= this.friction;
		}

		if(this.ySpeed > 0) {
			this.ySpeed -= this.friction;
		}

		if(this.xSpeed < 0) {
			this.xSpeed += this.friction;
		}

		if(this.ySpeed < 0) {
			this.ySpeed += this.friction;
		}
	}
	
	//make the object speed up in relation to acceleration
	if(this.xAccel !== 0) {
		this.xSpeed += this.xAccel;
	}
	if(this.yAccel !== 0) {
		this.ySpeed += this.yAccel;
	}

	//try to move the object in relation to speed, we test for walls after this
	if(this.xSpeed !== 0) {
		this.xt += this.xSpeed;
	}
	if(this.ySpeed !== 0) {
		this.yt += this.ySpeed;
	}
	
	//solid collision handler
	var intersections = [];

	//check for other objects
	for(var objID in this.doOnIntersect) {
		var oIntersects = [],
			checkObj = function(w) {
				return function(v) {
					oIntersects.push(Game.intersects(v.x,v.y,v.xt,v.yt,w.x,w.y,w.xt,w.yt));
				}
			},
			didIntersect = false,
			objName = Game.findObjectNameById(objID);

		if(typeof Game.obj[objName] !== 'undefined') {
			this.getBounds().forEach(function(v) {
				Game.obj[objName].getBounds().forEach(checkObj(v));
			});

			if(oIntersects.length > 0) {
				didIntersect = oIntersects.reduce(function(a,c) {
					return a || c;
				});
			}

			if(didIntersect) {
				this.doOnIntersect[objID]();
			}

			try{
				if((Game.obj[objName].solid === true) && (this.solid === true)) {
					intersections.push(didIntersect);
				}
			} catch(e) {
				console.log(objName, Game.obj);
				console.log(e);
			}
		}
	}

	//check for walls
	var cwall = {},
		checkWall = function(v) {
			intersections.push(Game.intersects(v.x,v.y,v.xt,v.yt,cwall.x1,cwall.y1,cwall.x2,cwall.y2));
		};

	for(var wall in Game.walls) {
		cwall = Game.walls[wall];

		this.getBounds().forEach(checkWall);
	}

	//are we going to collide with any walls?
	if(intersections.reduce(function(a,c) {
		return a || c;
	})) {
		//reset the x and y tries, because we tried to go through a wall
		this.xt = this.x;
		this.yt = this.y;

		//and reset speed
		this.xSpeed = 0;
		this.ySpeed = 0;

	//if we aren't, then actually move the object
	} else {
		this.x = this.xt;
		this.y = this.yt;
	}

	this.set({ left: Math.round(this.x), top: Math.round(this.y) });
};

Game.object.prototype.onIntersect = function(objectWith, fx) {
	//add the event to both objects in question (self and other)
	this.doOnIntersect[objectWith.id] = fx;
	objectWith.doOnIntersect[this.id] = fx;

	return this;
};

Game.object.prototype.setPreDraw = function(fx) {
	this.preDraw = fx;

	return this;
};

Game.object.prototype.setPostDraw = function(fx) {
	this.postDraw = fx;

	return this;
};