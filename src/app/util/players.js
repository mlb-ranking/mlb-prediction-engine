"use strict";

import {mongoose} from './../util/mongoose';
import Player from './../models/Player';

mongoose.connect('mongodb://localhost/test');

export function close(){
  mongoose.connection.close();
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

let i = 0;

export function getPlayersStreaming(){
  let stream = Player.find().stream(0);
  stream.on('data', function (doc) {
    console.log(i++); 
  }).on('error', function (err) {
    console.log(err); 
  }).on('close', function () {
    // the stream is closed
    console.log('closed'); 
    close();
  });
}


getPlayersStreaming();