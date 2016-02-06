// src/scraper.js

// Imports
import torRequest from 'torrequest';
import cheerio from 'cheerio';
import fs from 'fs'; 

//Constants
const TOR_HOST      = "localhost"; 
const TOR_PORT      = 9050;

/**
 * Scrape a given url
 * @param  {[type]}   url      destination url for crawling
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function scrape(url, callback) {
    console.log(`[DOWNLOAD] Scraping the url: ${url}`); 

    let options = {
        url: url,
        torHost: TOR_HOST,
        torPort: TOR_PORT
    };  

    torRequest(options, (err, response, html) => {
        if(!err) {
            let $ = cheerio.load(html);
            callback($);
        }
        else{
            console.log(err); 
        }
    });
}



// Expose the function to the rest of the app.
module.exports = {
    scrape
};