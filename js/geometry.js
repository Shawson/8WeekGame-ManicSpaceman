/*!
* Generic Game Geometry Classes
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
function Vector2d(x, y) {
	this.x = x;
	this.y = y;
}
Vector2d.prototype.Add = function(v) {
	return new Vector2d(parseFloat(this.x) + parseFloat(v.x), parseFloat(this.y) + parseFloat(v.y));
}
// http://gpwiki.org/index.php/VB:Tutorials:Building_A_Simple_Physics_Engine#Collision_Detection
Vector2d.prototype.Magnitude = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
Vector2d.prototype.Normalize = function () {
	var mag = Math.sqrt(A.X * A.X + A.Y * A.Y)
	if (mag != 0) {
		this.x = this.x / mag;
		this.y = this.y / mag;
	}
}
Vector2d.prototype.DotProduct = function(v) {
	return this.x * v.x + this.y * v.y;
}
Vector2d.prototype.Distance = function(v) {
	return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
}

function Vector3d(x, y, z) {
	this.base = Vector2d;	
	this.base( x, y );
	this.z = z;
}
Vector3d.prototype = new Vector2d;
Vector2d.prototype.Add = function(v) {
	return new Vector3d(parseFloat(this.x) + parseFloat(v.x), parseFloat(this.y) + parseFloat(v.y), parseFloat(this.z) + parseFloat(v.z));
}

/* Rectangle Class - Bare in mind, a rotated rectangle is no longer a rectangle, but a polygon- so this reals only with pure Rectangles */
function Rectangle(p, w, h) {
	this.Position = p; // Vector2d - top left corner
	this.Width = w;
	this.Height = h;
	
	this.HalfWidth = w/2;
	this.HalfHeight = h/2;

	this.Top = p.y;
	this.Right = p.x + w;
	this.Bottom = p.y + h;
	this.Left = p.x;
	
	this.MiddleX = p.x + (w/2);
}
Rectangle.prototype.SetPosition = function(p) {
	this.Position = p;
	this.Top = p.y;
	this.Right = p.x + this.Width;
	this.Bottom = p.y + this.Height;
	this.Left = p.x;
	this.MiddleX = p.x + (this.Width/2);
}
Rectangle.prototype.IntersectDepthVector = function (r) {
	// Calculate centers.
	centerA = new Vector2d(this.Left + this.HalfWidth, this.Top + this.HalfHeight);
	centerB = new Vector2d(r.Left + r.HalfWidth, r.Top + r.HalfHeight);

	// Calculate current and minimum-non-intersecting distances between centers.
	distanceX = centerA.x - centerB.x;
	distanceY = centerA.y - centerB.y;
	minDistanceX = this.HalfWidth + r.HalfWidth;
	minDistanceY = this.HalfHeight + r.HalfHeight;

	// If we are not intersecting at all, return (0, 0).
	if (Math.abs(distanceX) >= minDistanceX || Math.abs(distanceY) >= minDistanceY)
		return new Vector2d(0,0);

	// Calculate and return intersection depths.
	depthX = distanceX > 0 ? minDistanceX - distanceX : -minDistanceX - distanceX;
	depthY = distanceY > 0 ? minDistanceY - distanceY : -minDistanceY - distanceY;
	return new Vector2d(depthX, depthY);
}