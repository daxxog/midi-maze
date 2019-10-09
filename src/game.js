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

Game.wall = function(x1, y1, x2, y2) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	Game.walls[x1+'-'+y1+'_'+x2+'-'+y2] = this;
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

	this.postDraw = this.preDraw = function () {};

	if(typeof attr === 'object') {
		for(var key in attr) {
			this[key] = attr[key];
		}
	}

	//these should be equal when the object is created
	this.xt = this.x;
	this.yt = this.y;
};

Game.object.prototype.add = function(fabric) {
	this.canvas.add(fabric);
	this.fabrics.push(fabric);

	return this;
};

Game.object.prototype.set = function(data) {
	this.fabrics.forEach(function(v,i,a) {
		v.set(data);
	});

	return this;
};

//this stuff handles object movement more than drawing
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

	//check for walls
	var intersections = [],
		cwall = {};
	for(var wall in Game.walls) {
		cwall = Game.walls[wall];

		intersections.push(Game.intersects(this.x,this.y,this.xt,this.yt,cwall.x1,cwall.y1,cwall.x2,cwall.y2));

		intersections.push(Game.intersects(this.x +this.width,this.y,
										   this.xt+this.width,this.yt,cwall.x1,cwall.y1,cwall.x2,cwall.y2));

		intersections.push(Game.intersects(this.x,this.y  +this.height,
										   this.xt,this.yt+this.height,cwall.x1,cwall.y1,cwall.x2,cwall.y2));

		intersections.push(Game.intersects(this.x +this.width,this.y +this.height,
										   this.xt+this.width,this.yt+this.height,cwall.x1,cwall.y1,cwall.x2,cwall.y2));
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

Game.object.prototype.setPreDraw = function(fx) {
	this.preDraw = fx;

	return this;
};

Game.object.prototype.setPostDraw = function(fx) {
	this.postDraw = fx;

	return this;
};