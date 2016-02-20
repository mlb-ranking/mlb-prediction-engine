"use strict";

import QueueDownloads from './queueDownloads.js'
import Download from './download.js'
import Debug from '../util/debugger.js'
import simpleout from '../util/logger.js'

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
    debug: true,
    downloaderFileLoc: 'data/_downloader.json',      //Should override
    downloadsDestination: './_downloads/pages',        //Should override
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
    this.infoOut('Starting Downloading');
    this.infoOut(this);
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
    this.infoOut('"Downloader.json" file being cleaned' ,{prefix: '[CLEANER] '});

    //Backup the old file
    
    let oldFile = '_downloader.json'; 
    let meta = {cleaned: true};
    this.options.metadata.oldJSON = oldFile; 

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
                    this.writeDownloaderFile();
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

//Parse the downloader.json and update this instance (Only needs to have a property called downloads that contain URL properties)
Downloader.prototype.parseDownloaderFile = function(downloaderFileLoc){
    // this.options.downloaderFileLoc = downloaderFileLoc;
    this.infoOut(this.options.downloaderFileLoc);

    // this.infoOut(this.loadDownloaderFile());
    // let promise = this.loadDownloaderFile();
    
    //
    this.loadDownloaderFile()
        .then((json)=>{
            this.infoOut("Parsing JSON File");
            json = JSON.parse(json)
            this.infoOut(json, 4);

            //Sync this instance
            if(json.options instanceof Object){
                let opt = Object.assign({}, this.options.__proto__, this.options, json.options);
                this.options = opt; 
                this.infoOut(opt);
            }
            if(json.downloads){
                
            }

        })
        .catch(err => this.errorOut(err));

    //Update Options 


    // Download.prototype.createFromJSON()
}

//Read and load the _downloader.json file
Downloader.prototype.loadDownloaderFile = function(){
    let filename = this.options.downloaderFileLoc;
    this.fileSystemDebug(`Loading downloader JSON file from ${filename}.`);

    // return fsp.readFile(filename);
    return fsp.readFile(filename)
        .then((data)=>{
            this.fileSystemDebug('JSON file finished reading')
            // this.infoOut(JSON.parse(data), 5);
            return data
        })
        .catch((err) => this.errorOut(err));
}



//Write to the downloader json file
Downloader.prototype.writeDownloaderFile = function(){
    let filename = this.options.downloaderFileLoc;
    this.fileSystemDebug(`Writing downloader JSON File to ${filename}.`);

    let json = {
        options: Object.assign({}, this.options.__proto__, this.options),
        downloads: {}
    };

    for(let download of this.downloads){
        json.downloads[md5(download.url)] = download;
    }

    return fsp.writeFile(filename, JSON.stringify(json, null, 2))
        .then(() => this.fileSystemDebug('JSON file finished writing'))
        .catch(err => this.errorOut(err));
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
            this.downloaderDebug('MAX REQUESTS - Max requests achieved. Will try again.')

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

Downloader.prototype.fileSystemDebug = Debug.prototype.levelCreator(3, 2,{prefix: '[FILESYSTEM] ', colorOverride: 'cyan'});
Downloader.prototype.downloaderDebug = Debug.prototype.levelCreator(3, 1,{prefix: '[DOWNLOADER] '});
Debug.prototype.updateLevel(3); //DEBUG LEVEL



/*
|--------------------------------------------------------------------------
| Getters
|--------------------------------------------------------------------------
|
*/

//Allow regular and tor requests
Object.defineProperty(Downloader.prototype, "request", {
    get: function request() {
        if(!this.requestType){
            if(this.options.useTor) this.requestType = torrequest;
            else this.requestType = basicrequest;
        }
        return this.requestType;  
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
        downloaderFileLoc: './data/baseballref/urls.json',
        downloadsDestination: './data/baseballref/pages/',
        debugLevel: 2,
        useTor: false, 
        maxConcurrentRequests: 1
    }
);

// downloader.parseDownloaderFile('')

downloader.startDownloading();
// downloader.loadDownloaderFile();
// 
// 

// let downloadJSON = {"downloaded": true,
//       "downloading": false,
//       "url": "https://www.google.com/",
//       "attempts": 1,
//       "startedAt": "2016-02-15T10:25:00.049Z",
//       "completedAt": "2016-02-15T10:25:00.341Z",
//       "contentsHashMD5": "a1eee6fc1000797bc18ba4b85cfb2aaa",
//       "fileLocation": "location/of/file"};

// let downloadFromJson = Download.prototype.createFromJSON(downloadJSON);


module.exports = Downloader;