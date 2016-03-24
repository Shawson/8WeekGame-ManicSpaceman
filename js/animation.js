/*!
* Manic Spaceman Animation Sprite Class
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
/* for a sequence of animation frames in a sprite sheet */
function Animation(img, frameCount, loop, fps, reversed) {

	// http://www.slideshare.net/kliehm/standardsnext-canvas-1651377

	this.fps = fps;
	this.currentFrame = 0;
	this.frameCount = frameCount;
	this.loop = loop;
	this.flipX = false;
	this.reversed = reversed || false;

	this.timeBetweenFrames = 0;
	this.timeSinceLastFrame = 0;
	this.image = img;

	/* internal calcs */
	if (this.frameCount > 0)
		this.gridW = this.image.width / this.frameCount;
	else
		this.gridW = this.image.width;
		
	if (reversed) // if we're going backwards, start at the end..
		this.currentFrame = this.frameCount - 1;
		
	this.gridH = this.image.height;
	this.timeBetweenFrames = 1 / fps;
	this.timeSinceLastFrame = this.timeBetweenFrames;


}
Animation.prototype.DrawFrame = function (context, x, y, gameTime, frameNumber) {
	context.save();
	context.translate(x, y);

	if (this.flipX) {
		context.save();
		context.scale(-1, 1);
		context.translate(-this.gridW, 0);
	}

	// https://developer.mozilla.org/en/Canvas_tutorial/Using_images
	context.drawImage(this.image, this.gridW * frameNumber, 0, this.gridW, this.gridH, 0, 0, this.gridW, this.gridH);

	if (this.flipX) {
		context.restore();
	}

	context.restore();
}
Animation.prototype.DrawNextFrame = function (context, x, y, gameTime) {

	this.DrawFrame(context, x, y, gameTime, this.currentFrame);

	this.timeSinceLastFrame -= gameTime;

	if (this.frameCount > 0) {
		if (this.timeSinceLastFrame <= 0) {
			this.timeSinceLastFrame = this.timeBetweenFrames;

			if (this.loop || (!this.reversed && this.currentFrame + 1 != this.frameCount) || (this.reversed && this.currentFrame > 0)) {
				if (this.reversed) {
					this.currentFrame--;
					if (this.currentFrame == 0)
						if (this.loop)
							this.currentFrame = this.frameCount - 1;
						else
							return false; // end of sequence

				}
				else {
					this.currentFrame++;
					if (this.currentFrame == this.frameCount)
						if (this.loop)
							this.currentFrame = 0;
						else
							return false; // end of sequence
				}
			}

		}
	}

	return true; // indicates more to come...
};