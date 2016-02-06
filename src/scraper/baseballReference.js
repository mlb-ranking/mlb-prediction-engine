/**
 * Scrapper for baseball reference website. Utilizes cheerio for parsing DOM
 * 
 */

//Imports 
import scrape from './scraper';
import Promise from 'promise';
import constants from '../util/constants';
import fs from 'fs'; 

//General Constants for baseball reference 
const baseURL = "http://www.baseball-reference.com/";
const teams = constants.teamsAbbrevs; 
const totalTeams = teams.length; 
const totalPlayers = teams.length * 40;

//URLs File Constants 
const defatulURLFileName = "urls.json";
const urlsJSONFileLoc = `data/baseballref/${defatulURLFileName}`; 

//Degbugging instance vars  
let teamsScrapped = 0;
let playersScrapped = 0;

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
|   - updatePlayerURLs() - Update the URLS file
|   - downloadPages() - Trigger downloading of pages
|
*/

/**
 * Update the URL file to make verify current URLS.
 * 
 * @param {Vary} False by default or file name to change the export file to
 * @return Promise 
 */
function updatePlayerURLs(changeExport = false){
    let exportFile = changeExport === false ? urlsJSONFileLoc: changeExport;
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
        .then(() => console.log(`The file was successfully written to ${exportFile}`))
        .catch(err => console.log(err));
}

/**
 * Start downloading some of the pages that will be parsed. Eventually put these pages in 
 * AWS. 
 * 
 * @param {Boolean} Update the urls page first
 * @param {Vary} false if default file name otherwise the file name of the urls 
 * @return 
 */
function downloadPages(updateURLs = false, changedImport = false){
    let importFile = changedImport === false ? urlsJSONFileLoc: changedImport;
    
    if(updateURLs !== false){
        updatePlayerURLs(importFile)
            .then(() => console.log("URLS updated from downloadPages"))
            .then(() => downloadPages(false, importFile)); // Then run this function without updating
    }
    else{

        //Check to see if there is a valid urls file
        fs.readFile(importFile, (err, data) => {
            if (err) throw err;
            console.log(JSON.parse(data));
        });
    }

    
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

        scrape(url, ($) => {
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
            console.log(`Finished scrapping players for ${teamAbbrv} \t\t team ${teamsScrapped} out of ${totalTeams}`);

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
        scrape(url, ($) => {
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
    return teams.map(teamAbbrev => getCurrent40Man(teamAbbrev)); 
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
    promises = teams.map(team => getCurrent40Man(team).then(players => getStats(players)));
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


//Return all of the scrapers that will be run 
module.exports = {
    updatePlayerURLs, 
    downloadPages
};