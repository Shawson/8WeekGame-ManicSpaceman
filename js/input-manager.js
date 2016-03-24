/*!
* Generic Game Input Manager Class
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
function ManicMinorKeyboardInputManager() {
	this.Reset();
}
ManicMinorKeyboardInputManager.prototype.press = function (e) {
	var KeyID = e.keyCode;
	this.LastKeyPressed = KeyID;
	this.LastActivity = new Date().getTime();

	switch (KeyID) {
		case 19:  //Keyboard Pause Key
			if (this.Pause)
				this.Pause = false;
			else
				this.Pause = true;
			break;
		case 37: // Left Arrow
			this.Left = true;
			break;
		case 38: // Up Arrow
			this.Up = true;
			this.Jump = true;
			break;
		case 39: // Right Arrow
			this.Right = true;
			break;
		case 40: // Down Arrow
			this.Down = true;
			break;
		case 32: // Space Bar
			this.Jump = true;
		case 13: // return
			this.Start = true;
	}
}
ManicMinorKeyboardInputManager.prototype.release = function (e) {
	var KeyID = e.keyCode;
	this.LastActivity = new Date().getTime();

	switch (KeyID) {
		/* - I want pause to be a toggle!
		case 19:  //Keyboard Pause Key
			this.Pause = false;
			break;
			*/
		case 37: // Left Arrow
			this.Left = false;
			break;
		case 38: // Up Arrow
			this.Up = false;
			this.Jump = false;
			break;
		case 39: // Right Arrow
			this.Right = false;
			break;
		case 40: // Down Arrow
			this.Down = false;
			break;
		case 32: // Space Bar
			this.Jump = false;
		case 13: // return
			this.Start = false;
	}
}
ManicMinorKeyboardInputManager.prototype.Reset = function () {
	this.Up = false;
	this.Down = false;
	this.Left = false;
	this.Right = false;
	this.Jump = false;

	this.Pause = false;
	this.Menu = false;
	
	this.Start = false;

	this.LastKeyPressed = 0;
	this.LastActivity = new Date().getTime();
}