import rosters from './scraper/rosters';
import Promise from 'bluebird';

let result = {};
let promises;

promises = Object.getOwnPropertyNames(rosters).map(name => rosters[name]());
result.players = [];
result.updated = new Date();

Promise.all(promises)
	.then(response => {
	    response.forEach(players => {
	        result.players = players;
	    });
	    console.log(result); 
	    return result; 
	})
	.catch(console.log.bind(console)); 