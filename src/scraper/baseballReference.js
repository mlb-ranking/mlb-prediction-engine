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
import fsp from 'fs-promise'; 

//General Constants for baseball reference 
const BASEURL               = "http://www.baseball-reference.com/"; 
const TEAMS                 = constants.teamsAbbrevs; 
const TOTALTEAMS            = TEAMS.length; 


//File Constants 
const DEFAULT_URL_FILENAME  = "urls.json";
const URLS_JSON_FILE_LOC    = `data/baseballref/${DEFAULT_URL_FILENAME}`; 
const PLAYERPAGE_FILE_LOC   = "data/baseballref/pages"; 
const PLAYER_JSON_DIR       = "data/baseballref/json";


//Degbugging instance vars  
let teamsScrapped           = 0;
let playersScrapped         = 0;
let totalPlayers            = null;

//URLs loaded for this run
let urlsJSONFile            = null;    
let urlsJSONFileLoc         = null; 


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
|   - setup()               - Setup the initial vars
|   - updatePlayerURLs()    - Update the URLS file
|   - downloadPlayers()     - Trigger downloading of pages
|   - deletePlayers()       - Remove old data
*/

/**
 * Setup initial vars and files
 * 
 * @return Promise
 */
function setup(urlsFileLoc){
    urlsJSONFileLoc = urlsFileLoc; 

    return fsp.readFile(urlsJSONFileLoc)
        .then((jsonFileContents) => {
            urlsJSONFile = JSON.parse(jsonFileContents); 
        })
        .then(() => {
            totalPlayers = urlsJSONFile.urls.length; 
        });
}

/**
 * Update the URL file to make verify current URLS.
 * **************** USE THE DOWNLOADER CREATE JSON ****************
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
    }    
}

/**
 * Scrap all of the stats from the individual players pages. 
 * 
 * @param  {[type]} urlsFile location of the urls file generated by the downloader
 * @return Promise
 */
function scrapePlayers(urlsFileLoc = URLS_JSON_FILE_LOC){
    setup(urlsFileLoc)
        .then(() => {
            let max = 2; //urlsJSONFile.urls.length
            max = urlsJSONFile.urls.length;
            for(let i=0; i < max; i++){
                let urlObj = urlsJSONFile.urls[i];
                if(true){
                    scrapePlayer(urlObj,i)
                        .then(player => {
                            writePlayerJSON(player);
                        })
                        .then(() => {
                            urlObj.isScrapped = true; 
                            urlsJSONFile.urls[i] = urlObj; 
                            writeURLSJSONFile(); 
                            urlObj = null; 
                        })
                        .catch((err)=>{
                            console.log(`[SCRAPPER - ERROR] Error at player at index ${i}`);
                        }); 
                }
                else{
                    console.log(`[SCRAPPER - SKIP] Skipping scraping player at index ${i} of ${totalPlayers}`);
                }
            }

        })
        .catch(err => console.log("[FS READ ERROR]", err));
}

/**
 * Parse a single page and create an object for this player.
 * 
 * @param  {[type]} urlObj [description]
 * @param  {[type]} i      [description]
 * @return {[type]}        [description]
 */
function scrapePlayer(urlObj, i){
    console.log(`[SCRAPPER - START] Starting scraping player at index ${i}`);

    return new Promise((resolve, reject) => {
        scrape.localScrape(urlObj.fileLocation, ($) => {
                let player = {};
                player.bio = {};
                player.stats = {};

                //Metadata
                player.jsonLocation = PLAYER_JSON_DIR + '/' + urlObj.url.replace('/', '') + '.json';
                player.source = urlObj; 

                //Bio Information 
                player.bio = getBioInfoPlayerPage($); 
                player.stats.standardFielding = getStatsFromTable($, $('#standard_fielding'));
                player.bio.team = player.stats.standardFielding[player.stats.standardFielding.length-1].Tm;
                
                //Stats 
                if(player.bio.position == 'pitcher'){
                    player.stats.standardPitching = getStatsFromTable($, $('#pitching_standard')); 
                    player.stats.postSeasonPitching = getStatsFromTable($, $('#pitching_postseason')); 
                }
                else if(player.bio.position == 'position'){
                    player.stats.standardBatting = getStatsFromTable($, $('#batting_standard'));
                    player.stats.postSeasonBatting = getStatsFromTable($, $('#batting_postseason'));
                    player.stats.battingValue = getStatsFromTable($, $('#batting_value'));
                }

                //Contact Information
                player.bio.contract = getStatsFromTable($, $('#salaries'));

                //Awards and Leaderboards Information 
                

                playersScrapped++;
                console.log(`[SCRAPPER - SUCCESS] Player ${player.bio.name} scrapped at index ${i} (${playersScrapped} of ${totalPlayers}).`);
                resolve(player);
        });
    });
}

/**
 * Get the bio info for this player
 * @param  {[type]} cheerio [description]
 * @return {[type]}         [description]
 */
function getBioInfoPlayerPage(cheerio){
    const INFO_ID = "#info_box";
    let bio = {};
    let info = cheerio(INFO_ID);
    
    bio.position = info.find('[itemprop="role"]').text().toLowerCase();
    if(bio.position !== 'pitcher') bio.position = 'position'; 

    //Basic Bio Information 
    let paragraphs = cheerio('#info_box p').text().toLowerCase();
    bio.name = info.find('#player_name').text();
    bio.birth = new Date(cheerio('#necro-birth').attr('data-birth')).toDateString(); 
    bio.age = (new Date() - new Date(bio.birth)) / (31536000 * 1000); 
    bio.height = paragraphs.substr(paragraphs.indexOf('height:') + 7, 10).replace(/([a-z])|(\.)|(\s)|(,)/g, '');
    bio.weight = Number(paragraphs.substr(paragraphs.indexOf('weight:') + 7, 10).replace(/([a-z])|(\.)/g, ''));
    bio.throws = paragraphs.includes('throws: right') ? 'right' : 'left';;
    bio.bats = paragraphs.includes('bats: right') ? 'right' : 'left'; 

    if(paragraphs.indexOf('debut:') !== -1){
        bio.debut = paragraphs.substr(paragraphs.indexOf('debut:') + 7, paragraphs.substr(paragraphs.indexOf('debut:') + 7, 100).indexOf('(age') - 1);
        bio.debut = new Date(bio.debut).toDateString();
        bio.debutAge = (new Date(bio.debut) - new Date(bio.birth)) / (31536000 * 1000);
    }

    //Contract Information 
    bio.contract = {}; 

    //Social Media Information 
    bio.twitter = '';

    return bio; 
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
            console.log(`Finished scrapping stats for ${player.name} \t\t player ${playersScrapped} out of ${totalPlayers} finished`);
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
    cheerioTable.find('tr').each(function(index, element){
        let statRow = cheerio(element).children(); 
        //Ignore rows without a year
        if(statRow.eq(0).text().length === 4 && !statRow.eq(0).text().includes('Year')){
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
 * Get the contract information for this player
 * 
 * @param  {[type]} cheerio [description]
 * @return {[type]}         [description]
 */
function getContractInfo(cheerio){
    let contract = {};
    contract.agent = "BOB"; 
    contract.status = "Contact Status";

    return contract; 
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
        if(value.includes('$')){
            value = value.replace('$', '').replace(/\,/g, '');
        }
        
        if(!isNaN(Number(value))){
            return Number(value);
        }
        else{
            return value; 
        }
    }
}

/**
 * Update this URLS JSON file
 * ***************MOVE TO DOWNLOADER OR SOMEWHERE or URL/JSON MANAGER************************
 * @return {[type]} [description]
 */
function writeURLSJSONFile(){
    fs.writeFile(urlsJSONFileLoc, JSON.stringify(urlsJSONFile, null, 2), err => {if (err) throw err;});
}

/**
 * Write the player JSON file
 * @param  {[type]} player [description]
 * @return {[type]}        [description]
 */
function writePlayerJSON(player){
    fs.writeFile(player.jsonLocation, JSON.stringify(player, null, 2), 
        err => {
            player = null; 
            if (err) throw err;
        });
}

/**
 * Debug only messages
 * *******************MOVE TO UTILS *******************
 * 
 * @return {[type]}      [description]
 */
function debugMessage(){
    if(config.debug){
        console.log.apply(null, arguments);
    }
}


//Return all of the scrapers that will be run 
module.exports = {
    run, 
    updatePlayerURLs, 
    downloadPlayers, 
    scrapePlayers
};