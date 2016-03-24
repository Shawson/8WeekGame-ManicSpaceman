/*!
* Generic Game Sound Manager
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

// this class is still in early development stage

// 2010.07.15SY - loop disabled as, at present, there is no way to reliably loop sounds without there being a break inbetween loop cycles.  gash.
function SoundManager() {
    this.Channels = new Array();
}
SoundManager.prototype.PlaySound = function (sound, loop, volume) {
    //is this sound already loaded into the stack?
    for (var i = 0; i < this.Channels.length; i++) {
        if (this.Channels[i].currentSrc == sound.currentSrc && this.Channels[i].ended) {
            if (volume) this.Channels[i].volume = volume;
            this.Channels[i].play();
            return;
        }
    }

    // https://developer.mozilla.org/en/CloneNode
    var new_id = this.Channels.length;
    this.Channels[new_id] = sound.cloneNode(true); // perform a deep copy so we get a totally seperate instance of the sound!
    if (volume) this.Channels[new_id].volume = volume;
    this.Channels[new_id].play();
}

SoundManager.prototype.StopAll = function () {
    for (var i = 0; i < this.Channels.length; i++) {
        if (this.Channels[i] != null) 
            this.Channels[i].pause();
    }
}