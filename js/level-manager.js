/*!
* Generic Game Level Manager Class
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
function LevelManager(manifest_file, resource_manager, objectFactory) {
	this.ManifestFile = manifest_file;
	this.ResourceManager = resource_manager;
	this.ObjectFactory = objectFactory;
	this.CurrentLevel = 0;

	this.Levels = this.ManifestFile.split('\r\n');

}
LevelManager.prototype.GetNextLevel = function () {
    return new Level(this.ResourceManager.GetObject(this.Levels[this.CurrentLevel++]), this.ObjectFactory, 25, 25, 2);
}
LevelManager.prototype.ReloadLevel = function () {
    return new Level(this.ResourceManager.GetObject(this.Levels[this.CurrentLevel - 1]), this.ObjectFactory, 25, 25, 2);
}
LevelManager.prototype.Reset = function () {
	this.CurrentLevel = 0;
}