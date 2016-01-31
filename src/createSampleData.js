/**
 * Create sample data to be used in the first phase of the project. This data will be composed mostly 
 * of current 40 man rosters. First attempt to analyze player similarities using similarity metrics. 
 *
 */

import rosters from './scraper/rosters';
import Promise from 'bluebird';

let result = {};


//None of the promise logic should be here 


// rosters.getCurrent40Man('ATL')
// 	.then(players => {
// 		rosters.getStat(players[36])
// 			.then(players=>{
// 				console.log(JSON.stringify(players, null, 2)); 
// 			})
// 			.catch(console.log.bind(console));
// 	})
// 	.catch(console.log.bind(console)
// ); 
// 
rosters.getCurrent40Man('ATL')
	.then(players => {

		rosters.getStats(players)
			.then(x => {
				console.log(JSON.stringify(x, null, 2));
			});
	})