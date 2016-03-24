/*!
* Manic Spaceman Core Game Class
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
function ManicMinerGame(canvasWidth, canvasHeight, canvasId) {
	this.base = Game;
	this.base(canvasWidth, canvasHeight, canvasId);

	this.KeysCollected = 0;
	this.KeysNeeded = 0;
	
	this.GodMode = false;
	this.NightMode = false;
	
	this.StartTime = null;
	this.TimerBonus = 0;

	// game state flags we need for intro's/ death anims etc
	this.backgroundframe = 0;
	this.LevelFrame = 0;
	this.IsPlayingIntro = true;
	this.IsPlayingLevelCompleted = false;
	this.IsPlayingDeath = false;
	this.IsDeathAnimSet = false;
	this.MusicStarted = false;

	// store references to common elements we need in the game
	this.Torch = null;
	this.TorchBackwards = null;
	this.Stars = null;
	this.Moon = null;
	this.MiniMoon = null;
	this.Atmosphere = null;
	this.HudTimerSurround = null;
	this.HudTimerSurroundUrgent = null;
	this.HudTimerPips = null;
	this.HudHeart = null;
	this.AmbientSound = null;
}
ManicMinerGame.prototype = new Game;
ManicMinerGame.prototype.InitMainMenu = function () {
	this.GameState = GAME_STATE_MENU;
	this.context2D.drawImage(this.ResourceManager.GetObject('gfx/Splash.jpg'), 0, 0, 800, 425);
}
ManicMinerGame.prototype.LevelLoadComplete = function () {
	//count the keys
	this.KeysCollected = 0;
	this.KeysNeeded = 0;
	this.LevelFrame = 0;
	this.StartTime = new Date().getTime();
	this.IsPlayingLevelCompleted = false;

	for (var i = 0; i < this.gameObjects.length; i++) {
		if (this.gameObjects[i] instanceof Key) {
			this.KeysNeeded++;
		}
	}

	// night mode if the name has night in it
	if (this.CurrentLevelName.toLowerCase().indexOf("night") != -1)
		this.NightMode = true;
	else
		this.NightMode = false;

	// create references to the assets we're gonna need..
	this.SetReferences();

	if (!this.MusicStarted) {
		this.SoundManager.PlaySound(this.AmbientSound, true);
		this.MusicStarted = true;
	}
}
ManicMinerGame.prototype.SetReferences = function () {

	if (!this.NightMode) {
		this.Stars = this.ResourceManager.GetObject('gfx/stars.jpg');
		this.Moon = this.ResourceManager.GetObject('gfx/moon.png');
		this.MiniMoon = this.ResourceManager.GetObject('gfx/mini-moon.png');
		this.Atmosphere = this.ResourceManager.GetObject('gfx/atmosphere.png');
	}
	else {
		this.Stars = this.ResourceManager.GetObject('gfx/stars-night.jpg');
		this.Torch = this.ResourceManager.GetObject('gfx/torch.png');
		this.TorchBackwards = this.ResourceManager.GetObject('gfx/torch-reverse.png');
}

	this.HudTimerSurround = this.ResourceManager.GetObject('gfx/hud-timer-surround.gif');
	this.HudTimerSurroundUrgent = this.ResourceManager.GetObject('gfx/hud-timer-surround-urgent.gif');
	this.HudTimerPips = this.ResourceManager.GetObject('gfx/hud-timer-pips.gif');
	this.HudHeart = this.ResourceManager.GetObject('gfx/hud-heart.gif');

	//this.AmbientSound = this.ResourceManager.GetObjectByHandle('music' + randomXToY(1, 3, false));
	this.AmbientSound = this.ResourceManager.GetObjectByHandle('music1');
}


ManicMinerGame.prototype.LevelCompleted = function () {
	// was that the last level?
	Game.prototype.LevelCompleted.apply(this, arguments);

	this.PlayerReference.CurrentAnimation = new Animation(this.ResourceManager.GetObject('gfx/sam-transport-26frames.png'), 26, false, 15);
	this.PlayerReference.TextureOffset = new Vector2d(0, -149);

	this.LevelFrame = 0;
	this.IsPlayingLevelCompleted = true;
	this.SuspendUpdates = true;

	this.TimerBonus = Math.floor((this.CurrentLevelTimeLimit - (new Date().getTime() - this.StartTime)) / 10);
	this.Score += this.TimerBonus;

	this.SoundManager.PlaySound(this.ResourceManager.GetObjectByHandle('transporter'));
}
ManicMinerGame.prototype.PlayerDied = function () {
	if (!this.IsPlayingDeath && !this.GodMode) {
		this.LevelFrame = 0;
		this.SuspendUpdates = true;

		this.IsPlayingDeath = true;
		this.SoundManager.PlaySound(this.ResourceManager.GetObjectByHandle('die'));
	}
	return;
}

ManicMinerGame.prototype.InitGameOver = function () {
	this.SoundManager.StopAll();
	this.SoundManager.PlaySound(this.ResourceManager.GetObjectByHandle('dead'));
	this.context2D.drawImage(this.ResourceManager.GetObject('gfx/GameOver.jpg'), 0, 0, 800, 400);
}
ManicMinerGame.prototype.InitGameBeaten = function () {
	this.SoundManager.StopAll();
	//show some high scores or something..
	this.backBufferContext2D.drawImage(this.ResourceManager.GetObject('gfx/GameComplete.jpg'), 0, 0, 800, 425);
	
	//show the final score
	this.backBufferContext2D.font = 'bold 16px courier';
	var text = 'SCORE : ' + this.Score.toString();
	var metrics1 = this.backBufferContext2D.measureText(text);
	this.backBufferContext2D.fillStyle = "#0f0";
	this.backBufferContext2D.fillText(text, 76, 120);
}

ManicMinerGame.prototype.ResetCanvas = function () {
	// draw a background
	this.backgroundframe++;

	this.backBufferContext2D.drawImage(this.Stars, 0, 0, 800, 400);  
	
	if (!this.NightMode) {
		this.backBufferContext2D.drawImage(this.MiniMoon, 600 - this.backgroundframe / 7, 120 - this.backgroundframe / 32, 101, 101);
		this.backBufferContext2D.drawImage(this.Moon, this.backgroundframe / 8 - 150, 60 + this.backgroundframe / 16, 461, 443);
		this.backBufferContext2D.drawImage(this.Atmosphere, 0, 0, 800, 400);
	}
}
ManicMinerGame.prototype.CanvasPostRender = function () {
	if (this.NightMode) {
		//draw the torch overlay.
		var p = this.PlayerReference.Position;

		if (this.PlayerReference.CurrentAnimation.flipX)
			this.backBufferContext2D.drawImage(this.Torch, p.x - 780, p.y - 360, 1600, 800);
		else {
			this.backBufferContext2D.drawImage(this.TorchBackwards, p.x - 780, p.y - 360, 1600, 800);
		}
	}

	// draw the black base for the hud
	this.backBufferContext2D.fillStyle = "#000";
	this.backBufferContext2D.fillRect(0, 400, this.backBuffer.width, 25);

	if (this.IsPlayingIntro) {
		this.SuspendUpdates = true;
		this.TickLevelIntro();
	}
	else {
		this.DrawHUD(this.IsPlayingLevelCompleted);
		if (this.IsPlayingLevelCompleted)
			this.TickLevelCompleted();
		if (this.IsPlayingDeath)
			this.TickDeath();
	}

	return;
}
ManicMinerGame.prototype.DrawHUD = function (complete) {
	var pc_comp = 1 - ((new Date().getTime() - this.StartTime) / this.CurrentLevelTimeLimit);

	if (pc_comp > .15)
		this.backBufferContext2D.drawImage(this.HudTimerSurround, 0, 400, 550, 25);
	else {
		this.backBufferContext2D.drawImage(this.HudTimerSurroundUrgent, 0, 400, 550, 25);
		// start warning beep?
	}
	
	// draw the timer
	var bar_width = 536 * pc_comp;

	if (!complete && bar_width > 0)
		this.backBufferContext2D.drawImage(this.HudTimerPips, 0, 0, bar_width, 25, 7, 400, bar_width, 25);

	// draw the lives
	for (var i = 0; i < this.Lives; i++)
		this.backBufferContext2D.drawImage(this.HudHeart, 550 + (25 * i), 400, 25, 25);

	// draw the score
	this.backBufferContext2D.font = 'bold 16px courier';
	var text = ':' + this.Score.toString();
	var metrics1 = this.backBufferContext2D.measureText(text);
	this.backBufferContext2D.fillStyle = "#0f0";
	this.backBufferContext2D.fillText(text, 800 - metrics1.width - 10, 405);

	return;
}
ManicMinerGame.prototype.TickLevelIntro = function () {
	var alpha = 1.0;
	var intro_frames = 60;

	if (this.LevelFrame > intro_frames) {
		alpha = 1.0 - (this.LevelFrame - intro_frames) / 50;
	}

	this.backBufferContext2D.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
	this.backBufferContext2D.fillRect(0, 0, this.backBuffer.width, this.backBuffer.height);


	this.backBufferContext2D.font = 'bold 16px courier';
	this.backBufferContext2D.textBaseline = 'top';

	if (this.LevelFrame > this.CurrentLevelName.length) {
		this.backBufferContext2D.fillStyle = "rgba(0, 255, 0, " + alpha + ")";
		var metrics1 = this.backBufferContext2D.measureText(this.CurrentLevelName);
		this.backBufferContext2D.fillText(this.CurrentLevelName, 500, 320);
		if (this.LevelFrame % 4)
			this.backBufferContext2D.fillText("_", 500 + metrics1.width, 320);
	}
	else {
		var text = this.CurrentLevelName.substring(0, this.LevelFrame - 2);

		var metrics1 = this.backBufferContext2D.measureText(text);
		this.backBufferContext2D.fillStyle = "rgba(0, 255, 0, " + alpha + ")";
		this.backBufferContext2D.fillText(text, 500, 320);

		text = this.CurrentLevelName.substring(this.LevelFrame - 2, this.LevelFrame) + "_";

		this.backBufferContext2D.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
		this.backBufferContext2D.fillText(text, 500 + metrics1.width, 320);
	}

	if (alpha < 0) {
		this.IsPlayingIntro = false;
		this.SuspendUpdates = false;
		this.StartTime = new Date().getTime();
	}

	this.LevelFrame++;
}
ManicMinerGame.prototype.TickLevelCompleted = function () {
	this.LevelFrame++;

	// draw the timer bonus score
	this.backBufferContext2D.fillStyle = 'rgba(0, 255, 0, ' + (1 - (this.LevelFrame / 100)).toString() + ')';
	this.backBufferContext2D.font = 'bold 24px courier';
	this.backBufferContext2D.fillText(this.TimerBonus.toString(), 20, 360 - this.LevelFrame);


	if (this.LevelFrame > 100) {  // go to the next level!
		this.IsPlayingIntro = true;
		if (this.LevelManager.CurrentLevel == this.LevelManager.Levels.length) {
			this.GameState = GAME_STATE_GAME_COMPLETE;
			this.InitGameBeaten();
		}
		else {
			this.MusicStarted = false;
			this.SoundManager.StopAll();
			this.InputManager.Reset();
			this.SuspendUpdates = false;
			
			// load the next level
			this.NextLevel();
		}
	}
}
ManicMinerGame.prototype.TickDeath = function () {
	this.LevelFrame++;

	if (!this.PlayerReference.isOnTheGround) // we can't have our guy dying mid air- that would look shit!
		this.PlayerReference.update();
	else if (!this.IsDeathAnimSet) {
		this.PlayerReference.SetDeathAnimation();
		this.IsDeathAnimSet = true;
	}

	if (this.LevelFrame > 50) {
		this.PlayerDead = true;
		this.InputManager.Reset();
		this.SuspendUpdates = false;
		this.IsPlayingDeath = false;
		this.IsDeathAnimSet = false;
	}
}
ManicMinerGame.prototype.GameObjectsUpdated = function () {
	// check the timer hasn't run out!
	if ((new Date().getTime() - this.StartTime) > this.CurrentLevelTimeLimit) {
		this.PlayerDied();
	}
}