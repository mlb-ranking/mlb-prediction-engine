/**
 * Scrapper for baseball reference website. Utilizes cheerio for parsing DOM
 * 
 */

//Module Imports 
import scrape from './scraper';
import downloader from './downloader';
import Promise from 'promise';
import constants from '../util/constants';
import fs from 'fs'; 

//General Constants for baseball reference 
const BASEURL               = "http://www.baseball-reference.com/"; 
const TEAMS                 = constants.teamsAbbrevs; 
const TOTALTEAMS            = TEAMS.length; 
const TOTALPLAYERS          = TEAMS.length * 40;

//File Constants 
const DEFAULT_URL_FILENAME  = "urls.json";
const URLS_JSON_FILE_LOC    = `data/baseballref/${DEFAULT_URL_FILENAME}`; 
const PLAYERPAGE_FILE_LOC   = "data/baseballref/pages"; 

//Degbugging instance vars  
let teamsScrapped           = 0;
let playersScrapped         = 0;

//URLs loaded for this run
let urlsJSONFile            = null;    

//Configurable options with defaults
let config = {
    debug: true,
    name: "Baseball Reference Scrapper"
}; 

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
| run()     - Run this scrapper
| clean()   - Clean previous data
|
*/

/**
 * Run the scraper for baseballreference.com 
 * 
 * @param  {Object} extendConfig Ability to extend the configuration
 * 
 * @return Promise
 */
function run(extendConfig = {}){
    if(!urlsFileExists()){
        updatePlayerURLs()
            .then(run()); 
    }
    else{
        return downloadPlayers(); 
    }
}


/**
 * Wipe all previous page downloads and URL files to start clean.  
 * 
 * @return Promise
 */
function clean(){
    return Promise.all([deletePlayers(), updatePlayerURLs()])
        .then(() => `${config.name} has been cleaned`);  
}

/*
|--------------------------------------------------------------------------
| Internal API
|--------------------------------------------------------------------------
|   - updatePlayerURLs()    - Update the URLS file
|   - downloadPlayers()     - Trigger downloading of pages
|   - deletePlayers()       - Remove old data
*/

/**
 * Update the URL file to make verify current URLS.
 * 
 * @param {Vary} False by default or file name to change the export file to
 * @return Promise 
 */
function updatePlayerURLs(changeExport = false){
    let exportFile = changeExport === false ? URLS_JSON_FILE_LOC: changeExport;
    console.log(`Updating the ${exportFile} file with new URLS.`);

    let jsonFile = {
        urls: [],
        dateCreated: new Date()
    };
    let rosters = getAll40Man();

    //When all of rosters are scrapped get the URLS from those pages for later downloading 
    return Promise.all(rosters)
        .then(allRosters => allRosters.map(roster => roster.map(player => jsonFile.urls.push({url: player.url, downloading: false, downloaded: false, inAWS: false}))))
        .then(() => fs.writeFile(exportFile, JSON.stringify(jsonFile, null, 2), err => {if (err) throw err;})) 
        .then(() => console.log(`The file was successfully written to ${exportFile}`))  //This then mis not in sync need to use promise file system
        .catch(err => console.log(err));
}

/**
 * Start downloading some of the pages that will be parsed. 
 * Eventually put these pages in AWS. 
 * 
 * @param {Boolean} Update the urls page first
 * @param {Vary} false if default file name otherwise the file name of the urls 
 * @return Promise 
 */
function downloadPlayers(updateURLs = false, changedImport = false){
    let importFile = changedImport === false ? URLS_JSON_FILE_LOC: changedImport;
    
    if(updateURLs !== false){
        updatePlayerURLs(importFile)
            .then(() => console.log("URLS updated from downloadPlayers()"))
            .then(() => downloadPlayers(false, importFile)); // Then run this function without updating
    }
    else{
        downloader.run(importFile); 
        // fs.readFile(importFile, (err, data) => {
        //     if (err) throw err;
        //     urlsJSONFile = JSON.parse(data); //Load up the JSON file
        //     let urls = urlsJSONFile.urls; 

        //     //Start sending appropriate files to be downloaded
        //     urls.slice(0, 5).map((elem, index) => {
        //         if(!elem.downloaded){
        //             downloadPlayer(index, elem);
        //         }
        //         else{
        //             debugMessage(`[DEBUG] Player index ${index} is already downloaded. Skipping...`);
        //         }
        //     });
        // });




    }    
}

/**
 *  Download the full player page. 
 * 
 * @param  {Integer} index   Index in the full URLS file
 * @param  {Object} urlObj  the working object for downloaded, downloading and other metadata
 * @return {Promise}       
 */
function downloadPlayer(index, urlObj){
    debugMessage(`[DEBUG] Attempting to download player at index ${index}`); 

    if(needToDownload(index)){
        try{
            let url = BASEURL + urlObj.url;
            urlObj.downloading = true; 
            urlObj.startedAt = new Date();
            updateURLObj(urlObj, index); 

            //Use the mlb_ID for the file names
            let fileName = PLAYERPAGE_FILE_LOC + '/' + getMLBIDFromURL(url);
            scrape.downloadPage(url, fileName, function(response, data){
                debugMessage(`[DEBUG] File at index ${index} downloaded with status ${response.statusCode}.`);
                urlObj.downloading = false; 
                urlObj.downloaded = true; 
                urlObj.completedAt = new Date(); 
                urlObj.fileLocation = fileName;
                updateURLObj(urlObj, index); 
            }); 

        }
        catch (e){
            urlObj.downloading = false; 
            urlObj.downloaded = false; 
            updateURLObj(urlObj, index);
            console.log(e); 
        }
    }
    else{
        debugMessage(`[DEBUG] Skipping player at index ${index}. Downloaded or Downloading already.`);
    }
    

}

/**
 * Hide all of the currently downloaded player files.
 * 
 * @return Promise
 */
function deletePlayers(){

}




/**
 * Get the individual table rows that are necessary to construct basic information about a rosters players.
 * Most importantly getting the URL of each player to build the urls.json file. 
 * 
 * @param  {String} teamAbbrv Abbreviated team name
 * @return {Promise} return a promise that will allow access to an array of all of the players for teamAbbrv
 */
function getCurrent40Man(teamAbbrv) {
    let url = 'http://www.baseball-reference.com/teams/' + teamAbbrv + '/2015-roster.shtml';

    return new Promise((resolve, reject) => {
        let players = [];
        let dateUpdated  = new Date();

        console.log(`Currently scrapping players for ${teamAbbrv}`);

        scrape.scrape(url, ($) => {
            let table = $('#div_40man tbody tr'); 
            table.each(function(index, element) {
                let player = {};
                let playerData = $(element).children();

                //Meta Data
                player.source = "baseball-reference.com"
                player.updatedTime = dateUpdated; 
                player.url = playerData.eq(2).find('a').attr('href'); //Access detailed stats

                //Bio Data
                player.name = playerData.eq(2).text();
                player.currentTeam = teamAbbrv;
                player.position = playerData.eq(4).text().toLowerCase(); // Pitcher or Position 
                player.currentAge = playerData.eq(7).text(); // Pitcher or Position 
                player.heightInches = playerData.eq(10).attr('csk'); 
                player.currentWeight = playerData.eq(11).text();
                player.birth = playerData.eq(12).attr('csk');
                player.firstYear = playerData.eq(13).text();
                player.country = "tbd";
                player.throwingHand = playerData.eq(9).text();
                player.battingSide = playerData.eq(8).text();

                //Player IDs
                player.id = `TBD`; //Important will need to fix 
                player.uid = (player.name + player.currentTeam + player.currentWeight).replace(/ /g, '').toLowerCase(); //Needs to be more thought out 
                players.push(player);
            });

            teamsScrapped++;
            console.log(`Finished scrapping players for ${teamAbbrv} \t\t team ${teamsScrapped} out of ${TOTALTEAMS}`);

            resolve(players);
            reject("failed scrapping a player");
        });
    });
}


/**
 * Add all of the stats from the players personal page to the player object. 
 * 
 * @param  {Player} player object that contains the URL to access the stats
 * @return {Promise} Returns a promise once the player has been returned 
 */
function getStat(player){
    if(player.url === undefined){
        throw new Error("The passed player must have a URL field!");
    }

    let url = 'http://www.baseball-reference.com' + player.url;
    return new Promise((resolve, reject) => {
        console.log(`Currently scrapping stats for ${player.name}`);
        player.stats = {}; 
        player.stats.dateUpdated = new Date();
        scrape.scrape(url, ($) => {
            if(player.position == 'pitcher'){
                player.stats.standardPitching = getStatsFromTable($, $('#pitching_standard')); 
                 
            }
            else if(player.position == 'position'){
                player.stats.standardBatting = getStatsFromTable($, $('#batting_standard'));
                player.stats.battingValue = getStatsFromTable($, $('#batting_value'));
            }

            player.stats.standardFielding = getStatsFromTable($, $('#standard_fielding'));

            playersScrapped++;
            console.log(`Finished scrapping stats for ${player.name} \t\t player ${playersScrapped} out of ${TOTALPLAYERS} finished`);
            resolve(player);
            reject("failed scrapping a stats for a player");
        });
    });
}




/*
|--------------------------------------------------------------------------
| Helper Functions 
|--------------------------------------------------------------------------
|   - Formatting and DOM traversing 
|
*/

/**
 * Get all of the forty man rosters from all of the teams 
 * @return {Array} Array of all of the 40 man rosters
 */
function getAll40Man(){
    return TEAMS.map(teamAbbrev => getCurrent40Man(teamAbbrev)); 
}



/**
 * Add the stats (Probably shouldn't be exposed)
 * @param  {Array} players All of the previously built players 
 * @return {[type]}         [description]
 */
function getStats(players){
    let promises; 
    promises = players.map(player => getStat(player));
    return Promise.all(promises);
}


/**
 * Full featured parse. Parse every team and every player all at once. 
 * @return {Promise} Promise that only resolves if all are fulfilled 
 */
function getAll40ManStats(){    
    let promises;
    promises = TEAMS.map(team => getCurrent40Man(team).then(players => getStats(players)));
    return Promise.all(promises);
}



/**
 * Create an array of all of the stat names for easy lookup
 * @param  {Cheerio} Entire cheerio HTML 
 * @param  {Cheerio} cheerioTable Cheerio object of a table
 * @return {Array}  all of the names of a stat table to lookup 
 */
function createStatIndex(cheerio, cheerioTable){
    return cheerioTable.find('thead tr th').map((index,element) => cheerio(element).text()); 
}

/**
 * Retrieve all of the stats from the individual rows 
 * @param  {cheerio} cheerio      Loaded DOM
 * @param  {[type]} cheerioTable  Table within the DOM for convenience 
 * @param  {[type]} filters      (optional) filters to parse out content
 * @return {Stat}              All of the stats in each row of this table 
 */
function getStatsFromTable(cheerio, cheerioTable, filters){
    let stats = []; 

    //Lookup table for the stat names 
    let statIndex = createStatIndex(cheerio, cheerioTable); 

    //Iterate over all of the rows that contain the stats 
    cheerioTable.find('tbody tr').each(function(index, element){
        let statRow = cheerio(element).children(); 

        //Ignore rows without a year
        if(statRow.eq(0).text().length === 4){
            let stat = {};
            statRow.each(function(statRowIndex, statValue){
                if(cheerio(statValue).text().length > 0){
                    stat[statIndex[statRowIndex]] = normalizeValue(cheerio(statValue).text()); 
                }
            });
            stats.push(stat); 
        } 
    });
    return stats; 
}

/**
 * Try to convert the value to the correct type
 * @param  {String} value Parsed value in HTML 
 * @return {Varies}    Attempts to return the correct type for JSON 
 */
function normalizeValue(value){
    if(/[^$,\.\d]/.test(value)){
        return value; 
    }
    else{
        return Number(value); 
    }
}

/**
 * Return the MLB ID for this URL. If doesn't exist return large random 
 * 
 * @param  {String} url Url containging mlb_ID=######
 * @return {String}  MLB ID
 */
function getMLBIDFromURL(url){
    url = url.toLowerCase(); 
    let matches = url.match(/([^\?]*)\mlb_id=(\d*)/);

    if(matches !== null){
        return matches[2];
    }
    else{
        throw new Error("No MLB ID Found"); 
    }
}



/**
 * Debug only messages
 * !!!MOVE TO UTILS 
 * 
 * @return {[type]}      [description]
 */
function debugMessage(){
    if(config.debug){
        console.log.apply(null, arguments);
    }
}



/******************* MOVING TO DOWNLOADER *******************/

/**
 * Returns true if the urls file exists
 * @return {Boolean} Existence of URL.json or similar file 
 */
function urlsFileExists(){
    return false; //NEED TO IMPLEMENT
}



/**
 * Update the JSON file at this URL index with a new urlObj 
 * !!!!!!!!!!!!MOVE!!!!!!!!!!!!
 * 
 * @param  {Object} urlObj Updated status of the URL Object
 * @param  {Integer} index  position in the URL array of the JSON file
 * @return {[type]}        [description]
 */
function updateURLObj(urlObj, index){
    //Setup the urls object for this instance
    if(urlsJSONFile === null){
        
    }

    urlsJSONFile.urls[index] = urlObj; 
    console.log(urlsJSONFile.urls.slice(0,5)); 

}

/**
 * Get the most upto date URL Obj 
 * !!!!!!!!!!!!MOVE!!!!!!!!!!!!
 * 
 * @param  {Integer} index  position in the URL array of the JSON file
 * @return {Object}       Most recent version of the URL object
 */
function getURLObj(index){

    return {};
}

/**
 * If the file is downloading or already downloaded don't start it again. 
 * !!!!!!!!!!!!MOVE!!!!!!!!!!!!
 * 
 * @param  {[type]} index [description]
 * @return {Boolean}  Do we need to download this file
 */
function needToDownload(index){
    return !(urlsJSONFile.urls[index].downloading === true || urlsJSONFile.urls[index].downloaded === true);
}

/**
 * Update the JSON file with the new downloaded/downloading metadata. 
 * !!!!!!!!!!!!MOVE!!!!!!!!!!!!
 * 
 * @param  {Object} fullURLObj Copy of the Full URL Object for writing
 * @return Promise
 */
function updateJSONFile(){


}

/******************* MOVING TO DOWNLOADER *******************/


//Return all of the scrapers that will be run 
module.exports = {
    run, 
    updatePlayerURLs, 
    downloadPlayers
};