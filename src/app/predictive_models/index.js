"use strict";

import {mongoose} from './../util/mongoose';
import Player from './../models/Player';
import {euclidFromIDs, euclidFromStreaming} from './euclid/';

mongoose.connect('mongodb://localhost/test');
let ids = []; 

// getPlayersStreaming((doc) => console.log(doc._id)); 
euclidFromStreaming(); 

export function close(){
  mongoose.connection.close();
}

function getOnePlayer(){
  return getPlayer('5745f6f5f564b4281c61bd3c');
}

function getAllIds(){
  let query = Player.find({}).select('id').exec();
  return query.then((doc) => {
    ids = doc; 
    return doc;
  });
}

let playersCache = new Map(); 

export function getPlayer(id){
  if(playersCache.has(id)){
    return new Promise((resolve, reject) => {
      resolve(playersCache.get(id));
      reject(console.trace);
    });
  }
  else{
    let query = Player.findOne({_id: id}).exec();
    return new Promise((resolve, reject) => {
      query.then(player => {
        playersCache.set(player._id, player); 
        resolve(player);  
      });
    });
  }
}


export function getIds(){
  return new Promise((resolve, reject) => {
    getAllIds()
      .then((ids) => {
        resolve(ids);
      })
      .catch(reject); 
  });
}

export function getPlayersStreaming(onData, onError, onClose){
  let stream = Player.find().stream(0);
  
  stream.on('close', function () {
    close();
  });  

  return stream; 
}

function runEuclid(ids){

}


