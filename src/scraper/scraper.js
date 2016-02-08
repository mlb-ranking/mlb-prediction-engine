// src/scraper.js

// Imports
import torRequest from 'torrequest';
import cheerio from 'cheerio';
import fs from 'fs'; 
import fsp from 'fs-promise'; 

//Constants
const TOR_HOST      = "localhost"; 
const TOR_PORT      = 9050;

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
| scrape()     - Run this scrapper
| 
|
*/

/**
 * Scrape a given url
 * @param  {[type]}   url      destination url for crawling
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function scrape(url, callback) {
    console.log(`[SCRAPER START] Scraping the url: ${url}`); 

    let options = {
        url: url,
        torHost: TOR_HOST,
        torPort: TOR_PORT
    };  

    torRequest(options, (err, response, html) => {
        if(!err) {
            let $ = cheerio.load(html);
            callback($);
            console.log(`[SCRAPER FINISH] Finished scraping the url: ${url}`); 
        }
        else{
            console.log(err); 
        }
    });
}


/*
|--------------------------------------------------------------------------
| Internal API
|--------------------------------------------------------------------------
| localScrape()     - Scrape a local file
| networkScrape()   - Scrape a url on the web 
| torScrape()       - Scrape a url on the web through tor 
|
*/

/**
 * Local scrapping of a file that is already downloaded. 
 * 
 * @param  {[type]}   fileLoc  Location of the file
 * @param  {Function} callback function to call after scrape is setup with cheerio
 * @return {[type]}            [description]
 */
function localScrape(fileLoc, callback){

}



// Expose the function to the rest of the app.
module.exports = {
    scrape
};