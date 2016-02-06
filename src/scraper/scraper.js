// src/scraper.js
import torRequest from 'torrequest';
import cheerio from 'cheerio';

/**
 * Scrape a given url
 * @param  {[type]}   url      destination url for crawling
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function scrape(url, callback) {
    let options = {
        url: url,
        torHost: "localhost",
        torPort: 9050
    };  

    torRequest(options, (err, response, html) => {
        if(!err) {
            let $ = cheerio.load(html);
            callback($);
        }
    });
}

/**
 * Download the url and save it to the destination directory
 * @param  {String} url  URL
 * @param  {[type]} dest [description]
 * @return {[type]}      [description]
 */
function downloadPage(url, dest){

}

// Expose the function to the rest of the app.
module.exports = {
    scrape
};