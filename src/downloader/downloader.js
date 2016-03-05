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
    this.readyToDownload = false;
    this.downloadingInProgress = false;  
    this.readyToDownloadPromise = null; 
    this.downloads = [];
    this.urlsMap = new Map(); //Access the downloads via the md5 of the url
    this.allPromises = new Map(); 
    this.fileSystemIO = 0;
    this.downloadQueue = new QueueDownloads(this.options.timeBetweenRequests);
    this.concurrentRequests = 0; 
    this.downloadsFinished = 0;
    this.fileSystemIO = 0;
    this.finishedPromise = false; 

    if(Array.isArray(files)){
        this.infoOut('Initializing Downloader from files array');
        this.createDownloads(files); 
        this.readyToDownload = true; 
        this.readyToDownloadPromise = Promise.resolve();
    }
    else{
        this.infoOut('Initializing Downloader from JSON file');
        this.readyToDownloadPromise = this.parseDownloaderFile(files)
            .then(() => {
                //Override JSON file argument options
                this.options = Object.assign(this.options, options);
            }); 
    }

}

//Configuration 
Downloader.prototype.options = {
    downloaderFileDir: './',                              
    downloaderFileBackupDir: './',    
    downloaderFileLoc: 'data/_downloader.json',      
    downloadsDestination: './_downloads/pages/',        //Should override & file must exist 
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
Downloader.prototype.startDownloading = function(options = {}){
    if(this.readyToDownload === false) {
        this.errorOut('Not Ready to download'); 
        throw new Error('Not Ready to download');
    }

    Object.assign(this.options, options);



    //Create backup
    if(this.options.backup !== false) this.createBackupDownloaderFile();

    //Begin all of the downloads
    this.infoOut('Starting global download process!');
    this.downloadingInProgress = true; 


    for(let download of this.downloads){
        this.startDownload(download);
    }

}

Downloader.prototype.restartDownloading = function(){
    this.infoOut('Restarting Downloader');
    this.downloadingInProgress = true;

    //Only start new downloads
    for(let download of this.downloads){
        if(!download.isDownloaded() && !download.isDownloading()) {
            this.startDownload(download);
        }
    }
}

//Add a new page to be downloaded
Downloader.prototype.addPage = function(url, options = {}){
    options = Object.assign({updateJSON: true, addDuplicates: false}, options);
    let hash = md5(url); 

    if(!this.urlsMap.has(hash) || options.addDuplicates){
        let download = new Download(url); 
        this.urlsMap.set(hash, download);
        this.downloads.push(download);

        if(options.updateJSON) this.writeDownloaderFile();

        //Restart downloading if neccessary
        if(this.downloadingInProgress !== true){
            this.infoOut('Page added. Need to restart.'); 
            this.restartDownloading();
        }
        
    }
    else{
        this.infoOut(`The url "${url}" has already been added! Skipping.`, 2, {colorOverride: 'blue', prefix: '[DUPLICATE URL] '});
    }
}

//Reset all of the Download objects & update the json file
Downloader.prototype.clean = function(){
    this.infoOut('Downloader JSON file being cleaned for fresh downloads and metadata.');

    if(this.readyToDownload === false) {
        this.errorOut('Downloads not set'); 
        throw new Error('Downloads not set');
    }

    //Backup the old file
    this.createBackupDownloaderFile();

    for(let download of this.downloads){
        download.clean();
    }

    this.writeDownloaderFile(true);
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
        // debugger;

        this.downloaderDebug(`Started Download`);
        this.concurrentRequests++;
        download.start();   //Setup some properties

        let requestConfig = Object.create(this.options.requestConfig);
        requestConfig.url = download.url; 

        //Figure out a way to handle redirects as errors by editing the configObj
        
        let promise = new Promise((resolve, reject) => {
            this.networkDebugger(`Request (${this.concurrentRequests} / ${this.options.maxConcurrentRequests}) created to ${requestConfig.url}`);

            this.request(requestConfig, (err, response, contents) => {
                this.downloadsFinished++; //always mark finished

                if(!err){
                    this.concurrentRequests--;
                    this.networkDebugger(`Finished request ${requestConfig.url}`);
                    this.downloadedHandler(true, download, contents);
                    this.writeDownloaderFile();
                    resolve(true);
                }
                else{
                    this.concurrentRequests--;
                    this.networkDebugger(`Request failed for ${requestConfig.url} - ${err}`);
                    this.downloadedHandler(false, download); 
                    reject(false);
                }
            });
        })
        .then(() => this.checkIfFinished());

        this.allPromises.set(download.url, promise); 
        return promise; 
    }
     
}

//Parse the downloader.json and update this instance (Only needs to have a property called downloads that contain URL properties)
Downloader.prototype.parseDownloaderFile = function(downloaderFileLoc){
    // this.options.downloaderFileLoc = downloaderFileLoc;
    

    // this.infoOut(this.loadDownloaderFile());
    // let promise = this.loadDownloaderFile();
    
    //
    return this.loadDownloaderFile()
        .then((json)=>{
            this.infoOut2('Parsing json file from ' + this.options.downloaderFileLoc);
            json = JSON.parse(json);
            this.allOut(json);

            //Sync this instance
            if(json.options instanceof Object){
                let opt = Object.assign({}, this.options.__proto__, this.options, json.options);
                this.options = opt; 
            }
            if(json.downloads){
                this.infoOut2('Updating downloaded data structures from loaded json file.');

                for(let downloadUrlHash in json.downloads){
                    let download = Download.prototype.createFromJSON(json.downloads[downloadUrlHash]);
                    this.downloads.push(download); 
                    this.urlsMap.set(downloadUrlHash, download); 
                }

                this.readyToDownload = true; 
            }
            else{
                this.errorOut('No Downloads found in JSON file'); 
            }

        })
        .catch(err => this.errorOut(err));

}

//Read and load the _downloader.json file
Downloader.prototype.loadDownloaderFile = function(){
    this.fileSystemIO++;

    let filename = this.options.downloaderFileLoc;
    this.fileSystemDebug(`Loading downloader JSON file from ${filename}.`);

    let promise = fsp.readFile(filename)
        .then((data)=>{
            this.fileSystemIO--;
            this.fileSystemDebug('JSON file finished reading');
            return data
        })
        .catch((err) => {
            this.fileSystemIO--;
            this.errorOut(err);
        });

    this.allPromises.set('loadDownloaderFile', promise); 

    return promise; 
}

Downloader.prototype.createBackupDownloaderFile = function(){
    return fsp.readFile(this.options.downloaderFileLoc)
        .then((data) => {
            let backupJSONFile = this.options.downloaderFileBackupDir + 'downloader-' + new Date().getTime() + '.bak.json';
            fsp.writeFile(backupJSONFile, data)
                .then(() => this.infoOut(`Backup JSON file saved to ${backupJSONFile}`))
                .catch((err) => this.errorOut(`Write error ${err}`));
        })
        .catch(err => this.errorOut(`Read error ${err}`));
}

//Could be done much better 
Downloader.prototype.writeDownloaderFile = function(last = false){
    this.fileSystemIO++;

    //Only perform the last write
    let filename = this.options.downloaderFileLoc;
    this.fileSystemDebug(`Writing downloader JSON File to ${filename}.`);

    let json = {
        last_updated: new Date(),
        options: Object.assign({}, this.options.__proto__, this.options),
        downloads: {}
    };

    for(let download of this.downloads){
        json.downloads[md5(download.url)] = download;
    }

    let content = JSON.stringify(json, null, 2);

    let promise = fsp.writeFile(filename, content)
        .then(() => this.fileSystemIO--)
        .then(() => this.fileSystemDebug('JSON file finished writing'))
        .then(() => {if(!last) this.checkIfFinished();})
        .then(() => {if(last) this.infoOut('Wrote downloader JSON for the last time.');})
        .catch(err => {
                this.fileSystemIO--;
                this.errorOut(err);
            }
        );

    this.allPromises.set('writingDownloaderFile', promise);
    return promise; 
}

//Generate all of the downloads objects
Downloader.prototype.createDownloads = function(urls){
    for(let url of urls){
        this.addPage(url, {updateJSON: false}); 
    }
}

//Update the download file and add additional meta data
Downloader.prototype.finish = function(properties = {}){
    this.infoOut('Finished Tasks');
    this.downloadingInProgress = false;
    properties = Object.assign({}, properties);
    this.finishHook(properties);
    this.writeDownloaderFile(true); 
}



//What to do with the downloaded file
Downloader.prototype.downloadedHandler = function(status, download, filecontents = '', writeToFile = true){
    download.finish(status);
    if(status === true){ 
        let meta = {};
        meta.contentsHashMD5 = md5(filecontents); 
        
        if(writeToFile === true){
            //Use the md5 hash to see if the file has changed otherwise don't write
            if(download.contentsHashMD5 === meta.contentsHashMD5){
                this.infoOut(`Equal MD5 hash for ${download.url}. No need to write the contents of the file.`);
                return download;   
            }

            let dir = this.options.downloadsDestination;
            meta.fileLocation = dir + download.url.replace(/[^a-z0-9]|http|https|com|www/gi, '') + '-' + meta.contentsHashMD5;

            this.fileSystemDebug(`START Writing of ${meta.fileLocation}`);
            let promise = fsp.writeFile(meta.fileLocation, filecontents)
                .then(() => this.fileSystemIO--)
                .then(() => this.fileSystemDebug(`DONE Write of ${meta.fileLocation}`))
                .then(() => {
                    download.addProps({writtenToFile: true});
                    this.writeDownloaderFile();
                    // this.debugOut(download);
                })
                .then(() => this.checkIfFinished())
                .catch(err => {
                    this.fileSystemIO--
                    this.errorOut(err);
                });

            this.fileSystemIO++;
            this.allPromises.set('writing-page-' + meta.fileLocation, promise); 
        }

        download.addProps(meta);
    }

    download = this.downloadedHandlerHook(status, download, filecontents);   //Hook in to do more tasks 
    this.checkIfFinished(); 
    return download; 
}



//Determines if we should kick off a request for this Download
Downloader.prototype.shouldDownload = function(download){
    if(download.isDownloading()){
        this.infoOut(`The file ${download.url} is in the process of being downloaded.`);
        return false; 
    }

    if(download.isDownloaded()){
        this.infoOut(`The file ${download.url} is already downloaded.`);
        if(this.options.update === false) return false; 
        else this.infoOut(`Redownloading the file ${download.url}.`);
    }

    if(this.concurrentRequests >= this.options.maxConcurrentRequests){
        this.networkDebugger(`Max requests (${this.concurrentRequests} / ${this.options.maxConcurrentRequests}) achieved. Will try again.`, 3, {prefix: '[NETWORK - MAX REQUESTS] '});
        let downloadLater = this.startDownload.bind(this, download);
        this.downloadQueue.add(download.url, downloadLater);
        return false; 
    }
    return true; 
    
}

//Determine if there is anything left 
Downloader.prototype.checkIfFinished = function(){
    this.finishedDebugger(this.allPromises);
    this.finishedDebugger(this.fileSystemIO);
    this.finishedDebugger(this.downloadsFinished);

    if(this.downloadQueue) {
        if (this.downloadQueue.names.length > 0) return false;
    }

    if(this.fileSystemIO > 0) return false;
    if(this.downloadsFinished < this.downloads.length) return false;

    this.finish();
}


//Debuggers
Downloader.prototype.alwaysOut = Debug.prototype.levelCreator(3, 0,{always: true, colorOverride: 'cyan', prefix: '[GENERAL] '});
Downloader.prototype.debugOut = Debug.prototype.levelCreator(3, 1,{});
Downloader.prototype.infoOut = Debug.prototype.levelCreator(3, 2,{});
Downloader.prototype.infoOut2 = Debug.prototype.levelCreator(3, 4,{prefix: '[INFO] ', color: 'cyan'});
Downloader.prototype.allOut = Debug.prototype.levelCreator(3, 4,{});
Downloader.prototype.errorOut = Debug.prototype.levelCreator(3, 1,{error: true, prefix: '[ERROR] ', always: true, colorPrefixOnly: false});

Downloader.prototype.fileSystemDebug = Debug.prototype.levelCreator(3, 4,{prefix: '[FILESYSTEM] ', colorOverride: 'cyan'});
Downloader.prototype.downloaderDebug = Debug.prototype.levelCreator(3, 4,{prefix: '[DOWNLOADER] '});
Downloader.prototype.promisesDebug = Debug.prototype.levelCreator(3, 2,{prefix: '[PROMISES] '});
Downloader.prototype.finishedDebugger = Debug.prototype.levelCreator(3, 4,{prefix: '[CHECK IF FINISHED] ', colorOverride: 'magenta'});
Downloader.prototype.networkDebugger = Debug.prototype.levelCreator(3, 3,{prefix: '[NETWORK] ', colorOverride: 'magenta'});

Debug.prototype.updateLevel(3); 



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

Downloader.prototype.finishHook = function(){
     
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

// let downloader = new Downloader(
//     ['https://www.google.com/', 
//     'https://www.google.com/', 
//     'http://www.baseball-reference.com/route.cgi?player=1&mlb_ID=623406',  
//     'http://motherfuckingwebsite.com/'], 
//     {
//         downloaderFileLoc: './data/baseballref/urls.json',
//         downloadsDestination: './data/baseballref/pages/',
//         debugLevel: 2,
//         useTor: false, 
//         maxConcurrentRequests: 1
//     }
// );

let downloader = new Downloader(
    './data/baseballref/urls.json', 
    {
        downloaderFileDir: './data/baseballref/',
        downloaderFileBackupDir: './data/baseballref/backups/',
        downloaderFileLoc: './data/baseballref/urls.json',
        downloadsDestination: './data/baseballref/pages/',
        useTor: true, 
        maxConcurrentRequests: 50
    }
);


//Essentially have the producer and consumer problem here

downloader.readyToDownloadPromise.then(() => downloader.startDownloading({update: true}));
// downloader.readyToDownloadPromise.then(() => downloader.clean());


let newUrls = ['https://simplebac.com/', 'https://amazon.com'];
downloader.finishHook = function(){
   if(newUrls.length) downloader.addPage(newUrls.pop());
};



module.exports = Downloader; 