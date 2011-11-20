
GO = function() { }

GO.c1 = '#73626E'
GO.c2 = '#B38184'
GO.c3 = '#F0B49E'
GO.c4 = '#F7E4BE'

GO.start = function()
{
	this.canvas = document.getElementById('canvas');
	if (!this.canvas || (this.canvas && !this.canvas.getContext)) {
		return false;
	}

	this.ctx = this.canvas.getContext('2d');

	this.reset();

	GO.isMobile = navigator.userAgent && navigator.userAgent.indexOf(' N900') != -1

	document.body.addEventListener('mousemove', function(e) {
		GO.mouseX = e.clientX - GO.canvas.offsetLeft
		GO.mouseY = e.clientY - GO.canvas.offsetTop
	}, true)

	document.body.addEventListener('mouseup', function(e) {
		GO.clicked = true
	}, true)

	document.body.addEventListener('touchstart', function(e) {
		GO.isMobile = true
		GO.mouseX = e.touches[0].clientX - GO.canvas.offsetLeft
		GO.mouseY = e.touches[0].clientY - GO.canvas.offsetTop
	}, true)

	window.addEventListener('orientationchange', function(e) {
		GO.reset()
	}, true);

	document.addEventListener('keydown', function(e) {
		var code = e.keyCode || e.charCode || 0
		var c = String.fromCharCode(code)

		if (c.toLowerCase() == 'a') {
			document.location.href = '/pubkey.txt';
		}
	}, true);

	// requestAnim shim layer by Paul Irish
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame || 
			window.oRequestAnimationFrame || 
			window.msRequestAnimationFrame || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
		}
	)();
  
	this.animate();
}

GO.animate = function()
{
	window.requestAnimFrame(function() {
		GO.animate();
	}, this);

	this.loop();
}

GO.reset = function()
{
	this.width = this.canvas.width
	this.height = this.canvas.height
	this.mouseX = 0
	this.mouseY = 0
	this.delta = 0;
	this.msg = '';
	this.sprites = [];

	this.t = new GO.Text
	this.t.c = this.c1
	this.t.t = ''
	this.t.x = this.width / 2;
	this.t.y = this.height / 2 + 60;
	this.pushSprite(this.t)
	
	this.createCircle1()
}

GO.createCircle1 = function()
{
	var c = new GO.Circle
	c.x = this.width / 2 - 100;
	c.y = this.height / 2 - 20;
	c.c = this.c1
	c.ontouch = function() { GO.track('c1a'); GO.t.set('who is this?') }
	c.onclick = function() { GO.track('c1b'); GO.t.set('sebastian volland') }
	c.onready = this.createCircle2
	GO.pushSprite(c)
	this.circle1 = c
}

GO.createCircle2 = function()
{
	var c = new GO.Circle
	c.x = this.width / 2;
	c.y = this.height / 2 - 20;
	c.c = this.c2
	c.ontouch = function() { GO.track('c2a'); GO.t.set('contact?') }
	c.onclick = function() { GO.track('c2b'); GO.t.set('seb at baunz dot net') }
	c.onready = this.createCircle3
	GO.pushSprite(c)
	this.circle2 = c
}

GO.createCircle3 = function()
{
	var c = new GO.Circle
	c.x = this.width / 2 + 100;
	c.y = this.height / 2 - 20;
	c.c = this.c3
	c.ontouch = function() { GO.track('c3a'); GO.t.set('meta') }
	c.onclick = function() {
		GO.track('c3b')
		var el = document.getElementById('meta')
		el.className = el.className == 'animate' ? '' : 'animate';
		el.style.left = 0;
	}
	c.onready = function() {
		var el = document.getElementById('p4')
		if (el) {
			el.style.display = 'block'
		}
	}
	this.pushSprite(c)
	this.circle3 = c
}

GO.loop = function()
{
	var date = new Date;
	var now = date.getTime();
	if (this.oldtime) {
		this.delta = (now - this.oldtime) / 1000;
	}
	this.oldtime = now;

	this.ctx.clearRect(0, 0, this.width, this.height);

	/* text msg bottom left */
	if (this.msg) {
		this.ctx.fillStyle = 'white';
		this.ctx.font = '20px';
		this.ctx.fillText(this.msg, 20, this.height - 30);
	}

	for (var i = this.sprites.length - 1; i >= 0; i--) {
		var s = this.sprites[i];

		if (!s.immortal && (s.dead || i >= this.maxSprites)) {
			this.sprites.splice(i, 1);
			continue;
		}

		if (s.process) {
			s.process();
		}
	}
	
	if (this.circle1 && this.circle2 && this.circle3 && !this.circle1.touching && !this.circle2.touching && !this.circle3.touching) {
		this.t.set('')
	}

	this.clicked = false;
}

GO.pushSprite = function(sprite)
{
	this.sprites.push(sprite);
}

GO.Circle = function()
{
	this.x = 0;
	this.y = 0;
	this.s = 0;
	this.maxsize = 40
	this.c = 'black'
	this.currentColor = this.c
	this.touchCount = 0
}

GO.Circle.prototype.process = function()
{
	if (this.s <= this.maxsize) {
		this.s += GO.delta * 100
		if (this.s >= this.maxsize) {
			this.s = this.maxsize
		}
	}

	if (this.s >= this.maxsize) {
		if (this.onready) {
			this.onready.call(GO);
			this.onready = false;
		}
	}

	GO.ctx.lineWidth = 4
	GO.ctx.fillStyle = this.currentColor
	GO.ctx.beginPath()
	GO.ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2, true)
	GO.ctx.fill()
	this.touching = Math.sqrt(Math.pow(GO.mouseX - this.x, 2) + Math.pow(GO.mouseY - this.y, 2)) <= this.maxsize
	GO.ctx.closePath()

	if (this.touching) {

		if (GO.clicked) {
			this.touchCount++

			if (this.touchCount >= (GO.isMobile ? 2 : 1)) {
				this.s = this.maxsize - 20
				
				if (this.onclick) {
					this.onclick()
				}
			}
		}

		if (!this.touched && this.ontouch) {
			this.ontouch()
			this.touched = true
			this.currentColor = GO.c4
		}
	
	} else {
		this.currentColor = this.c
		this.touched = false
		this.touchCount = 0
	}
}

GO.Text = function()
{
	this.x = 0
	this.y = 0
	this.t = ''
	this.at = ''
	this.p = 0
}

GO.Text.prototype.set = function(txt)
{
	this.t = txt
	this.at = ''
	this.p = 0
}

GO.Text.prototype.process = function()
{
	if (this.p < this.t.length) {
		this.p += GO.delta * 60
	}

	this.at = this.t.substr(0, Math.round(this.p))

	GO.ctx.fillStyle = this.c;
	GO.ctx.font = 'bold 24px Ubuntu';
	GO.ctx.fillText(this.at, this.x - (GO.ctx.measureText(this.at).width / 2), this.y);
}

GO.track = function(t)
{
	var i = new Image()
	i.src = 'track.gif?'+ Math.floor(Math.random() * 100000) +'&m=' + encodeURIComponent(t)
}

GO.start()

