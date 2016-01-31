/**
 * Scrapper for baseball reference website. Utilizes cheerio for parsing DOM
 * 
 */

import scrape from './scraper';
import Promise from 'promise';
import fs from 'fs'; 

const teams = ["ARI", "ATL", "BAL", "BOS", "CHC", "CHW", "CIN", "CLE", "COL", "DET", "HOU", "KC", "LAA", "LAD", "MIL", "MIN", "NYM", "NYY", "OAK", "PHI", "PIT", "SD", "SEA", "SFG", "STL", "STC", "TBR", "TEX", "TOR", "WSN"];
const totalTeams = teams.length; 
const totalPlayers = teams.length * 40;

let teamsScrapped = 0;
let playersScrapped = 0;

/**
 * Update the URL file to make sure the new urls 
 * @return {[type]} [description]
 */
function updateAllUrls(){
    let urls = {};
    // urls.currentRosterPages = teams.map(teamAbbrev => `http://www.baseball-reference.com/teams/${teamAbbrev}/2015-roster.shtml`);
    // urls.playerPages = teams.map(teamAbbrev => getCurrent40Man(teamAbbrev).then(x => {console.log(x[0].url)})); 
    // urls.playerPages = teams.map(teamAbbrev => getCurrent40Man(teamAbbrev)
    //     .then(x => {
    //             x.map(x => console.log(x.url));
    //             return x.url; 
    //             console.log(urls); 
    //         }
    //     )); 
    
    let playerPages = [];
    let rosters = teams.map(teamAbbrev => getCurrent40Man(teamAbbrev)); 
    Promise.all(rosters).then(x => console.log(x[0][5].url));
   
    // console.log(urls); 
    
}

/**
 * Get all of the forty man rosters from all of the teams 
 * @return {Array} [description]
 */
function getAll40Man(){

}

/**
 * Full featured parse. Prase every team and everyplayer all at once. 
 * @return {Promise} Promise that only resolves if all are fullfilled 
 */
function getAll40ManStats(){    
    let promises;
    promises = teams.map(team => getCurrent40Man(team).then(players => getStats(players)));
    return Promise.all(promises);
}

/**
 * Very specifically get the individual table rows that are neccessary 
 * @param  {String} teamAbbrv Abbreavted team name
 * @return {Promise} return a promise that will allow access to an array of all of the players 
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
            

            //Handle rejection
        });
    });
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
 * Add the actual stats to a given player
 * @param  {Player} player object that contains the url to access the stats
 * @return {Promise} Returns a promise once the player has been returned 
 */
function getStat(player){
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
 * Create an array indexed 
 * @param  {Cheerio} Entire cheerio html 
 * @param  {Cheerio} cheerioTable Cheerio object of a table
 * @return {Array}  all of the names of a stat table to lookup 
 */
function createStatIndex(cheerio, cheerioTable){
    return cheerioTable.find('thead tr th').map((index,element) => cheerio(element).text()); 
}

/**
 * Retrieve all of the stats from the individual rows 
 * @param  {cheerio} cheerio      Loaded dom
 * @param  {[type]} cheerioTable  Table within the dom for convience 
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
 * @param  {String} value Parsed value in html 
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
    getCurrent40Man,
    getAll40Man,
    getStat,
    getStats,
    updateAllUrls
}