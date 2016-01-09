// src/scraper.js
import request from 'request';
import cheerio from 'cheerio';

/**
 * Scrape a given url 
 * @param  {[type]}   url      [description]
 * @param  {[type]}   selector [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function scrape(url, selector, callback) {
    request(url, (err, response, html) => {
        if(!err) {
            let $ = cheerio.load(html);
            callback($, $(selector));
        }
    });
}

// Expose the function to the rest of the app.
module.exports = scrape;