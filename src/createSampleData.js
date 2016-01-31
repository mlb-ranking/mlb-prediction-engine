/**
 * Create sample data to be used in the first phase of the project. This data will be composed mostly 
 * of current 40 man rosters. First attempt to analyze player similarities using similarity metrics. 
 *
 */

import rosters from './scraper/rosters';
import Promise from 'bluebird';

let result = {};
let promises;

//Creates all of the promises 
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