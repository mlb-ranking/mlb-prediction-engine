/**
 * All of the web scrapres for building of the data
 * Should return propises 
 */
import scrape from './scraper';
import Promise from 'promise';

const teams = ["ALL", "BOS", "MET"];

function get40ManRosterBaseballRef(teamAbbrv){
    let url = 'http://www.baseball-reference.com/teams/' + teamAbbrv + '/2015-roster.shtml';

    return new Promise((resolve, reject) => {
        let players = [];

        scrape(url, '#div_40man tbody tr', ($, content) => {
            content.each(function(index, element){
                let player = {};
                let player_data = $(element).children();

                player.source = "baseball-reference.com"
                player.team = teamAbbrv; 
                player.name = player_data.eq(2).text(); 
                player.url = player_data.eq(2).find('a').attr('href'); 
                player.position = player_data.eq(4).text();
                // player.id = player.source + '-' + player_data.eq(12).text() + '-' +  player.name;
                player.id = `id = ${player.source}`;
                player.id = player.id.replace(/ /g,'').toLowerCase();

                players.push(player);
            });
            
            resolve(players);
        });
    });

}

function getBravesRoster() {
    console.log("Here"); 
   return get40ManRosterBaseballRef('BOS'); 
}


module.exports = {
    getBravesRoster
}