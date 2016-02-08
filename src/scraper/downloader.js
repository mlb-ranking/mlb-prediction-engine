//Imports
import request from 'torrequest';
import fs from 'fs'; 
import fsp from 'fs-promise'; 
import Promise from 'promise';
import scrape from './scraper';
import md5 from 'md5';

//Constants 
const TOR_HOST                  = "localhost"; 
const TOR_PORT                  = 9050;
const NETWORK_TIMEOUT           = 30000;
const DEFAULT_DESTINATION       = "data/temp/";
const DEFAULT_URLS_FILENAME     = "urls.json"; 

//Local Vars
let urlsJSONFile                = null;
let urlsJSONFileLoc             = "";
let baseURL                     = "";
let downloadDir                 = "";

//Network Mointoring
const DEFAULT_MAX_DOWNLOADS     = 50;            //Value 1-10 on how aggresive to throttle
const THROTTLER                 = 1;            //Value 1-10 on how aggresive to throttle
let requests                    = [];           //All of the reuests to be made

/*
|--------------------------------------------------------------------------
| API 
|--------------------------------------------------------------------------
|   - create(urls, dest, baseURL)       - Update/Create urls.json file for downloading of pages
|   - run(urlsJSONFileLoc)              - Start downloading the pages from a url.json file
|   - clean(urlsJSONFileLoc)            - Refresh all of the downloaded properties to false
|
*/

/**
 * Update or create a new urls.json file in the given destination. 
 * 
 * @param {Array} urls list of all of the urls to be searched
 * @param Promise
 */
function create(urls, dest, baseURL){
    let jsonFile = {
        baseURL: baseURL,
        dateCreated: new Date(),
        urls: [],
    };

    urls.map(url =>{
        jsonFile.urls.push({
            url: url, 
            downloaded:false, 
            downloading: false, 
            inAWS: false,           //In the cloud
            isScrapped: false,        //Used to determine if it was scrapped
            hash: null              //Hash of the page to detect changes in the future
        });
    });

    //Need to have an indexed by url option either by lookup table or



    // return new Promise
}

/**
 * Pasrse the JSON file and start downloading files not yet 
 * downloaded. 
 * 
 * @param  {String} urlsJSONFileLoc Location to the JSON file
 * @return Promise
 */
function run(urlsJSONFileLoc){
    urlsJSONFileLoc = urlsJSONFileLoc; 
    setup(urlsJSONFileLoc).then(() => startDownloads()); 
}



/**
 * Reset all of the download properties to false. 
 * 
 * @param  {[type]} urlsJSONFileLoc [description]
 * @return {[type]}             [description]
 */
function clean(urlsJSONFileLoc){
    // loadURLs(urlsFileLoc); add this function
    urlsJSONFileLoc = urlsJSONFileLoc; 
}


/*
|--------------------------------------------------------------------------
| Internal API  
|--------------------------------------------------------------------------
|  - startDownloads(                        - Manage all of the global downloads
|  - startDownload(urlObj, index)           - Start the download for this object
|  - downloadPage(url, dest, callback)      - Download and save the file 
|   
*/

/**
 * Start sending out reuqests for downloads 
 * 
 * @return {[type]} [description]
 */
function startDownloads(max = DEFAULT_MAX_DOWNLOADS){   
    let downloads = 0;
    
    for(let index = getStartingPoint(); index < urlsJSONFile.urls.length; index++){
        let urlObj = urlsJSONFile.urls[index];

        if(!urlObj.downloaded){
            if(downloads < max){
                startDownload(urlObj, index);
                downloads++;
            }
            else{
                console.log(`[DOWNLOADER - LIMIT] Hit Page Limit...`);
                break;
            }
        }
        else{
            console.log(`[DOWNLOADER - SKIP] Page index ${index} is already downloaded. Skipping...`);
        }
    }

}

/**
 * Attempt to actually download the page if neccessary 
 * 
 * @param  {[type]} urlObj [description]
 * @param  {[type]} index  [description]
 * @return Promise
 */
function startDownload(urlObj, index){
    if(needToDownload(index)){
        try{
            let fullURL = baseURL + urlObj.url;

            urlObj.downloading = true; 
            urlObj.startedAt = new Date();
            updateURLObj(urlObj, index); 

            let fileName = downloadDir +  getFileNameFromURL(urlObj.url);

            downloadPage(fullURL, fileName, function(response, data){
                urlObj.downloading = false; 
                urlObj.downloaded = true; 
                urlObj.completedAt = new Date(); 
                urlObj.fileLocation = fileName;
                // urlObj.hash = data;
                updateURLObj(urlObj, index); 

                //Every so often
                writeToFile(); 
            }); 

        }
        catch (e){
            urlObj.downloading = false; 
            urlObj.downloaded = false; 
            updateURLObj(urlObj, index);
            console.log(`[DOWNLOADER - ERROR] `, e);
        }
    }
}


/**
 * Download the url and save it to the destination directory.
 * 
 * @param  {String} url  URL
 * @param  {[type]} dest [description]
 * @param  {Function} callback fired on success
 * @return {[type]}      [description]
 */
function downloadPage(url, dest, callback){
    console.log(`[DOWNLOADER - START] Downloading the file ${url} to ${dest}`); 

    //Config
    let destUrl = dest + '/' + url; 
    let options = {
        url: url,
        torHost: TOR_HOST,
        torPort: TOR_PORT,
        timeout: NETWORK_TIMEOUT
    };  

    //Send the request using TOR
    request(options, (err, response, html) => {
        if(!err) {
            callback(response, html);
            fs.writeFile(dest, html, err => {if (err) throw err;});
            console.log(`[DOWNLOADER - FINISH] File '${dest}' downloaded with status '${response.statusCode}'.`);
        }
        else{
            if(err.code === 'ETIMEDOUT'){
                console.log(`[DOWNLOADER - TIMEOUT] File '${url}' timedout.`);
                // throw new Error(`[DOWNLOADER - TOR ERROR TIMEOUT] TOR Request failed for ${url}`);
            }
            else{
                console.log(`[DOWNLOADER - TOR ERROR] Request failed for ${url}`);
                // throw new Error(`[DOWNLOADER - TOR ERROR] Request failed for ${url} exited with ${response.statusCode}.`); 
            }
        }
    });




}





/*
|--------------------------------------------------------------------------
| Helpers 
|--------------------------------------------------------------------------
|  
|  
|   
*/

/**
 * Setup the environment
 * @param  {[type]} urlsFileLoc [description]
 * @return Promise          
 */
function setup(urlsFileLoc){
    return fsp.readFile(urlsFileLoc)
        .then((jsonFileContents) => {

            //Setup Local Vars
            urlsJSONFile = JSON.parse(jsonFileContents); 
            urlsJSONFileLoc = urlsFileLoc;
            baseURL = urlsJSONFile.baseURL; 
            downloadDir = urlsJSONFile.downloadDir; 
            if(baseURL === undefined || downloadDir === undefined || urlsJSONFileLoc === undefined){
                throw new Error("BaseURL or downloadDir not set in JSON File");
            }

        })
        .catch(err => console.log("[FS READ ERROR]", err));
}

/**
 * Update the JSON file at this URL index with a new urlObj 
 * @param  {Object} urlObj Updated status of the URL Object
 * @param  {Integer} index  position in the URL array of the JSON file
 * @return {[type]}        [description]
 */
function updateURLObj(urlObj, index){
    urlsJSONFile.urls[index] = urlObj; 
}

/**
 * Create a unique file name based off of the URL 
 * @param  {String} url HTTP url to generate the file name from 
 * @return {String}     Filesystem safe string for the file name
 */
function getFileNameFromURL(url){
    return url.replace("/", ""); 
}

/**
 * index of the first element not downloaded. 
 * 
 * @return {Integer} index of first not downloaded 
 */
function getStartingPoint(){
    for(let i=0; i < urlsJSONFile.urls.length; i++){
        if(urlsJSONFile.urls[i].downloaded === false) return i; 
    }
   
    return 0; 
}


/**
 * If the file is downloading or already downloaded don't start it again. 
 *  
 * @param  {Integer} index 
 * @return {Boolean}  Do we need to download this file
 */
function needToDownload(index){
    return !(urlsJSONFile.urls[index].downloading === true || urlsJSONFile.urls[index].downloaded === true);
}

/**
 * Update the JSON file with the new downloaded/downloading metadata object.
 * 
 * @return Promise
 */
function writeToFile(){
    // console.log('[DEBUG] Writing to JSON FILE');
    fs.writeFile(urlsJSONFileLoc, JSON.stringify(urlsJSONFile, null, 2), 
        err => {
            if (err) throw err;
    });


}


// Expose the function to the rest of the app.
module.exports = {
    run,
    create, 
    clean
};