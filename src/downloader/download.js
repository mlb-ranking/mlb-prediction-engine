"use strict";

import Debug from '../util/debugger.js'

function Download(url, props = {}){
    Download.prototype.count++;
    this.infoOut('Download Object Created');

    this.downloaded = false;
    this.downloading = false; 
    this.url = url;
    this.attempts = 0; 

    this.addProps(props); 
}

Download.prototype.count = 0;

Download.prototype.createFromJSON = function(jsonObj, props = {}){
    Download.prototype.count++;

    let download = Object.create(Download.prototype); 
    Object.assign(download, jsonObj);
    download.addProps(props); 
    return download; 
}

Download.prototype.isDownloaded = function(){
    return this.downloaded;
}

Download.prototype.isDownloading = function(){
    return this.downloaded;
}

Download.prototype.start = function(properties = {}){
    this.addProps(properties); 
    this.startedAt = new Date(); 
    this.attempts++;
}

Download.prototype.finish = function(success, properties = {}){
    if(success){
        this.downloaded = true; 
        this.downloading = false;
        this.completedAt = new Date(); 
    }
    else{
        this.failed = true; 
        this.downloading = false;
        this.downloaded = false;
    }

    this.addProps(properties); 
     
}

Download.prototype.addProps = function(properties){
    for(let property in properties){
        this[property] = properties[property];
    }
}

//Debuggers
Download.prototype.infoOut = Debug.prototype.levelCreator(3, 3,{colorOverride: 'cyan', prefix: '[DOWNLOAD OBJECT] '});



module.exports = Download;