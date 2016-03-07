"use strict";

import SourceMap from './util/sourceMap';
import constants from './util/constants'; 
import {log, trace, error, setShallow, setDeep, staticLog} from './util/loggingHelpers';
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

let mongoPromises = [];

connection
    .then(() => getFiles('./data/baseballref/json/'))
    .then((files) => parseFiles(files))
    .then(() => Promise.all(mongoPromises))
    .then(() => mongoose.disconnect()) 
    .catch(trace);


function getFiles(dir){
    let promises = [];

    return fsp.readdir(dir)
      .then((files) => {return files.map(file => {return `${dir}${file}`})})
      .catch(trace);
}

function parseFiles(files){
  let promises = [];
  for(let file of files){
    if(file.includes('.json')){
      let promise = parseJSON(file)
        .then(json => {
             createPlayer(json)
              .then((player) => createStats(json, player)); 
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
    mongoPromises.push(player.save().catch(trace));

    return Promise.resolve(player.id); 
}

function createStats(json, player){
   
  return Promise.resolve(); 
}

function createStat(){

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






