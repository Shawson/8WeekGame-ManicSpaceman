/*!
* Manic Spaceman Level Class
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
function Level(string_data, obj_fact, w, h, skip_rows) {
	this.levelData = string_data;
	this.levelName = '';
	this.levelTimeLimit = 0;
	
	this.tileSpacingWidth = w;
	this.tileSpacingHeight = h;
	
	this.headerOffset = skip_rows;
				
	this.arrayData = new Array();
	
	this.GameTiles = new Array();
	this.GameObjectFactory = obj_fact;
	
	var rows = this.levelData.split('\n');

	// load the level into a 2d character array..
	for (var y=0; y < rows.length; y++) {
	
		switch (y) {
			case 0:
				this.levelName = rows[y].toString();
				break;
			case 1:
				this.levelTimeLimit = rows[y];
				break;
			default :
				line = rows[y];
				row = new Array();
				for (var x=0; x < line.length; x++)
				{
					row[row.length] = line[x];
					o = this.GameObjectFactory.GetGameObject(line[x], x, y - this.headerOffset); // the grid x & y, not the actual x & y
                    // real positions are decided by the factory..

					if (o != null) {
						this.GameTiles[this.GameTiles.length] = o;
					}
				}
				this.arrayData[this.arrayData.length] = row;
		}
	}
}