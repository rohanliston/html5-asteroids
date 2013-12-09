// Enables function overriding.
Function.prototype.override = function(func)
{
    var superFunction = this;
    return function() {
        this.superFunction = superFunction;
        return func.apply(this, arguments);
    };
}

var dx = 0.5;
var dy = 0.5;
var x = 150;
var y = 100;

// Ship ===================
var playerShip;

// Input ==================
var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;

// Asteroids ==============
var numAsteroids = 20;
var asteroids = [];
var debris = [];
var missiles = [];

// Effects ================
var drawFlash = false;

// Timing =================
var startTime = new Date().getTime();
var lastUpdateTime = new Date().getTime();
var fps = 0;
var fpsFilter = 50;

// Scoring
var lives = 3;
var score = 0;
var gameWon = false;

// Initialises the game and creates player/asteroids.
function init()
{
    startTime = new Date().getTime();
    asteroids = [];
    debris = [];
    missiles = [];
    playerShip = null;
    lives = 3;
    score = 0;
    livesText.text = "LIVES: " + lives;
    gameOverText.visible = false;
    respawnText.visible = false;

    spawnPlayer();

    // Create asteroids.
    for (var i = 0; i < numAsteroids; i++)
    {
        spawnAsteroid();
    }
}

function spawnPlayer()
{
    if(lives === 0)
        return;

    respawnText.visible = false;

    // Create player ship.
    playerShip = new Ship(
        new Point(canvas.width / 2, canvas.height / 2),
        0.0,
        new Point(0, 0),
        0.1,
        10
    )
}

function spawnAsteroid()
{
    var direction = Math.random() * 2*Math.PI;
    var speed = Math.random();

    var location = new Point(Math.random() * canvas.width, Math.random() * canvas.height);
    var velocity = new Point(speed * Math.cos(direction), speed * Math.sin(direction));
    var rotation = Math.random();

    asteroids.push(new Asteroid(location, rotation, velocity));
}

// Processes player key presses for ship movement.
function processInput()
{
    if(playerShip !== null)
    {
        // Acceleration
        if(upPressed)
            playerShip.accelerate();
        else
            playerShip.stopAccelerating();

        // Movement
        if(leftPressed)
            playerShip.turn(-1);

        if(rightPressed)
            playerShip.turn(1);

        if(spacePressed)
            playerShip.shoot();
    }
}

// Called each tick to process input, movement, collisions, etc.
function update()
{
    // Calculate deltatime/fps.
    var currentTime = new Date().getTime();
    var deltaTime = currentTime - lastUpdateTime;
    var thisFrameFPS = 1000 / deltaTime;
    fps += (thisFrameFPS - fps) / fpsFilter;
    fpsText.text = "FPS: " + fps.toPrecision(2);
    lastUpdateTime = currentTime;

    // Update player ship.
    processInput();

    if(playerShip !== null)
        playerShip.update();

    for(var i = 0; i < missiles.length; i++)
    {
        missiles[i].update(deltaTime);
    }

    // Update asteroids.
    for(i = asteroids.length-1; i >= 0; --i)
    {
        asteroids[i].update(deltaTime);
        if(asteroids[i].broken)
            asteroids.splice(i, 1);
    }

    // Update asteroid chunks.
    for(i = debris.length-1; i >= 0; --i)
    {
        debris[i].update(deltaTime);

        if(debris[i].isDead())
            debris.splice(i, 1);
    }

    detectCollisions();

    score = Math.max(score, 0);
    scoreText.text = "SCORE: " + score;

    gameWonText.visible = (asteroids.length === 0 && debris.length === 0 && lives > 0);
}

function detectCollisions()
{
    if(playerShip !== null)
    {
        // Check asteroids
        for(var i = asteroids.length-1; i >= 0; i--)
        {
            // Test against player ship
            if(asteroids[i].isCollidingWith(playerShip))
            {
                playerShip.explode();
                playerShip = null;
            }
            else
            {
                // Test against missiles
                for(var j = missiles.length-1; j >= 0; j--)
                {
                    if(asteroids[i].isCollidingWith(missiles[j]))
                    {
                        asteroids[i].breakApart();
                        missiles.splice(j, 1);
                    }
                }
            }
        }

        // Check debris
        for(i = debris.length - 1; i >= 0; i--)
        {
            if(debris[i].isCollidingWith(playerShip))
            {
                playerShip.explode();
                playerShip = null;
            }
        }
    }
}

// Draws all objects to the canvas.
function draw(context)
{
    // Clear the canvas.
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(drawFlash)
    {
        context.save();
        context.fillStyle = "#445544";
        context.strokeStyle = "#445544";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        drawFlash = false;
    }
    else
    {
        // Set drawing colours.
        context.fillStyle = "BLACK";
        context.strokeStyle = "GREEN";

        if(playerShip !== null)
        {
            // Draw the ship and bullets.
            playerShip.draw(context);
            playerShip.drawMissiles(context);
        }

        // Draw the asteroids.
        for(var i = 0; i < asteroids.length; i++)
        {
            asteroids[i].draw(context);
        }

        for(i = 0; i < debris.length; i++)
        {
            debris[i].draw(context);
        }
    }
}

// Point class
function Point(x, y)
{
    this.x = x;
    this.y = y;
}

// Rectangle class.
function Rectangle(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = function() { return this.x; }
    this.right = function() { return this.x + this.width; }
    this.top = function() { return this.y; }
    this.bottom = function() { return this.y + this.height; }

    this.topLeft = function() { return new Point(this.x, this.y); }
    this.topRight = function() { return new Point(this.x + this.width, this.y); }
    this.bottomRight = function() { return new Point(this.x + this.width, this.y + this.height); }
    this.bottomLeft = function() { return new Point(this.x, this.y + this.height); }

    this.centre = function() { return new Point(this.x + this.width / 2, this.y + this.height / 2); }
}

function GameObject(geometry, location, rotation, strokeColour, fillColour, boundingBoxWidth, boundingBoxHeight)
{
    this.objectName = "GameObject";
    this.geometry = geometry;
    this.location = location;
    this.rotation = rotation;
    this.strokeColour = strokeColour;
    this.fillColour = fillColour;

    this.boundingBox = new Rectangle(location.x - (boundingBoxWidth / 2), location.y - (boundingBoxHeight / 2), boundingBoxWidth, boundingBoxHeight)

    // Updates the object's state. Should be overridden in sub-objects.
    this.update = function(deltaTime) {
        this.boundingBox.x = this.location.x - (this.boundingBox.width / 2);
        this.boundingBox.y = this.location.y - (this.boundingBox.height / 2);
    }

    // Wraps the object around the edges of the canvas.
    this.wrap = function() {
        if(this.location.x > canvas.width)
            this.location.x = 0;
        else if(this.location.x < 0)
            this.location.x = canvas.width;

        if(this.location.y > canvas.height)
            this.location.y = 0;
        else if(this.location.y < 0)
            this.location.y = canvas.height;
    }

    this.isCollidingWith = function(otherObject) {
        if(otherObject === null) return false;
        if(this.boundingBox.left() > otherObject.boundingBox.right()) return false;
        if(this.boundingBox.right() < otherObject.boundingBox.left()) return false;
        if(this.boundingBox.top() > otherObject.boundingBox.bottom()) return false;
        if(this.boundingBox.bottom() < otherObject.boundingBox.top()) return false;
        return true;
    }

    // Draws the object to the screen.
    this.draw = function(context) {
        // Save initial context transformation.
        context.save();

        // Translate to the object's origin and align to its rotation.
        context.translate(this.location.x, this.location.y);
        context.rotate(this.rotation);

        // Set colour.
        context.strokeStyle = this.strokeColour;
        context.fillStyle = this.fillColour;

        // Draw geometry.
        context.beginPath();
        for(var i = 0; i < this.geometry.length; i++)
        {
            context.lineTo(this.geometry[i].x, this.geometry[i].y);
        }
        context.closePath();
        context.fill();
        context.stroke();

        // Restore context.
        context.restore();

        // Uncomment the following lines to view bounding boxes.
        // context.strokeStyle = "PURPLE";
        // context.strokeRect(this.boundingBox.x, this.boundingBox.y, this.boundingBox.width, this.boundingBox.height);
    };
}

function MovingGameObject(geometry, location, rotation, velocity, rotationRate, strokeColour, fillColour, boundingBoxWidth, boundingBoxHeight)
{
    this.objectName = "MovingGameObject";

    // Inherit from GameObject.
    GameObject.call(this, geometry, location, rotation, strokeColour, fillColour, boundingBoxWidth, boundingBoxHeight);

    this.velocity = velocity;
    this.rotationRate = rotationRate;

    this.update = this.update.override(function(deltaTime) {
        this.superFunction();

        this.location.x += this.velocity.x;
        this.location.y += this.velocity.y;

        this.rotation += this.rotationRate;

        // Wrap around the edges of the canvas.
        this.wrap();
    });
}

// Asteroid class
function Asteroid(location, rotation, velocity)
{
    this.objectName = "Asteroid";

    this.broken = false;

    var geometry = [
        new Point(-15,   0),
        new Point(-11, -13),
        new Point(  3, -16),
        new Point(  3,  -9),
        new Point( 11, -11),
        new Point( 11,  -3),
        new Point(  7,  -1),
        new Point( 10,   6),
        new Point(  4,  13),
        new Point( -9,   9),
        new Point(-15,   0)
    ];

    var rotationRate = Math.random() > 0.5 ? Math.random() * 0.001 : Math.random() * -0.001;
    MovingGameObject.call(this, geometry, location, rotation, velocity, rotationRate, "GREY", "BLACK", 30, 30);

    this.breakApart = function() {
        for(var i = 0; i < 5; i++)
        {
            debris.push(new Debris(new Point(this.location.x, this.location.y), Math.random() * 2*Math.PI, Math.random()*5, "GREY"));
        }
        this.broken = true;
        drawFlash = true;
        score += 100;
    }

    this.update = this.update.override(function(deltaTime) {
        if(!this.broken)
            this.superFunction(deltaTime);
    });

    this.draw = this.draw.override(function(context) {
        if(!this.broken)
            this.superFunction(context);
    });
}

// Ship class
function Ship(location, rotation, velocity, accelerationRate, fireRate)
{
    this.objectName = "Ship";

    var geometry = [
        new Point( 10,  0),
        new Point(-10, -5),
        new Point(-10,  5),
        new Point( 10,  0)
    ]

    MovingGameObject.call(this, geometry, location, rotation, velocity, 0, "GREEN", "TRANSPARENT", 20, 20);

    this.accelerationRate = accelerationRate;
    this.fireRate = fireRate;
    this.shootTimer = 31;
    this.isAccelerating = false;

    this.explode = function() {
        for(var i = 0; i < 20; i++)
        {
            debris.push(new Debris(new Point(this.location.x, this.location.y), Math.random() * 2*Math.PI, Math.random()*10, "GREEN"));
        }
        drawFlash = true;
        lives--;
        livesText.text = "LIVES: " + lives;
        if(lives > 0)
            respawnText.visible = true;
        else
            gameOverText.visible = true;
    }

    this.front = function() {
        return new Point(
            this.location.x + (this.geometry[0].x * Math.sin(rotation)),
            this.location.y + (this.geometry[0].y * Math.sin(rotation))
        );
    }

    // Accelerates the ship.
    this.accelerate = function() {
        this.velocity.x += this.accelerationRate * Math.cos(this.rotation);
        this.velocity.y += this.accelerationRate * Math.sin(this.rotation);
        this.isAccelerating = true;
    };

    // Stops accelerating the ship.
    this.stopAccelerating = function() {
        this.isAccelerating = false;
    };

    // Handles missile firing as well as movement.
    this.update = this.update.override(function(deltaTime) {
        this.superFunction(deltaTime);

        this.shootTimer++;

        for(var i = 0; i < missiles.length; i++)
        {
            if(missiles[i].isDead())
                missiles.shift();
        }
    });

    // Turns the ship clockwise if turnDirection is 1, and anticlockwise if turnDirection is -1.
    this.turn = function(turnDirection) {
        if(turnDirection > 0)
        {
            // Turn ship clockwise
            this.rotation += 3*(Math.PI / 180);
            if(this.rotation >= Math.PI)
                this.rotation -= (2*Math.PI);
        }
        else if(turnDirection < 0)
        {
            // Turn ship anticlockwise
            this.rotation -= 3*(Math.PI / 180);
            if(this.rotation <= -Math.PI)
                this.rotation += (2*Math.PI);
        }
    }

    // Fires a missile.
    this.shoot = function() {
        if(this.shootTimer > this.fireRate)
        {
            missiles.push(new Missile(new Point(this.front().x, this.front().y), this.rotation, 5, 100));
            this.shootTimer = 0;
            score -= 10;
        }
    };

    // Draws the object to the screen.
    this.draw = this.draw.override(function(context) {
        // Draw geometry.
        this.superFunction(context);

        // Save initial context transformation.
        context.save();

        // Translate to the object's origin and align to its rotation.
        context.translate(this.location.x, this.location.y);
        context.rotate(this.rotation);

        // Draw thruster.
        if(this.isAccelerating)
        {
            context.strokeStyle = "ORANGE";
            context.beginPath();
            context.arc(-10, 0, 4, Math.PI / 2, -Math.PI / 2);
            context.closePath();
            context.fill();
            context.stroke();
        }

        // Restore context.
        context.restore();
    });

    this.drawMissiles = function(context)
    {
        for(var i = 0; i < missiles.length; i++)
        {
            missiles[i].draw(context);
        }
    };
}

// Missile class.
function Missile(location, direction, speed, lifetime)
{
    this.objectName = "Missile";

    var geometry = [
        new Point(-2, -2),
        new Point( 2, -2),
        new Point( 2,  2),
        new Point(-2,  2)
    ];

    var velocity = new Point(speed * Math.cos(direction), speed * Math.sin(direction));

    MovingGameObject.call(this, geometry, location, 0, velocity, 0.0, "CYAN", "TRANSPARENT", 4, 4);

    this.lifeTime = lifetime;

    this.update = this.update.override(function(deltaTime) {
        this.superFunction(deltaTime);
        this.lifeTime--;
    });

    this.isDead = function() {
        return (this.lifeTime < 0);
    }
}

function Debris(location, direction, speed, colour)
{
    var size = 2 + Math.random() * 5;

    var geometry = [
        new Point(-size, 0),
        new Point( size, 0)
    ];

    var velocity = new Point(speed * Math.cos(direction), speed * Math.sin(direction));

    MovingGameObject.call(this, geometry, location, direction, velocity, Math.random() * 0.5, colour, colour, size, size);

    this.lifeTime = Math.random() * 100;

    this.update = this.update.override(function(deltaTime) {
        this.superFunction(deltaTime);
        this.lifeTime--;
    });

    this.isDead = function() {
        return (this.lifeTime < 0);
    }
}
