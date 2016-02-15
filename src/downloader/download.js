"use strict";

function Download(url, props = {}){
    this.downloaded = false;
    this.downloading = false; 
    this.url = url;
    this.attempts = 0; 

    this.addProps(props); 
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




module.exports = Download;