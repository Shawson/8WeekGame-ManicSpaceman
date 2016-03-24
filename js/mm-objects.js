/*!
* Manic Spaceman Game Element Classes
* http://8weekgame.shawson.co.uk/
*
* Copyright 2010, Shaw Young
* Released under the MIT, BSD and GPL Licenses.
* http://www.opensource.org/licenses/bsd-license.php
* http://www.opensource.org/licenses/mit-license.php
* http://www.opensource.org/licenses/gpl-2.0.php
*
* Date: Mon Jul 17 17:00:00 2010 
*/
function MMLevelExit(p, ready_anim) {
	this.base = LevelExit;
	this.base(p);
	
	this.ReadyAnimation = ready_anim;
}
MMLevelExit.prototype = new LevelExit;
MMLevelExit.prototype.ExitConditionsMet = function () {
	return (this.GameReference.KeysCollected == this.GameReference.KeysNeeded);
}
MMLevelExit.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
	// Call overridden parent method...
	LevelExit.prototype.update.apply(this, arguments);
	
	if (this.CurrentAnimation != this.ReadyAnimation && this.GameReference.KeysCollected == this.GameReference.KeysNeeded)
		this.CurrentAnimation = this.ReadyAnimation;
}



function Key(p) {
	this.base = Collectable;
	this.base(p);
	this.CollectionNoise = null;
}
Key.prototype = new Collectable;
Key.prototype.Collected = function () {
    var g = this.GameReference;
    g.KeysCollected++;
    g.Score += 100;
    g.SoundManager.PlaySound(this.CollectionNoise);
}



function ManicPlayer(p) {
	this.base = Player;
	this.base(p);
	this.LockVelocityX = 0;  // used for applying velocity from stuff like conveyor belts

    this.DeathAnimation = null;
    this.EndingAnimation = null;
}
ManicPlayer.prototype = new Player;
ManicPlayer.prototype.finishInputCheck = function () {
	Player.prototype.finishInputCheck.apply(this, arguments);

    // we finish the input check, on top of that apply any velocity from conveyor belts etc
	if (this.LockVelocityX != 0) {
		this.Velocity.x = this.LockVelocityX;
	}
}
ManicPlayer.prototype.HandleCollision = function (collision_vector, collision_object) {
	Player.prototype.HandleCollision.apply(this, arguments);

	if (Math.abs(collision_vector.x) > Math.abs(collision_vector.y) && collision_vector.y < 0) // y axis
	{
        if (collision_object.CollisionBody.Top == this.CollisionBody.Bottom) {
            if (collision_object instanceof MovingPlatform)
	            this.LockVelocityX = STEP_SIZE * collision_object.direction;
            else
	            this.LockVelocityX = 0;
        }
	}
}
ManicPlayer.prototype.PerformFootStepNoise = function () {
	if (this.Velocity.x != this.LockVelocityX)
		Player.prototype.PerformFootStepNoise.apply(this, arguments); 
}
ManicPlayer.prototype.StartJump = function() {
	Player.prototype.StartJump.apply(this); 
	this.GameReference.SoundManager.PlaySound(this.GameReference.ResourceManager.GetObjectByHandle('jump'));
}
ManicPlayer.prototype.SetDeathAnimation = function () {
    var flipX = this.CurrentAnimation.flipX;
    this.CurrentAnimation = this.DeathAnimation;
    this.CurrentAnimation.flipX = !flipX;
    if (flipX)
        this.TextureOffset = new Vector2d(-30, 0);  // somehow make this a property with the conditional logic?  maybe create a proper texture class which holds this kind of log
}
ManicPlayer.prototype.SetLevelEndAnimation = function() {
    this.CurrentAnimation = this.EndingAnimation;
	this.TextureOffset = new Vector2d(0,-149); // make this a property...
}



function DissolvablePlatform(p) {
	this.base = Platform;
	this.base(p);
	this.health = 100;
	this.CollisionType = COLLIDE_TOP;
}
DissolvablePlatform.prototype = new Platform;
DissolvablePlatform.prototype.HandleCollision = function (collision_vector, collision_object) {
    var g = this.GameReference;
    if (collision_object instanceof Player) {
        //if (collision_vector.y < 0) { // this is the player, is he standing above me?
        // this is the player, is he standing above me?
        if ((collision_object.CollisionBody.Top + collision_object.CollisionBody.Height - collision_object.Velocity.y - 1) <= this.CollisionBody.Top) {
            this.health -= 10;
            if (this.health < 1) {
                this.RemoveMe = true;
                // adds a particle emitter which will push bits out from the broken tile
                //this.GameReference.gameObjects[this.GameReference.gameObjects.length] = new FiniteParticleEmitter(p, 			                                                        count, 	emitter_life, 	min_life_span, 	max_life_span, 	min_x, 	min_y, 	max_x, 	max_y, 	GenericParticleFactory(animation));
                g.gameObjects[g.gameObjects.length] = new FiniteParticleEmitter(new Vector3d(this.Position.x + 13, this.Position.y, this.Position.z), 3, 100, 50, 100, -3, 5, 3, 20, new FloorTileParticleFactory(g));
                g.SoundManager.PlaySound(g.ResourceManager.GetObjectByHandle('break' + randomXToY(1, 3, false)));
            }
        }
    }
}
DissolvablePlatform.prototype.draw = function (dt, backBufferContext2D, xScroll, yScroll) {
	// we're overriding here because we want to draw a specific frame based on health, rather than simply the next one in the sequence

	// which frame should i draw?
	if (this.health > 80)
		this.CurrentAnimation.DrawFrame(backBufferContext2D, this.Position.x, this.Position.y, dt, 0);
	else if (this.health > 60)
		this.CurrentAnimation.DrawFrame(backBufferContext2D, this.Position.x, this.Position.y, dt, 1);
	else if (this.health > 40)
		this.CurrentAnimation.DrawFrame(backBufferContext2D, this.Position.x, this.Position.y, dt, 2);
	else if (this.health > 20)
		this.CurrentAnimation.DrawFrame(backBufferContext2D, this.Position.x, this.Position.y, dt, 3);
	else
		this.CurrentAnimation.DrawFrame(backBufferContext2D, this.Position.x, this.Position.y, dt, 4);
}


function MovingPlatform(p) {
	this.base = Platform;
	this.base(p);
	this.CollisionType = COLLIDE_TOP;
	this.direction = 0;
}
MovingPlatform.prototype = new Platform;
MovingPlatform.prototype.HandleCollision = function (collision_vector, collision_object) {
	if (collision_object instanceof Player)
		if ((collision_object.CollisionBody.Top + collision_object.CollisionBody.Height - collision_object.Velocity.y - 1) <= this.CollisionBody.Top) // this is the player, is he standing above me?
			if (!(this.direction < 0 && collision_object.Velocity.x < 0) && !(this.direction > 0 && collision_object.Velocity.x > 0)) // Move the player left
				collision_object.Position.x += STEP_SIZE * this.direction;
}


/*
VERTICLE_BAD_GUY_IDLE = 0;
VERTICLE_BAD_GUY_GOING_DOWN = 1;
VERTICLE_BAD_GUY_BOTTOM = 2;
VERTICLE_BAD_GUY_GOING_UP = 3;
*/
function VerticleBadGuy(p) {
	this.base = ActiveGameObject;	
	this.base( p );

	this.Velocity = new Vector2d(0,0);

	this.IdleAnimation = null;

	this.lastXCorrection = 0;
	this.lastYCorrection = 0;
	
	this.RestingPosition = p;

	this.State = 0; // VERTICLE_BAD_GUY_IDLE;
}
VerticleBadGuy.prototype = new ActiveGameObject; 
VerticleBadGuy.prototype.applyVelocity = function() {
	this.SetPosition(this.Position.Add(this.Velocity)); // apply the adjusted Velocity
}
VerticleBadGuy.prototype.SetIdleAnimation = function(a) {
	this.IdleAnimation = a;
	this.CurrentAnimation = this.IdleAnimation;
}
VerticleBadGuy.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
    switch (this.State) {
        case 0: //VERTICLE_BAD_GUY_IDLE:
            this.State = 1; // VERTICLE_BAD_GUY_GOING_DOWN;
            break;
        case 1: //VERTICLE_BAD_GUY_GOING_DOWN:
            this.Velocity = new Vector2d(0, 3);
            break;
        case 3: // VERTICLE_BAD_GUY_GOING_UP:
            this.Velocity = new Vector2d(0, -3);
            if (this.Position.y + this.Velocity.y < 0)
                this.State = 1; // VERTICLE_BAD_GUY_GOING_DOWN;
            break;
    }
    // apply the calculated velocity (from movement and gravity) and re-calc collision body/ position
    this.applyVelocity();

    // Call overridden parent method...
    ActiveGameObject.prototype.update.apply(this, arguments);
};
VerticleBadGuy.prototype.HandleCollision = function (collision_vector, collision_object) {
    // the shallower number is the impact edge
    if (collision_object instanceof Player) {
        // instant kill
        collision_object.health = 0;
        this.GameReference.PlayerDied();
    }
    else if (Math.abs(collision_vector.x) > Math.abs(collision_vector.y)) // y axis
    {
        if ((collision_object.CollisionType & COLLIDE_TOP) && collision_vector.y < 0) // top
        {
            this.State = 3; // VERTICLE_BAD_GUY_GOING_UP;
        }
        else if ((collision_object.CollisionType & COLLIDE_BOTTOM) && collision_vector.y > 0)  // bottom
        {
            this.State = 1; // VERTICLE_BAD_GUY_GOING_DOWN;
        }
    }
}