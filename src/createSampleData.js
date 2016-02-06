/**
 * Create sample data to be used in the first phase of the project. This data will be composed mostly 
 * of current 40 man rosters. First attempt to analyze player similarities using similarity metrics. 
 *
 */

import baseballRefScrapper from './scraper/baseballReference';

// baseballRefScrapper.updatePlayerURLs(); 
// 
baseballRefScrapper.downloadPlayers(); 
setInterval(function() { baseballRefScrapper.downloadPlayers(); }, 60000);
// baseballRefScrapper.downloadPlayers();