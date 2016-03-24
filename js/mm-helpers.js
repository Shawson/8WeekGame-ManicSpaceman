/*!
* Manic Spaceman Helper Classes
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
function FloorTileParticleFactory(g) {
	this.base = GenericParticleFactory;
	this.base();
	this.GameReference = g;
}
FloorTileParticleFactory.prototype.GetParticle = function (p, min_life_span, max_life_span, min_x, min_y, max_x, max_y) {
	var anim = new Animation(this.GameReference.ResourceManager.GetObject('gfx/floor-bits-' + (Math.floor(Math.random() * 11) + 1) + '.png'), 0, true, 15);
	return new Particle(p, min_life_span, max_life_span, min_x, min_y, max_x, max_y, anim );
}

function ManicMinorGameObjectFactory(resource_manager) {
	this.tileSpacingWidth = 25;
	this.tileSpacingHeight = 25;
	this.resourceManager = resource_manager;
}
ManicMinorGameObjectFactory.prototype.GetGameObject = function (letter, x, y) {
	//in manic miner, the player is taller than a normal tile, so we will need to offset..
	var pos = null;
	var o = null;

	switch (letter) {
		case '%':
		case 'A':
			pos = new Vector3d(x * this.tileSpacingWidth, y * this.tileSpacingHeight - 27, y);
			break;
		default:
			pos = new Vector3d(x * this.tileSpacingWidth, y * this.tileSpacingHeight, y);
			break;
	}

    // z index of any special passive object (eg; an exit tile) should be higher than standard platforms
	switch (letter.toUpperCase()) {
		case 'O':
			//pos.z = 100;
			o = new Platform(pos);
			o.CollisionType = COLLIDE_TOP | COLLIDE_LEFT | COLLIDE_BOTTOM | COLLIDE_RIGHT;
			o.FootStepSound = this.resourceManager.GetObjectByHandle('foot-steps');

			switch (x) {
				case 31:
					o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/brick-side.png'), 0, true, 15);
					o.CurrentAnimation.flipX = true;
					break;
				case 0:
					o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/brick-side.png'), 0, true, 15);
					break;
			}

			if (o.CurrentAnimation == null)
				o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/hanging-platform.gif'), 0, true, 15);

			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;
		case '=':
			o = new Platform(pos);
			o.CollisionType = COLLIDE_TOP;
			o.FootStepSound = this.resourceManager.GetObjectByHandle('foot-steps');

			if (y == 15)
				o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/floor-' + (Math.floor(Math.random() * 3) + 1) + '.gif'), 0, true, 15);
			else
				o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/platform-' + (Math.floor(Math.random() * 2) + 1) + '.gif'), 0, true, 15);
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;
		case '<':
			o = new MovingPlatform(pos);
			o.CollisionType = COLLIDE_TOP;
			o.FootStepSound = this.resourceManager.GetObjectByHandle('foot-steps');

			o.direction = -1;
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/moving-platform-6-frames.gif'), 6, true, 15);
			//o.CollisionBodyOffset = new Vector2d(0, 8);
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;
		case '>':
			o = new MovingPlatform(pos);
			o.CollisionType = COLLIDE_TOP;
			o.FootStepSound = this.resourceManager.GetObjectByHandle('foot-steps');

			o.direction = 1;
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/moving-platform-6-frames.gif'), 6, true, 15, true);
			//o.CollisionBodyOffset = new Vector2d(0, 8);
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;
		case '~':
			o = new DissolvablePlatform(pos);
			o.FootStepSound = this.resourceManager.GetObjectByHandle('gravel-foot-steps');

			// randomly select a floor tile from one of the variants
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/dissolve-' + (Math.floor(Math.random() * 5) + 1) + '-5-frames.png'), 5, true, 15);
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;

		case 'A':
			pos.z = 98;
			o = new WalkingBadGuy(pos, -1);
			o.SetWalkAnimation(new Animation(this.resourceManager.GetObject('gfx/robo.png'), 8, true, 15));
			o.CollisionBodyOffset = new Vector2d(8, 0);
			o.SetCollisionBody(new Rectangle(pos, 20, 47));
			o.FootStepVolume = 0.0;
			break;
		case 'B':
			o = new StaticHazard(pos);
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/floor-alien-7-frames.png'), 7, true, 15);
			o.TextureOffset = new Vector2d(-7, 0);
			o.CollisionBodyOffset = new Vector2d(3, 0);

			if (Math.random() > 0.5)
				o.CurrentAnimation.flipX = true;

			o.SetCollisionBody(new Rectangle(pos, 22, 25));
			break;
		case 'C':
			o = new StaticHazard(pos);
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/roof-alien.png'), 5, true, 15);
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;

		case 'D':
			o = new VerticleBadGuy(pos);
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/spider.png'), 3, true, 15);
			o.TextureOffset = new Vector2d(0, -370);
			o.CollisionBodyOffset = new Vector2d(2, 0);
			o.SetCollisionBody(new Rectangle(pos, 20, 30));
			break;


		case 'F':
			o = new StaticHazard(pos);
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/spider.png'), 3, true, 15);
			o.TextureOffset = new Vector2d(0, -370);
			o.CollisionBodyOffset = new Vector2d(2, 0);
			o.SetCollisionBody(new Rectangle(pos, 20, 30));
			break;

		case '1':
			pos.z = 90;
			o = new Key(pos);
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/collectables-' + (Math.floor(Math.random() * 5) + 1) + '.png'), 14, true, 15);
			o.CollectionNoise = this.resourceManager.GetObjectByHandle('pickup');
			o.SetCollisionBody(new Rectangle(pos, 25, 25));
			break;
		case '%':
			pos.z = 97;
			o = new ManicPlayer(pos);

			o.WalkAnimation = new Animation(this.resourceManager.GetObject('gfx/sam-run-41w-11frames.png'), 11, true, 60, true);
			o.FallAnimation = new Animation(this.resourceManager.GetObject('gfx/sam-fall.png'), 0, true, 15);
			o.SetIdleAnimation(new Animation(this.resourceManager.GetObject('gfx/sam-idle-5frames.png'), 5, true, 7));
			o.DeathAnimation = new Animation(this.resourceManager.GetObject('gfx/sam-death-4frames.png'), 4, false, 15, true)
			o.EndingAnimation = new Animation(this.resourceManager.GetObject('gfx/sam-transport-26frames.png'), 26, false, 15);

			o.CollisionBodyOffset = new Vector2d(10, 3);
			o.SetCollisionBody(new Rectangle(pos, 20, 47));
			//o.FootStepSound = this.resourceManager.GetObjectByHandle('foot-steps');
			//o.FootStepSoundDissolvable = this.resourceManager.GetObjectByHandle('gravel-foot-steps');
			o.FootStepFrequency = 250;
			break;
		case 'X':
			pos.z = 98;
			o = new MMLevelExit(pos, new Animation(this.resourceManager.GetObject('gfx/exit-active-5frames.png'), 5, true, 15));
			o.CurrentAnimation = new Animation(this.resourceManager.GetObject('gfx/exit-idle.png'), 0, true, 15);
			o.CollisionBodyOffset = new Vector2d(-6, 0);
			o.TextureOffset = new Vector2d(-5, -29);
			o.SetCollisionBody(new Rectangle(pos, 30, 25));
			break;
	}
	return o;
}

/* Unused!  this killed the frame rate- must revisit to figure out why! */
function InfiniteScrollX(initial_x, initial_y, width, height, image) {
	this.width = width;
	this.height = height;
	this.a_x = initial_x;
	this.b_x = initial_x + width - 1; // -1 to stop joins being visible
	this.y = initial_y;
	this.image = image;
}
InfiniteScrollX.prototype.DrawAndAdvance = function (context, increment_x, increment_y) {
	context.drawImage(this.image, this.a_x, this.y, this.width, this.height);
	context.drawImage(this.image, this.b_x, this.y, this.width, this.height);

	if (this.a_x < this.b_x) {
		this.a_x += increment_x;
		this.b_x = this.a_x + this.width - 2; // -1 to stop joins being visible

		if (this.b_x < increment_x) // swap
			this.a_x = this.b_x + this.width - 2;
	}
	else {
		this.b_x += increment_x;
		this.a_x = this.b_x + this.width - 2; // -1 to stop joins being visible

		if (this.a_x < increment_x) // swap
			this.b_x = this.a_x + this.width - 2;
	}

}