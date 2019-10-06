var Game = {};

Game.tps = 40;
Game.tickspace = Math.ceil(1000 / Game.tps);
Game.ticks = 0;

Game.width = 640;
Game.height = 480;

Game.w = Game.width;
Game.h = Game.height;

Game.objects = {};
Game.obj = Game.objects;

Game.object = function(canvas) {
	this.canvas = canvas;
	this.fabrics = [];

	this.x = 0;
	this.y = 0;

	this.xAccel = 0;
	this.yAccel = 0;

	this.xSpeed = 0;
	this.ySpeed = 0;

	this.friction = 0;

	this.postDraw = this.preDraw = function () {};
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

Game.object.prototype.draw = function() {
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
	
	if(this.xAccel !== 0) {
		this.xSpeed += this.xAccel;
	}

	if(this.yAccel !== 0) {
		this.ySpeed += this.yAccel;
	}

	if(this.xSpeed !== 0) {
		this.x += this.xSpeed;
	}

	if(this.ySpeed !== 0) {
		this.y += this.ySpeed;
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