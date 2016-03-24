/*!
* Generic Game Resource Loader and Manager Class
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

function ResourceLoader() {
    this.loadcount = 0;
    this.objects = new Array();
    this.urls = new Array();
	this.handles = new Array();
}
ResourceLoader.prototype.AddImage = function (url, handle) {
    this.loadcount++;
    var i = this.objects.length;
    this.urls[i] = url;
	this.handles[i] = '' + handle;

    loader = this;
    
    this.objects[i] = new Image();
    this.objects[i].onload = function () {
        loader.loadcount--;
    }
    this.objects[i].src = url;
}
ResourceLoader.prototype.AddSound = function (url, handle) {
    this.loadcount++;
    var i = this.objects.length;
    this.urls[i] = url;
	this.handles[i] = '' + handle;

    loader = this;
	
	// http://www.whatwg.org/specs/web-apps/current-work/#mediaevents
	// http://api.jquery.com/bind/
	
	this.objects[i] = new Audio();
	$(this.objects[i]).bind('canplaythrough', function() { // totally loaded

	  loader.loadcount--;
	});

	this.objects[i].src = url;
	this.objects[i].load();	
}
ResourceLoader.prototype.AddText = function (url, handle) {
    this.loadcount++;
    var i = this.objects.length;
    this.urls[i] = url;
	this.handles[i] = '' + handle;

    loader = this;
    this.objects[i] = url;
    $.ajax({
        url: url,
        success: function (data, textStatus, XMLHttpRequest) {
            loader.SetObject(this.url, data);
            loader.loadcount--;
        },
        async: true,
        type: 'GET'
    });
}
ResourceLoader.prototype.FindObject = function (url) {
    //find the index in the url's array
    for (var i = 0; i < this.urls.length; i++)
        if (this.urls[i] == url)
            return i;

    return -1;

}
ResourceLoader.prototype.FindObjectByHandle = function (handle) {
    //find the index in the url's array
    for (var i = 0; i < this.handles.length; i++)
        if (this.handles[i] == handle)
            return i;

    return -1;

}
ResourceLoader.prototype.GetObject = function (url) {
    var index = this.FindObject(url);

    if (index > -1)
        return this.objects[index];

    alert(url + ' not loaded');
    return null;
}
ResourceLoader.prototype.GetObjectByHandle = function (handle) {
    var index = this.FindObjectByHandle(handle);

    if (index > -1)
        return this.objects[index];

    alert(handle + ' not found');
    return null;
}
ResourceLoader.prototype.SetObject = function (url, o) {
    var index = this.FindObject(url);

    if (index > -1) {
        this.objects[index] = o;
        return true;
    }

    return false;
}