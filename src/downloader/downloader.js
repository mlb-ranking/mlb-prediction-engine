"use strict";

import QueueDownloads from './queueDownloads.js'
import Download from './download.js'
import Debug from '../util/debugger.js'

import basicrequest from 'request';
import torrequest from 'torrequest';
import fsp from 'fs-promise'; 
import md5 from 'md5';

/**
 * Downloader Instance
 *
 * @description
 * Create an async file downloader. That can be run and stopped by maintaining a JSON file 
 * with download status of each file to be downloaded. 
 * 
 * @param {String or Array}  files   Either an array of urls or a json file location
 * @param {Object} options configuration options
 */
function Downloader(files = [], options = {}){
    this.options = Object.create(Downloader.prototype.options);
    this.options = Object.assign(this.options, options);

    //Initialize Properties
    this.urlsMap = new Map(); //Access the downloads via the md5 of the url

    if(Array.isArray(files)){
        this.createDownloads(files); 
    }
    else{ 
        this.parseDownloaderFile(files); 
    }

}

//Configuration 
Downloader.prototype.options = {
    debug: 'true',
    downloaderFileLoc: '_downloader.json',      //Should override
    downloadsDestination: '_downloads/',        //Should override
    maxConcurrentRequests: 50,
    timeBetweenRequests: 500,
    breakInterval: 100000,                      //At every breakInterval pause parsing
    breakTime: 100000,                          //Time paused parsing
    useTor: false,                              //Route traffic through tor 
    requestConfig:{
        torHost: "localhost",
        torPort: 9050,
        timeout: 30000                           //Stop trying to download if the timeout exceeds this
    },
    metadata: {                                 //Meta-data to be written to the downloader.json file

    }
};



/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|   -startDownloading(options) start downloading the urls
|   -addPage(url) add another page to the urls 
*/

//Activate all downloads
Downloader.prototype.startDownloading = function(options = {update: false}){
    this.options.update = options.update; 
    this.concurrentRequests = 0; 
    this.downloadQueue = new QueueDownloads(this.options.timeBetweenRequests); 

    for(let download of this.downloads){
        this.startDownload(download);
    }
}

//Add a new page
Downloader.prototype.addPage = function(url, options = {}){
    options = Object.assign({updateJSON: false, addDuplicates: false}, options);
    let hash = md5(url); 

    if(!this.urlsMap.has(hash) || options.addDuplicates){
        let download = new Download(url); 
        this.urlsMap.set(hash, download);
        this.downloads.push(download);
        if(options.updateJSON) this.writeDownloaderFile();
    }
    else{
        this.debugOut(`DUPLICATE URL - The url "${url}" has already been added! Skipping.`)
    }
}

//Reset all of the Download objects & update the json file
Downloader.prototype.clean = function(){
    //Copy the old file
    
    
    let oldFile = '_downloader.json'; 
    let meta = {cleaned: true, oldJSON: oldFile};

    for(let download of this.downloads){
        let url = download.url;
        download = new Download(url, meta); //Replace the object with a new one
    }
    
    this.writeDownloaderFile();
}



/*
|--------------------------------------------------------------------------
| Internal API - Just organizational difference 
|--------------------------------------------------------------------------
|   - startDownload(download) - check if this download should be downloaded then trigger the request 
|   - loadDownloaderFile() 
|   - writeDownloaderFile() 
|   - createDownloads(urls) - create all of the download objects 
|   - finish(properties) - tasks when everything is completed
*/

//Base Start Download
Downloader.prototype.startDownload = function(download){
    //Check Download to see if we should start
    
    if(this.shouldDownload(download)){
        // if(this.debugLevel > 1) console.log('[DOWNLOADER - STARTED]');
        this.downloaderDebug(`Started Download`);

        this.concurrentRequests++;

        download.start();   //Setup some properties

        let requestConfig = Object.create(this.options.requestConfig);
        requestConfig.url = download.url; 
        //Figure out a way to handle redirects as errors by editing the configObj
        
        return new Promise((resolve, reject) => {
            this.request(requestConfig, (err, response, contents) => {
                if(!err){
                    this.downloaderDebug('Finished Download');
                    this.downloadedHandler(true, download, contents);
                    this.concurrentRequests--;
                    resolve(true);
                }
                else{
                    this.errorOut(`Request Failed ${err}`);
                    this.downloadedHandler(false, download); 
                    this.concurrentRequests--;
                    reject(false);
                }
            });
        });
    }
     
}





//Read and load the _downloader.json file
Downloader.prototype.loadDownloaderFile = function(){

}

//Update the _downloads.json file
Downloader.prototype.writeDownloaderFile = function(){
    //Write options.metadata
}

//Generate all of the downloads objects
Downloader.prototype.createDownloads = function(urls){
    this.downloads = [];

    for(let url of urls){
        this.addPage(url, {updateJSON: false}); 
    }
}

//Update the download file and add additional meta data
Downloader.prototype.finish = function(properties = {}){
    properties = Object.assign({}, properties);

    this.finishHook(properties);
}

//Parse the downloader.json and add it to this instance 
Downloader.prototype.parseDownloaderFile = function(downloaderFileLoc){
    //Update options from the parser file
    this.options.downloaderFileLoc = downloaderFileLoc;
    this.options.downloadsDestination = 'tities/';

}

//What to do with the downloaded file
Downloader.prototype.downloadedHandler = function(status, download, filecontents = '', writeToFile = true){
    download.finish(status);
    if(status == true){ 
        let meta = {};
        meta.contentsHashMD5 = md5(filecontents); 
        
        if(writeToFile === true){
            meta.fileLocation = 'location/of/file'; //Not sure what to do here
        }

        download.addProps(meta);
    }

    download = this.downloadedHandlerHook(status, download, filecontents);   //Hook in to do more tasks 
    this.debugOut(download);

    return download; 
}



//Determines if we should kick off a request for this Download
Downloader.prototype.shouldDownload = function(download){
    if(download.isDownloaded() || download.isDownloading()){
        return false; 
    }
    else{
        if(this.concurrentRequests >= this.options.maxConcurrentRequests){
            this.downloaderDebug('MAX REQUESTSION - Max requests achieved. Will try again.')

            let downloadLater = this.startDownload.bind(this, download);
            this.downloadQueue.add(download.url, downloadLater);
            return false; 
        }
        return true; 
    }
}

//Debuggers
Downloader.prototype.alwaysOut = Debug.prototype.levelCreator(3, 0,{always: true, colorOverride: 'cyan', prefix: '[GENERAL] '});
Downloader.prototype.debugOut = Debug.prototype.levelCreator(3, 1,{});
Downloader.prototype.infoOut = Debug.prototype.levelCreator(3, 2,{});
Downloader.prototype.allOut = Debug.prototype.levelCreator(3, 3,{});
Downloader.prototype.errorOut = Debug.prototype.levelCreator(3, 1,{error: true, prefix: '[ERROR] ', always: true, colorPrefixOnly: false});

Downloader.prototype.downloaderDebug = Debug.prototype.levelCreator(3, 1,{prefix: '[DOWNLOADER] '});
Debug.prototype.updateLevel(4);


/*
|--------------------------------------------------------------------------
| Getters
|--------------------------------------------------------------------------
|
*/
Object.defineProperty(Downloader.prototype, "request", {
    get: function request() {
        if(!this.requestType){
            if(this.options.useTor) this.requestType = torrequest;
            else this.requestType = basicrequest;
        }
        return this.requestType;  
    }
});

Object.defineProperty(Downloader.prototype, "debug", {
    get: function debug() {
        return this.options.debug; 
    }
});

Object.defineProperty(Downloader.prototype, "debugLevel", {
    get: function debug() {
        return (this.options.debugLevel) ? this.options.debugLevel : (this.debug) ? 1 : 0;  
    }
});

/*
|--------------------------------------------------------------------------
| Hooks
|--------------------------------------------------------------------------
|
*/

//Can perform additional tasks after a file is downloaded 
Downloader.prototype.downloadedHandlerHook = function(status, download, filecontents){
    return download; 
}

Downloader.prototype.finishHook = function(options){
    return download; 
}




/*
|--------------------------------------------------------------------------
| Private
|--------------------------------------------------------------------------
|
*/




/*
|--------------------------------------------------------------------------
| Testing and Debug
|--------------------------------------------------------------------------
|
*/
let downloader = new Downloader(
    ['https://www.google.com/', 
    'https://www.google.com/', 
    'http://www.baseball-reference.com/route.cgi?player=1&mlb_ID=623406',  
    'http://motherfuckingwebsite.com/'], 
    {
        debugLevel: 2,
        useTor: false, 
        maxConcurrentRequests: 1
    }
);

downloader.startDownloading();


module.exports = Downloader;