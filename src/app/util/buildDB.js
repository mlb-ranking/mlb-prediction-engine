"use strict";

import fsp from 'fs-promise'; 
import ProgressBar from 'progress'; 
import Player from './../models/Player';
import {mongoose, Schema} from './mongoose';

const JSON_DIR = './data/json/03-19-16/';
mongoose.connect('mongodb://localhost/test');

/**
 * Add data to the database for testing. In production
 * will be reading player data from an API. 
 * 
 * @param  {[type]} jsonDir director of all the JSON files containing data
 * @return {[type]}            [description]
 */
function buildTestDB(){
  Player.find({}).remove().then(() =>{seedPlayers()});
}


let filesCount = 0;
let finished = 0; 
let allPlayers = [];
let bar;

/**
 * Build the inital player database
 * @return {[type]} [description]
 */
function seedPlayers(){
  console.log("Seeding Players from JSON Files!");

  getJSONFiles(JSON_DIR)
    .then(files => {
      parseJSONFiles(files)
        .then(() => {
          console.log('Adding the players to the database'); 
          mongoBulkInsert(allPlayers)
            .then(close);
        })
        .catch(console.trace);
    })
    .catch(console.trace); 
}

function close(){
  mongoose.connection.close();
}

/**
 * Use native mongoDB driver to insert multiple player documents
 * @param  {Array} players player documents to insert
 * @return {Promise}     
 */
function mongoBulkInsert(players){
  return new Promise((resolve, reject) => {
    Player.collection.insert(players, (err, docs) => {
      if(err) reject(err); 
      else{
        resolve(docs); 
      }
    }) 
  });

}


/**
 * Load all of the JSON files
 * @param  {String} dir Directory to list of JSON files
 * @return {Promise}     
 */
function getJSONFiles(dir){
  return fsp.readdir(dir)
    .then((files) => {
      filesCount = files.length; 
      bar = new ProgressBar('Reading JSON Files :bar :percent', { total: filesCount });
      return files.map(file => {return `${dir}${file}`})
    })
    .catch(console.trace);
}

/**
 * Parse out the JSON files for players 
 * @param  {[type]} files [description]
 * @return {[type]}       [description]
 */
function parseJSONFiles(files){
  let promises = [];
  let max = files.length;
  for(let i=0; i < files.length && i < max; i++){
    let filename = files[i];
    if(filename.includes('.json')){
      let promise = parseJSON(filename)
        .then(createPlayer)
        .catch(console.trace);
      promises.push(promise);
    }
  }
  return Promise.all(promises);
}

/**
 * Parse the JSON of a full player
 * @param  {String} filePath [description]
 * @return {[type]}          [description]
 */
function parseJSON(filePath){
  return fsp.readFile(filePath)
    .then(contents => {
      return JSON.parse(contents)
    })
    .catch(console.trace); 
}

/**
 * Load a JSON file 
 * @param  {String} filePath 
 * @return {Promise}          
 */
function getJSON(filePath){
  return fsp.readFile(filePath)
    .then(contents => {
      return contents;
    })
    .catch(console.trace); 
}

/**
 * Create a player and add the stats to it
 * @param  {Object} json 
 * @return {Promise}      
 */
function createPlayer(json){
  let player = {};
  player.name = json.name || json.bio.name; 
  player.key = json.id || json.jsonLocation; 
  player.team = json.team || json.bio.team;
  player.type = json.type || json.bio.position;
  player.weight = json.bio.weight; 
  player.slug = (player.name + '-' + player.team).replace(' ', '');
  player.yearlyStats = [];
  addStats(player, json);
  allPlayers.push(player);
  updateLog(player.slug);  
  return Promise.resolve(player); 
}

/**
 * Add stats to a player
 * @param {Player} player 
 * @param {Object} json   
 */
function addStats(player, json){
  for(let group in json.stats){
    addGroup(player, json, group);
  }
}

/**
 * Add a new JSON group
 * @param {Player} player 
 * @param {Object} json   
 * @param {String} key    Key for the new group
 */
function addGroup(player, json, key){
  if(!json.stats[key]) return false; 
  let array = json.stats[key];
  let stats = getYearStats(array, key); 
  player.yearlyStats.push(...stats);
}

/**
 * Create stats yearly stats
 * @param  {Array} statsArray 
 * @param  {String} groupName  
 * @return {Array}            
 */
function getYearStats(statsArray, groupName){
  let stats = [];

  for(let yearStats of statsArray){
    let year = yearStats.Year;
    delete yearStats.Year;
    for(let statKey in yearStats){ 
      let stat = {};
      stat.name = statKey;
      stat.value = yearStats[statKey];
      stat.group = groupName;
      stat.year = year;
      stats.push(stat);      
    }
  }

  return stats; 
}

function updateLog(msg = ''){
  finished++;
  bar.tick();
}



buildTestDB(); 

