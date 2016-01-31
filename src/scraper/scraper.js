// src/scraper.js
import torRequest from 'torrequest';
// var torRequest = require("torrequest");
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
		// headers: {
		// 	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
		// 	'cookie': 'GOOGLE_ABUSE_EXEMPTION=ID=90638b7f03578a59:TM=1454215838:C=c:IP=24.3.21.196-:S=APGng0sck0sauA0BL0HlJRX8xi26QeigXA'
		// }
	}

    torRequest(options, (err, response, html) => {
        if(!err) {
            let $ = cheerio.load(html);
            callback($);
        }
    });
}

// Expose the function to the rest of the app.
module.exports = scrape;