"use strict";

import {logger} from 'js-utils';
import {getIds, getPlayer, getPlayersStreaming} from './../index';
import {Vectors, Vector} from './../vectors';
import util from 'util'; 

class EuclidPair{

  /**
   * 
   * @param  {Vector} v1 [description]
   * @param  {Vector} v2 [description]
   * @return {[type]}    [description]
   */
  constructor(v1, v2){
    if(v1.length !== v2.length){
      console.log('Must be the same length');
      throw new Error('Must be the same length'); 
    }
    else{
      this.v1 = v1; 
      this.v2 = v2; 
    }
  }

  get distance(){
    return this.computed === undefined ? this.computeDistance() : this.computed; 
  }

  get similarity(){
    return 1.0 / (1.0 + this.distance);
  }

  computeDistance(){
    let innerSum = 0;

    for(let i = 0; i < this.v1.length; i++){
      innerSum += Math.pow((this.v1.get(i) - this.v2.get(i)) ,2);
    }

    this.computed = Math.sqrt(innerSum);
    return this.computed;
  }
}

// class Result{
//   constructor(ob1, ob2, value){

//   }
// }

export function euclidFromIDs(ids, updateDB = false){
  let results = [];
  // const LIMIT = id.length; 
  const LIMIT = 50; 

  for(let i = 0; i < LIMIT; i++){
    getPlayer(ids[i]._id)
      .then(player1 => {
        for(let j = i + 1; j < LIMIT; j++){
          getPlayer(ids[j]._id)
            .then(player2 => {
                comparePlayers(player1, player2);
            });
        }
      });
  }
}

export function euclidFromStreaming(){
  let players = []; // {player: p, vector: v}
  let stream = getPlayersStreaming(); 

  stream.on('data', (player) => {
      let vector = createVector(player);
      player.vector = vector;  
      if(vector){
        let obj = {player: player, vector: vector};
        players.push(obj); 
      }
  });

  stream.on('close', () => {
    compareAllPlayers(players);
  });


}

function compareAllPlayers(players){
  let results = [];
  const LIMIT = players.length; 
  // const LIMIT = 50; 

  for(let i = 0; i < LIMIT; i++){
    let p1 = players[i].player; 
    let v1 = players[i].vector;
     
    for(let j = i + 1; j < LIMIT; j++){
      let p2 = players[j].player; 
      let v2 = players[j].vector; 

      let euc = new EuclidPair(v1, v2);
      let res = {player1: p1.name, player2: p2.name, distance: euc.distance, similarity: euc.similarity, values: [p1.vector, p2.vector]};
      results.push(res);
    }
  }

  logger(players[20].player.getStat('standardFielding', 2008, 'Rdrs')); 

  results.sort(sortBySim);

  // console.log(util.inspect(results, { showHidden: true, depth: null })); 
}


function sortBySim(result1, result2){
  if(result1.similarity > result2.similarity){
    return -1; 
  }
  else if (result1.similarity < result2.similarity){
    return 1; 
  }
  else{
    return 0; 
  }
}


function createVector(player){
  let stats = player.yearlyStats.filter(filterBatting2015).filter(hits);
  if(stats.length){
    return new Vector([stats[0].value]); 
  }
  else{
    return false; 
  }

}

function comparePlayers(player1, player2){
   let p1Stats = player1.yearlyStats.filter(filterBatting2015).filter(hits);
   let p2Stats = player2.yearlyStats.filter(filterBatting2015).filter(hits);

   if(p1Stats.length > 0 && p1Stats.length === p2Stats.length){
    // console.log('Gucci', player1.name, p1Stats, player2.name, p2Stats); 
    let v1 = new Vector([p1Stats[0].value]);
    let v2 = new Vector([p2Stats[0].value]);
    let euc = new EuclidPair(v1, v2);
    console.log(`${player1.name} and ${player2.name} \t - `, euc.distance, euc.similarity);
   }
   else{
    // console.log('no gucci'); 
   }

}

function filterBatting2015(stat){
  if(stat.group !== 'standardBatting'){
    return false; 
  }

  if(stat.year !== 2015){
    return false; 
  } 

  return true; 
}

function hits(stat){
  return stat.name === 'H';
}





/**************************** TESTING ****************************/
// getIds()
//   .then((ids) => euclidFromIDs(ids))
//   .catch(console.log); 

// let v1 = new Vector([1,2,5]);
// let v2 = new Vector([3,3,6]);

// let euc = new EuclidPair(v1, v2);
// console.log(euc);
// console.log(euc.distance);
// console.log(euc.similarity);