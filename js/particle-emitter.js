/*!
* Generic Game Particle Emitter Class
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
/* A new particle emitter class */
function ParticleEmitter(p, count, min_life_span, max_life_span, min_x, min_y, max_x, max_y, factory) {
    this.base = GameObject;	
    this.base( p );
    this.Particles = new Array();
    //this.ParticleFactory = factory; // do we need to store this?

    for (var i = 0; i < count; i++)
        this.Particles[i] = factory.GetParticle(p, min_life_span, max_life_span, min_x, min_y, max_x, max_y);
        //this.Particles[i] = new Particle(this.Position, life_span, min_x, min_y, max_x, max_y, animation);
}
ParticleEmitter.prototype = new GameObject;
ParticleEmitter.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
    for (var i = 0; i < this.Particles.length; i++)
        this.Particles[i].update(dt, backBufferContext2D, xScroll, yScroll);
}
ParticleEmitter.prototype.draw = function (dt, backBufferContext2D, xScroll, yScroll) {
    if (this.Particles != null)
        for (var i = 0; i < this.Particles.length; i++)
            this.Particles[i].draw(dt, backBufferContext2D, xScroll, yScroll);
}

/* an emitter which only lives for a certain amount of frames.. */
function FiniteParticleEmitter(p, count, emitter_life, min_life_span, max_life_span, min_x, min_y, max_x, max_y, factory) {
	this.base = ParticleEmitter;	
    this.base( p, count, min_life_span, max_life_span, min_x, min_y, max_x, max_y, factory);
	
    this.FrameCount = 0;
    this.DieAfterFrame = emitter_life;
}
FiniteParticleEmitter.prototype = new ParticleEmitter;
FiniteParticleEmitter.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {
    
    this.FrameCount++;
    if (this.FrameCount > this.DieAfterFrame) {
        this.Particles.length = 0;
        this.Particles = null;
        this.RemoveMe = true;
    }
    else
        ParticleEmitter.prototype.update.apply(this, arguments);

    return;
}

function GenericParticleFactory(animation) {
    this.Animation = animation || null;
}
GenericParticleFactory.prototype.GetParticle = function (p, min_life_span, max_life_span, min_x, min_y, max_x, max_y) {
    return new Particle(p, min_life_span, max_life_span, min_x, min_y, max_x, max_y, this.Animation);
}

function Particle(p, min_life_span, max_life_span, min_x, min_y, max_x, max_y, animation) {
    this.base = GameObject;	
    this.base( p );

    //reset values
    this.InitialPosition = p;
    this.LifeSpan = randomXToY(min_life_span, max_life_span);
    this.CurrentAnimation = animation;
    this.MinimumX = min_x;
    this.MinimumY = min_y;
    this.MaximumX = max_x;
    this.MaximumY = max_y;
    

    this.Rotation = 0; // not yet used!
    this.Life = 0;

    this.init();
}
Particle.prototype = new GameObject;
Particle.prototype.init = function () {
    this.Life = this.LifeSpan;
    this.Position = this.InitialPosition;
    this.Velocity = new Vector3d(randomXToY(this.MinimumX, this.MaximumX, true), randomXToY(this.MinimumY, this.MaximumY, true), 0);
}
Particle.prototype.update = function (dt, backBufferContext2D, xScroll, yScroll) {

    if (this.Position.y > backBufferContext2D.canvas.height)
        this.Life = 0;

    if (this.Life < 1) {
        this.RemoveMe = true;
    }
    else {
        this.Position = this.Position.Add(this.Velocity);
        this.Rotation += 5;
        this.Life--;
    }
}