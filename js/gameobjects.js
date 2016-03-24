/*!
* Generic Game Core Game Element Classes
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

// genrally for faster javascript you should avoid using global variables, but...
GRAVITY			    = 2;
JUMP_FORCE		    = 5;
JUMP_STEPS		    = 4;
STEP_SIZE			= 5;
TERMINAL_VELOCITY	= 5;

// bitwise flags for collision // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Operators/Bitwise_Operators
COLLIDE_NONE 		= 0x0; // 0000
COLLIDE_TOP		    = 0x1; // 0001
COLLIDE_RIGHT 	    = 0x2; // 0010
COLLIDE_LEFT		= 0x4; // 0100
COLLIDE_BOTTOM	    = 0x8; // 1000


function GameObject(p) {
	this.GameReference = null;
	this.Position = p || new Vector3d(0,0,0); //the zaxis in the vector is used for depth

	this.CurrentAnimation = null;
	this.CollisionBodyOffset = new Vector2d(0,0);
	this.TextureOffset = new Vector2d(0,0);
	this.CollisionBody = null;
	this.CollisionType = COLLIDE_NONE;
	
	this.RemoveMe = false;
}
GameObject.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
	return;
}
GameObject.prototype.draw = function (dt, backBufferContext2D, xScroll, yScroll) {
	this.CurrentAnimation.DrawNextFrame(backBufferContext2D, this.Position.x + this.TextureOffset.x, this.Position.y + this.TextureOffset.y, dt);
}
GameObject.prototype.SetCollisionBody = function(r) {
	this.CollisionBody = r;
	this.CollisionBody.SetPosition(r.Position.Add(this.CollisionBodyOffset));
}
GameObject.prototype.SetPosition = function(p) {
	this.Position = p;
	this.CollisionBody.SetPosition(p.Add(this.CollisionBodyOffset));
}


/* PassiveGameObject - Non-mobile things that do stuff
 * These affect things which touch them, but don't check themselves 
 */
function PassiveGameObject(p) {
	this.base = GameObject;	
	this.base( p );
	this.Passive = true;
}
PassiveGameObject.prototype = new GameObject;
PassiveGameObject.prototype.HandleCollision = function(collision_vector, collision_object) {
	// do nothing yet..
}


/* ActiveGameObject - Moving things which can be effected by stuff
 * A Game Object which activly checks for collisions, as opposed to the passive GameObject which is checked by others
 */
function ActiveGameObject(p) {
	this.base = GameObject;	
	this.base( p );
	this.Passive = false;
}
ActiveGameObject.prototype = new GameObject;
ActiveGameObject.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
	var game_objects = this.GameReference.gameObjects;
	var v = null;

	var game_objects_len = game_objects.length;

	// this for loop has to go forwards- need to check lower z index items before higher ones
	// anything of interest will have a higher z index than the normal tiles
	for (var i = 0; i < game_objects_len; i++) {
		otherObject = game_objects[i];
		
		/// make sure we're not colliding with myself and the other object isn't totally out of scope
		if (otherObject != this && otherObject.CollisionBody != null &&
			otherObject.CollisionBody.Bottom > (this.CollisionBody.Top + Math.abs(this.Velocity.y)) &&
			otherObject.CollisionBody.Top < this.CollisionBody.Bottom && 
			otherObject.CollisionBody.Right > this.CollisionBody.Left &&
			otherObject.CollisionBody.Left < this.CollisionBody.Right
			) { 
			v = this.CollisionBody.IntersectDepthVector(otherObject.CollisionBody);
			
			if (! (v.x ==0 && v.y ==0) ) {
				
				// if the other object is passive, then let it know something happened so it can act
				if (otherObject.Passive) 
					otherObject.HandleCollision(v, this);
				
				// if they return something, and that something is true, then stop checking
				result = this.HandleCollision(v, otherObject);
								
				if (result != null && result== true)
					break;
			}
		}
	}
}
ActiveGameObject.prototype.HandleCollision = function(collision_vector, collision_object) {
	// do nothing yet...
}



function WalkingSprite(p) {
	this.base = ActiveGameObject;	
	this.base( p );

	this.Velocity = new Vector2d(0,0);

	this.WalkAnimation = null;
	this.IdleAnimation = null;

	this.isJumping = 0;
	this.isOnTheGround = false;

	this.lastXCorrection = 0;
	this.lastYCorrection = 0;
		
	this.health = 100;

	this.LastFootStepTime = new Date().getTime();
	this.FootStepFrequency = 500; // milliseconds
	this.FootStepVolume = 1.0;
	this.ThisPlatformTile = null; // platform tile we're currently standing on
}
WalkingSprite.prototype = new ActiveGameObject; 
WalkingSprite.prototype.applyVelocity = function() {
	this.SetPosition(this.Position.Add(this.Velocity)); // apply the adjusted Velocity
}
WalkingSprite.prototype.SetIdleAnimation = function(a) {
	this.IdleAnimation = a;
	this.CurrentAnimation = this.IdleAnimation;
}
WalkingSprite.prototype.SetWalkAnimation = function(a) {
	this.WalkAnimation = a;
	this.CurrentAnimation = this.WalkAnimation;
}
WalkingSprite.prototype.update = function(dt, backBufferContext2D, xScroll, yScroll) {
	if (this.Velocity.y < TERMINAL_VELOCITY)
		this.Velocity.y += GRAVITY; // apply some gravity
	
	//are we jumping?
	if (this.isJumping > 0) {
		this.Velocity.y -= JUMP_FORCE;
		this.isJumping--;
	}

	// apply the calculated velocity (from movement and gravity) and re-calc collision body/ position
	this.applyVelocity();

	this.ThisPlatformTile = null; // reset this!

	// ** check the collisions **		
	// where is this velocity going to take my collision body on the next frame?
	this.isOnTheGround = false;

	// Call overridden parent method...
	ActiveGameObject.prototype.update.apply(this, arguments);

	if (this.FootStepVolume > 0.0)
		this.PerformFootStepNoise();
};
WalkingSprite.prototype.PerformFootStepNoise = function() {
	  // foot step sound?
	//if ( this.FootStepSound != null && this.isOnTheGround && this.Velocity.x != 0 && (new Date().getTime() - this.LastFootStepTime) > this.FootStepFrequency && this.ThisPlatformTile != null)
	if ( this.ThisPlatformTile != null && this.Velocity.x != 0 && (new Date().getTime() - this.LastFootStepTime) > this.FootStepFrequency)
	{
		this.ThisPlatformTile.PlayFootStepSound();
		this.LastFootStepTime = new Date().getTime();
	}  
}
WalkingSprite.prototype.HandleCollision = function(collision_vector, collision_object) {
	// the shallower number is the impact edge
	if (Math.abs(collision_vector.x) > Math.abs(collision_vector.y)) // y axis
	{	
		// top
		// the extra condition in this if clause stops the characters "snapping" to the position when jumping through one way tiles
		// the same thing should be applied to the other directions, but i wont yet as i dont need it yet!
		if ( (collision_object.CollisionType & COLLIDE_TOP) && collision_vector.y < 0 && (this.Position.y + this.CollisionBody.Height - this.Velocity.y - 1) <= collision_object.CollisionBody.Position.y)
		{
			this.isOnTheGround = true;
			this.Velocity.y = 0;
			this.SetPosition(new Vector2d(this.Position.x, this.Position.y + collision_vector.y));
			this.lastYCorrection = collision_vector.y;

			if (collision_object instanceof Platform) //we're on the ground- create a reference to what we're standing on
				this.ThisPlatformTile = collision_object;
		}
		else if ( (collision_object.CollisionType & COLLIDE_BOTTOM) && collision_vector.y > 0)  // bottom
		{
			this.isJumping = 0;
			this.Velocity.y = 0;
			this.SetPosition (new Vector2d(this.Position.x, this.Position.y + collision_vector.y));
			this.lastYCorrection = collision_vector.y;
		}
	}
	else // x axis
	{
		if ( (collision_object.CollisionType & COLLIDE_LEFT) && collision_vector.x < 0) // left
		{
			this.Velocity.x = 0;
			this.SetPosition ( new Vector2d(this.Position.x + collision_vector.x, this.Position.y));
			this.lastXCorrection = collision_vector.x;
		}
		else if ( (collision_object.CollisionType & COLLIDE_RIGHT) && collision_vector.x > 0) // right
		{
			this.Velocity.x = 0;
			this.SetPosition ( new Vector2d(this.Position.x + collision_vector.x, this.Position.y));
			this.lastXCorrection = collision_vector.x;
		}
	}
}

function Player(p) {
	this.base = WalkingSprite;	
	this.base( p );

	this.FallAnimation = null;
	this.IdleAnimation = null;
	this.CurrentAnimation = this.IdleAnimation;
}
Player.prototype = new WalkingSprite;  
Player.prototype.update = function(dt, backBufferContext2D, xScroll, yScroll) {
	this.checkInput();
	this.finishInputCheck();
	// Call overridden parent method...
	WalkingSprite.prototype.update.apply(this, arguments);
};
Player.prototype.SetIdleAnimation = function(a) {
	this.IdleAnimation = a;
	this.CurrentAnimation = this.IdleAnimation;
}
Player.prototype.checkInput = function () {
	var input_manager = this.GameReference.InputManager;
	// check for key presses
	this.Velocity.x = 0;
	if (input_manager.Left) {
		this.Velocity.x -= STEP_SIZE;

		if (this.CurrentAnimation != this.WalkAnimation)
			this.CurrentAnimation = this.WalkAnimation;

		this.CurrentAnimation.flipX = false;
	}
	if (input_manager.Right) {
		this.Velocity.x += STEP_SIZE;

		if (this.CurrentAnimation != this.WalkAnimation)
			this.CurrentAnimation = this.WalkAnimation;

		this.CurrentAnimation.flipX = true;
	}
	if (input_manager.Jump) {
		if (this.Velocity.y == 0 && this.isOnTheGround)  // make sure we're not already jumping or falling; disallow double-jumps!
			this.StartJump();
	}
}
Player.prototype.StartJump = function() {
	this.isJumping = JUMP_STEPS;
}
Player.prototype.finishInputCheck = function() {
	if (this.Velocity.y > 0) {
		flip = this.CurrentAnimation.flipX;
		this.CurrentAnimation = this.FallAnimation;
		this.CurrentAnimation.flipX = flip;  //make sure he's still facing the same direction!
	} 
	else if (this.Velocity.x == 0) { //after input checks, he's still not moving left or right
		flip = this.CurrentAnimation.flipX;
		this.CurrentAnimation = this.IdleAnimation;
		this.CurrentAnimation.flipX = flip;  //make sure he's still facing the same direction!
	} 
}

function WalkingBadGuy(p, initial_direction) {
	this.base = WalkingSprite;	
	this.base( p );
	
	this.CurrentDirection = initial_direction;

	this.IdleAnimation = null;
	this.CurrentAnimation = this.WalkAnimation;
}
WalkingBadGuy.prototype = new WalkingSprite;
WalkingBadGuy.prototype.update = function(dt, backBufferContext2D, xScroll, yScroll) {
	this.decideNextStep();

	WalkingSprite.prototype.update.apply(this, arguments);
};
WalkingBadGuy.prototype.decideNextStep = function () {
	if (Math.abs(this.lastXCorrection) > 0) // did we just bump into something?
	{
		//change direction
		this.CurrentDirection = this.CurrentDirection * -1;
		if (this.CurrentAnimation.flipX)
			this.CurrentAnimation.flipX = false;
		else
			this.CurrentAnimation.flipX = true;
	}
	else // ok, so no bump, but are we about to walk off the edge?  that would be embarrasing.
	{
		if (this.CurrentDirection != 0) // dont bother checking if we're not moving..
		{
			// create a second collision body one tile ahead of us in the current direction of travel- and on the floor
			var next_step = null;
			var about_to_fall = true;
			if (this.CurrentDirection > 0)
				next_step = new Rectangle(new Vector2d(this.Position.x + this.CollisionBody.Width - STEP_SIZE, this.Position.y + this.CollisionBody.Height), this.CollisionBody.Width, 5);
			else
				next_step = new Rectangle(new Vector2d(this.Position.x - this.CollisionBody.Width + STEP_SIZE, this.Position.y + this.CollisionBody.Height), this.CollisionBody.Width, 5);

			var game_objects = this.GameReference.gameObjects;
			var game_objects_len = game_objects.length;

			for (var i = game_objects_len; i--;) {
			//for (var i = 0; i < game_objects.length; i++) {
				otherObject = game_objects[i];
				if (otherObject instanceof Platform && otherObject.CollisionBody != null
					&& otherObject.CollisionBody.Bottom > this.CollisionBody.Top - 50
					&& otherObject.CollisionBody.Top < this.CollisionBody.Bottom + 50
					&& otherObject.CollisionBody.Right > this.CollisionBody.Left - 50
					&& otherObject.CollisionBody.Left < this.CollisionBody.Right + 50
					) {
					v = next_step.IntersectDepthVector(otherObject.CollisionBody);

					if (!(v.x == 0 && v.y == 0)) {

						// the shallower number is the impact edge
						if (Math.abs(v.x) > Math.abs(v.y)) // y axis
						{
							about_to_fall = false;
							break;
						}

					} // end if (! (v.x ==0 && v.y ==0) ) {
				} // end if (otherObject != this)
			} // next i

			if (about_to_fall) {
				//change direction
				this.CurrentDirection = this.CurrentDirection * -1;
				if (this.CurrentAnimation.flipX)
					this.CurrentAnimation.flipX = false;
				else
					this.CurrentAnimation.flipX = true;
			}
		}
	}

	this.lastXCorrection = 0;
	this.lastYCorrection = 0;

	this.Velocity.x = STEP_SIZE * this.CurrentDirection;
}
WalkingBadGuy.prototype.HandleCollision = function(collision_vector, collision_object) {
	// check to see if we just touched the player..
	
	if (collision_object instanceof Player) {
		// instant kill
		collision_object.health = 0;
		this.GameReference.PlayerDied();
	}
	else
	{
		// do parents handle method (to stop me falling through the floor!)
		WalkingSprite.prototype.HandleCollision.apply(this,arguments);
	}
}

function StaticHazard(p) {
	this.base = PassiveGameObject;	
	this.base( p );
}
StaticHazard.prototype = new PassiveGameObject;
StaticHazard.prototype.HandleCollision = function(collision_vector, collision_object) {
	if (collision_object instanceof Player) {
		collision_object.health = 0;
		this.GameReference.PlayerDied();
	}
}

function Collectable(p) {
	this.base = PassiveGameObject;	
	this.base( p );
}
Collectable.prototype = new PassiveGameObject;
Collectable.prototype.HandleCollision = function(collision_vector, collision_object) {
	if (collision_object instanceof Player) {
		this.Collected();
		this.RemoveMe = true;
	}
}
Collectable.prototype.Collected = function() {
	//...nothing..
}

function LevelExit(p) {
	this.base = PassiveGameObject;	
	this.base( p );
}
LevelExit.prototype = new PassiveGameObject;
LevelExit.prototype.ExitConditionsMet = function() {
	return true;
}
LevelExit.prototype.HandleCollision = function(collision_vector, collision_object) {
	if (collision_object instanceof Player 
		&& this.ExitConditionsMet()
		&& collision_object.CollisionBody.Right <= this.CollisionBody.Right 
		&& collision_object.CollisionBody.Left >= this.CollisionBody.Left
		&& collision_object.isOnTheGround) {
		this.GameReference.LevelCompleted();
	}
}


function Platform(p) {
	this.base = PassiveGameObject;
	this.base(p);
	this.FootStepSound = null;
}
Platform.prototype = new PassiveGameObject;
Platform.prototype.PlayFootStepSound = function() {
	if (this.FootStepSound != null)
		this.GameReference.SoundManager.PlaySound(this.FootStepSound);
}