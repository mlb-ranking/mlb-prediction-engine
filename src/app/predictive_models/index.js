"use strict";

import {mongoose} from './../util/mongoose';
import Player from './../models/Player';

mongoose.connect('mongodb://localhost/test');
let ids = []; 


// getAllIds()
//   .then(getOnePlayer)
//   .then(close);


export function close(){
  mongoose.connection.close();
}

function getOnePlayer(){
  let query = Player.find({_id: ids[0]}).exec();
  return query.then((doc) => console.log(doc));
}

function getAllIds(){
  let query = Player.find({}).select('id').exec();
  return query.then((doc) => {ids = doc; return doc;});
}


export function getIds(){
  return new Promise((res, rej) => {
    getAllIds()
      .then((ids) = res(ids))
      .catch(rej); 
  });
}