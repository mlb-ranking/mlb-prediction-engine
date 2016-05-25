"use strict";

// https://github.com/cgiffard/node-simplecrawler#simplified-mode
import Crawler from 'simplecrawler'; 

let defaults = {
  concurrent: 5,
  logs: true,
  request: { 
    headers: { 'user-agent': 'node-crawler' },
  }
};

let crawler = new Crawler("www.baseball-reference.com", '/players', 8000);
 crawler = new Crawler("www.baseball-reference.com");
// let crawler = new Crawler("www.joshuarogan.com");

let urls = [];
let teamURLS = [];
let playerURLS = [];



crawler.on("fetchcomplete", function(queueItem, responseBuffer, response) {
  urls.push(queueItem.url);
    console.log("I just received %s (%d bytes)", queueItem.url, responseBuffer.length);
    // console.log("It was a resource of type %s", response.headers['content-type']);
});

crawler.start();