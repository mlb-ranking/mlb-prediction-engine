"use strict";

import Debug from '../util/debugger.js'
import md5 from 'md5';

function Download(url, props = {}){
    Download.prototype.count++;
    this.infoOut('Download Object Created');

    this.downloaded = false;
    this.downloading = false; 
    this.url = url;
    this.urlHash = md5(this.url); 
    this.attempts = 0; 

    this.addProps(props); 
}

//Debuggers
Download.prototype.infoOut = Debug.prototype.levelCreator(3, 4,{colorOverride: 'cyan', prefix: '[DOWNLOAD OBJECT] '});

Download.prototype.count = 0;

Download.prototype.createFromJSON = function(jsonObj, props = {}){
    Download.prototype.count++;
    let download = Object.create(Download.prototype); 
    Object.assign(download, jsonObj);
    download.infoOut('Download object created from JSON'); 
    download.addProps(props); 
    if(!download.urlHash)download.urlHash = md5(download.url);
    return download; 
}

Download.prototype.clean = function(){
    this.cleaned = true;
    this.downloaded = false;
    this.downloading = false;
    this.attempts = 0;  

    delete this.startedAt;
    delete this.writtenToFile;
    delete this.completedAt;
    delete this.contentsHashMD5;
    delete this.fileLocation;
}


Download.prototype.isDownloaded = function(){
    return this.downloaded;
}

Download.prototype.isDownloading = function(){
    return this.downloading;
}

Download.prototype.start = function(properties = {}){
    this.infoOut('Start downloading');
    this.addProps(properties); 
    this.startedAt = new Date(); 
    this.attempts++;
    this.writtenToFile = false;
}

Download.prototype.finish = function(success, properties = {}){
    this.infoOut('Finished downloading');
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
    this.infoOut('Adding properties to Download object.');
    for(let property in properties){
        this[property] = properties[property];
    }
}





module.exports = Download;