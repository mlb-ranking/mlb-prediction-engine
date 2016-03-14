"use strict";

import SourceMap from './util/sourceMap';
import constants from './util/constants'; 
import {log, trace, error, staticLog} from './util/loggingHelpers';
import fsp from 'fs-promise'; 

import {mongoose} from './util/mongoose';
import PlayerModel from './models/Player';
import StatisticModel from './models/Statistic';

//Mongo Setup
let connection = new Promise((resolve, reject) => { 
    mongoose.connect(constants.MONGO_URI, (err) => {
        if(err) reject(err); 
        else resolve('Successfully Connected')
    });
}).catch(trace); 

let mongoPromises = []

connection
    .then(() => getFiles('./data/baseballref/json/'))
    .then((files) => parseFiles(files))
    .then(() => Promise.all(mongoPromises))
    .then(() => {log('Closing Connection'); mongoose.disconnect();}) 
    .catch(trace);


function getFiles(dir){
    let promises = [];

    return fsp.readdir(dir)
      .then((files) => {return files.map(file => {return `${dir}${file}`})})
      .catch(trace);
}

function parseFiles(files){
  let promises = [];
  let one = true; 

  for(let file of files){
    if(file.includes('.json') && one){
      one = false;
      let promise = parseJSON(file)
        .then(json => {
             createPlayer(json)
                .then((player) => addStats(player, json)); 
        })
        .catch(trace);

      promises.push(promise);
    }
  } 
  return Promise.all(promises);
}

function parseJSON(filePath){
  return fsp.readFile(filePath)
    .then(contents => {return JSON.parse(contents)})
    .catch(trace); 
}

function createPlayer(json){
    let player = new PlayerModel(); 
    player.name = json.name || json.bio.name; 
    player.key = json.id || json.jsonLocation; 
    player.team = json.team || json.bio.team;
    player.type = json.type || json.bio.position;
    player.weight = json.bio.weight; 
    return Promise.resolve(player); 
}

function addStats(player, json){
  let stdPitching = json.stats.standardPitching;
  player.yearlyStats = [];

  for(let yearStats of stdPitching){
    let year = yearStats['Year'];
    delete yearStats['Year'];
    let group = 'std-pitching'; 

    for(let statKey in yearStats){
      let stat = new StatisticModel(); 
      stat.name = statKey;
      stat.value = yearStats[statKey];
      stat.group = group;
      stat.year = year;
      stat._player = player.id;
      player.yearlyStats.push(stat);      
    }
  }

  return promise = player.save()
    .then(()=>log('saved'))
    .catch(trace); 
}































// connection
//     .then(insertManyPlayers).catch(trace)
//     .then(log)
//     .catch(trace)
//     .then(() => mongoose.disconnect());

// function insertManyPlayers(){
//     console.time('Insert Many Total');
//     let promises = [];
//     let objs = [];
//     let models = [];
//     for(let i=0; i < 1000; i++){
//         let ob = { name: 'Star Wars', key: '123' };
//         objs.push(ob);
//         models.push(new PlayerModel(ob));
//     }
//     let promise = PlayerModel.insertMany(models)
//             .then((res) => {console.timeEnd('Insert Many Total');})
//             .catch(error);

//     return promise; 
// }  

// function insertBySave(){
//     console.time('Insert by Single Model Save');
//     let promises = [];
    
//     for(let i=0; i < 1000; i++){
//         let ob = { name: 'Star Wars', key: '123'};
//         let model = new PlayerModel(ob);
//         promises.push(model.save().catch(trace));
//     }

//     return Promise.all(promises).then(() => {
//         console.timeEnd('Insert by Single Model Save');
//     });
// }

// function createPlayer(){
//     const player = new PlayerModel(); 
//     player.name = 'bob jones'; 
//     player.key = '65432121546546'; 
//     return player.save();
// }

// function createStat(){
//     let stat = new StatisticModel({
//         name: 'h', 
//         value: 55, 
//         group: 'std-batting', 
//         year: 2015
//     });
//     return stat.save();
// }






