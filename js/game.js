/*!
* Generic Game Core Game Loop Class
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
GAME_STATE_MENU = -1;
GAME_STATE_PAUSE = 0;
GAME_STATE_PLAY = 1;
GAME_STATE_GAME_OVER = 2;
GAME_STATE_GAME_COMPLETE = 3;


function Game(canvasWidth, canvasHeight, canvasId) {
	this.fps = 30;
	this.secondsBetweenFrames = 1 / this.fps;
	
	this.maxFps = 0;
	this.actualFps = 0;
	this.showFps = false;

	this.canvasWidth = canvasWidth || 0;
	this.canvasHeight = canvasHeight || 0;

	this.gameObjects = new Array();

	this.lastFrame = new Date().getTime();

	this.canvasSupported = false;

	this.canvas = null;
	this.context2D = null;

	this.InputManager = null;
	this.LevelManager = null;
	this.ResourceManager = null;
	this.SoundManager = null;

	this.GameState = GAME_STATE_MENU;
	this.SuspendUpdates = false;

	// for double buffering - draw to back buffer, then swap
	this.backBuffer = null;
	this.backBufferContext2D = null;

	this.Lives = 0;
	this.OriginalLives = 0;
	this.Score = 0;
	this.PlayerDead = false;
	this.CurrentLevelName = '';
	this.CurrentLevelTimeLimit = -1;

	this.PlayerReference = null;
	
	this.wireFrame = false;

	//constructor
	if (canvasId)
	{
		this.canvas = document.getElementById(canvasId);
		if (this.canvas.getContext) {
			this.canvasSupported = true;
			this.context2D = this.canvas.getContext('2d');
			this.backBuffer = document.createElement('canvas');
			this.backBuffer.width = this.canvas.width;
			this.backBuffer.height = this.canvas.height;
			this.backBufferContext2D = this.backBuffer.getContext('2d');
		}
	}
}
Game.prototype.draw = function () {
	var thisFrame = new Date().getTime();
	if (this.showFps) this.actualFps = Math.round(1000 / (thisFrame - this.lastFrame));
	var dt = (thisFrame - this.lastFrame) / 1000;
	this.lastFrame = thisFrame;

	if (this.canvasSupported) {
		this.ResetCanvas();

		// first update all the game objects
		if (!this.SuspendUpdates)
			for (var x = 0; x < this.gameObjects.length; ++x)
				if (this.gameObjects[x] != null) 
				{
					if (this.gameObjects[x].RemoveMe)
						this.gameObjects.splice(x,1); // cut out that tile!
	
					if (x > this.gameObjects.length - 1) 
						x = this.gameObjects.length - 1;
						
					if (this.gameObjects[x].update)
						this.gameObjects[x].update(dt, this.backBufferContext2D, this.xScroll, this.yScroll);
				}
				
		this.GameObjectsUpdated();

		// then draw the game objects
		for (var x = 0; x < this.gameObjects.length; ++x) {
			if (this.wireFrame && this.gameObjects[x].CollisionBody != null)
			{
				this.backBufferContext2D.strokeStyle = '#000';
				this.backBufferContext2D.strokeRect(this.gameObjects[x].Position.x + this.gameObjects[x].CollisionBodyOffset.x,this.gameObjects[x].Position.y + this.gameObjects[x].CollisionBodyOffset.y,this.gameObjects[x].CollisionBody.Width,this.gameObjects[x].CollisionBody.Height);
			}

			if (this.gameObjects[x].draw)
				this.gameObjects[x].draw(dt, this.backBufferContext2D, this.xScroll, this.yScroll);
		}

		
		this.CanvasPostRender();
		

		// copy the back buffer to the displayed canvas
		this.context2D.drawImage(this.backBuffer, 0, 0);
	}
	
	if (this.showFps) this.maxFps = Math.round(1000 / (new Date().getTime() - thisFrame)); 
	if (this.showFps) {
		this.context2D.font    =  '20px _sans';
		this.context2D.textBaseline = 'top';
		
		var metrics = this.context2D.measureText('Max FPS : ' + this.maxFps.toString())		
		this.context2D.fillStyle = '#FFF';
		this.context2D.fillRect(20, 20, metrics.width, 20);
	  
		this.context2D.fillStyle = '#000';
		this.context2D.fillText  ( 'Max FPS : ' + this.maxFps  , 20, 20);
		
		metrics = this.context2D.measureText('Actual FPS : ' + this.actualFps.toString())		
		this.context2D.fillStyle = '#FFF';
		this.context2D.fillRect(20, 40, metrics.width, 20);
	  
		this.context2D.fillStyle = '#000';
		this.context2D.fillText  ( 'Actual FPS : ' + this.actualFps  , 20, 40);
	}

	if (this.GameState == GAME_STATE_PLAY && this.InputManager.Pause) // only pause if the game is running!
		this.GameState = GAME_STATE_PAUSE;

	if (this.PlayerDead) {
		this.PlayerDead = false;
		this.Lives -= 1;
		if (this.Lives < 0) {
			this.InitGameOver();
			this.GameState = GAME_STATE_GAME_OVER;
		}
		else {
			// reload the current level to try again
			this.RestartCurrentLevel();
		}
	}

	switch (this.GameState) {
		case GAME_STATE_PLAY:
			game=this;
			var wait = ((this.secondsBetweenFrames * 1000) - (new Date().getTime() - thisFrame + 1)); // 1000;
			setTimeout(function () { game.draw(); }, wait);
			break;
		case GAME_STATE_MENU:
		case GAME_STATE_GAME_OVER:
		case GAME_STATE_GAME_COMPLETE:
		case GAME_STATE_PAUSE:
			game=this;
			setTimeout(function () { game.WaitKeyPress(); }, 100); // wait 10th/second, then try again
			break;
	}
}
Game.prototype.Run = function() {
	this.GameState = GAME_STATE_MENU;
	this.InitMainMenu();
	this.WaitKeyPress();
}
Game.prototype.ResetCanvas = function() {
	this.backBufferContext2D.fillStyle   = '#000'; // black
	this.backBufferContext2D.fillRect (0, 0, this.backBuffer.width, this.backBuffer.height);
}
Game.prototype.CanvasPostRender = function() {
	return;
}
Game.prototype.SetFps = function(val) {
	this.fps = val;
	this.secondsBetweenFrames = 1 / this.fps;
}
Game.prototype.WaitKeyPress = function() {
	switch (this.GameState) {
		case  GAME_STATE_PAUSE:
			if (!this.InputManager.Pause) {
				this.UnPause();
			}
			else
			{
				game=this;
				setTimeout(function () { game.WaitKeyPress(); }, 100); // wait 10th/second, then try again
			}
			break;
		case GAME_STATE_GAME_OVER:
		case GAME_STATE_GAME_COMPLETE:
			if (this.InputManager.LastKeyPressed == 13) {
				this.ResetGame();
				this.InitMainMenu();
			}

			game=this;
			setTimeout(function () { game.WaitKeyPress(); }, 100); // wait 10th/second, then try again
			
			break;
		case GAME_STATE_MENU:
			if (this.InputManager.LastKeyPressed == 13) {
				this.StartGame();
			}
			else
			{
				game=this;
				setTimeout(function () { game.WaitKeyPress(); }, 100); // wait 10th/second, then try again
			}
			break;
	}
	this.InputManager.Reset();
}
Game.prototype.ResetGame = function() {
	this.Score = 0;
	this.Lives = this.OriginalLives;
	this.LevelManager.Reset();
}
Game.prototype.UnPause = function () {
	this.GameState = GAME_STATE_PLAY;
	this.draw();
}
Game.prototype.StartGame = function() {
	this.NextLevel();
	this.GameState = GAME_STATE_PLAY;
	game=this;
	setTimeout(function () { game.draw(); }, 1);    
}

Game.prototype.InitMainMenu = function () {
	// we.. dont have one!
	this.StartGame();
}
Game.prototype.InitGameOver = function() {
	// then do something like show a score or a video of you laughing at them...
}
Game.prototype.InitGameBeaten = function() {
	//show some high scores or something..
}

Game.prototype.LoadGameObjects = function(object_array) {
	for (var i = 0; i < object_array.length; i++) {
		object_array[i].GameReference = g;
		this.gameObjects.push(object_array[i]);

		if (object_array[i] instanceof Player) {
			this.PlayerReference = object_array[i];
		}
	}

	// sort the array on the z axis
	 this.gameObjects = this.gameObjects.sort(gameObjectSorter);

	this.LevelLoadComplete();
}
Game.prototype.LevelLoadComplete = function() {
	return;
}
Game.prototype.RestartCurrentLevel = function() {
	var level = this.LevelManager.ReloadLevel();
	this.CurrentLevelName = level.levelName;
	this.CurrentLevelTimeLimit = level.levelTimeLimit;
	
	this.ClearGameObjects();
	this.LoadGameObjects(level.GameTiles);
}
Game.prototype.NextLevel = function() {
	var level = this.LevelManager.GetNextLevel();
	this.CurrentLevelName = level.levelName;
	this.CurrentLevelTimeLimit = level.levelTimeLimit;
	
	this.ClearGameObjects();
	this.LoadGameObjects(level.GameTiles);
}
Game.prototype.ClearGameObjects = function () {
	this.gameObjects.length = 0;
	this.gameObjects = null;
	this.gameObjects = new Array();    
}
Game.prototype.PlayerDied = function() {
	this.PlayerDead = true;
}
Game.prototype.LevelCompleted = function() {
	return;
}
Game.prototype.GameObjectsUpdated = function() {
	return;
}
Game.prototype.SetLives = function(lives) {
	this.OriginalLives = lives;
	this.Lives = lives;
}

function gameObjectSorter(a, b) {
	return a.Position.z - b.Position.z;
}