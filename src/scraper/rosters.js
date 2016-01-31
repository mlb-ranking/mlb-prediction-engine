/**
 * All of the web scrapres for building of the data
 * Should return propises 
 */
import scrape from './scraper';
import Promise from 'promise';

const teams = ["ARI", "ANA", "ATL", "BAL", "BOS", "BOA", "BOB", "BOD", "BOR", "BOU", "BKN", "CAL", "CHC", "CHO", "CHI", "CHW", "CIN", "CLE", "COL", "DET", "FLA", "HOU", "KC", "LAA", "LAD", "LA", "MIA", "MIL", "MIN", "MTL", "NY", "NYG", "NYM", "NYY", "NYH", "OAK", "PHA", "PHI", "PHP", "PHB", "PIT", "SD", "SEA", "SF", "STB", "STL", "STC", "TB", "TEX", "TOR", "WSH"];

/**
 * Return all of the roster data 
 * @return {Promise} return array of players from all of the current teams 
 */
function getAll40Man(){
    return teams.map(x => getCurrent40Man(x));
}

/**
 * [get40ManRosterBaseballRef description]
 * @param  {String} teamAbbrv Abbreavted team name
 * @return {Promise} return a promise that will allow access to an array of all of the players 
 */
function getCurrent40Man(teamAbbrv) {
    let url = 'http://www.baseball-reference.com/teams/' + teamAbbrv + '/2015-roster.shtml';
    console.log(url);
    return new Promise((resolve, reject) => {
        let players = [];
        scrape(url, '#div_40man tbody tr', ($, content) => {
            content.each(function(index, element) {
                let player = {};
                let player_data = $(element).children();
                player.source = "baseball-reference.com"
                player.team = teamAbbrv;
                player.name = player_data.eq(2).text();
                player.url = player_data.eq(2).find('a').attr('href'); //Url to retrieve other stats 
                player.position = player_data.eq(4).text().toLowerCase();
                // player.id = player.source + '-' + player_data.eq(12).text() + '-' +  player.name;
                player.id = `id = ${player.source}`;
                // player.id = player.id.replace(/ /g, '').toLowerCase();
                players.push(player);
            });
            resolve(players);
        });
    });
}

/**
 * Get the actual stats of players
 * @param  {String} playerURL 
 * @param  {Enum} position  position or pitcher
 * @return {[type]}           [description]
 */
function getPlayer(playerURL, position){

}

function getBravesRoster() {
    return getCurrent40Man('ATL');
}

//Return all of the scrapers that will be run 
module.exports = {
    getBravesRoster
}