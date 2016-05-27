// import { logger } from 'js-utils';
import { getPlayer, getPlayersStreaming } from './../index';
import { Vector } from './../vectors';

class EuclidPair {

  /**
   *
   * @param  {Vector} v1 [description]
   * @param  {Vector} v2 [description]
   * @return {[type]}    [description]
   */
  constructor(v1, v2) {
    if (v1.length !== v2.length) {
      console.log('Must be the same length');
      throw new Error('Must be the same length');
    } else {
      this.v1 = v1;
      this.v2 = v2;
    }
  }

  get distance() {
    return this.computed === undefined ? this.computeDistance() : this.computed;
  }

  get similarity() {
    return 1.0 / (1.0 + this.distance);
  }

  computeDistance() {
    let innerSum = 0;

    for (let i = 0; i < this.v1.length; i++) {
      innerSum += Math.pow((this.v1.get(i) - this.v2.get(i)), 2);
    }

    this.computed = Math.sqrt(innerSum);
    return this.computed;
  }
}

export function euclidFromIDs(ids) {
  const LIMIT = 50;

  for (let i = 0; i < LIMIT; i++) {
    getPlayer(ids[i]._id)
      .then(player1 => {
        for(let j = i + 1; j < LIMIT; j++) {
          getPlayer(ids[j]._id)
            .then(player2 => {
                comparePlayers(player1, player2);
            });
        }
      });
  }
}

/**
 * Look at each pair of players and determine the similairity between the vectors
 * @param  {Array.<Player>} players
 * @return {Object}
 */
function compareAllPlayers(players){
  let results = [];
  const LIMIT = players.length;

  for(let i = 0; i < LIMIT; i++) {
    let p1 = players[i].player;
    let v1 = players[i].vector;
     
    for(let j = i + 1; j < LIMIT; j++) {
      let p2 = players[j].player;
      let v2 = players[j].vector;

      let euc = new EuclidPair(v1, v2);
      let res = {player1: p1.name, player2: p2.name, distance: euc.distance, similarity: euc.similarity, values: [p1.vector, p2.vector]};
      results.push(res);
    }
  }

  results.sort(sortBySim);
  return results;
}

/**
 * Compue euclidean from a streaming API
 * @return {[type]} [description]
 */
export function euclidFromStreaming() {
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


function sortBySim(result1, result2) {
  if (result1.similarity > result2.similarity) {
    return -1;
  } else if (result1.similarity < result2.similarity) {
    return 1;
  }
  return 0;
}


/**
 * Creat the same vector in order for every player
 * @param  {Player} player
 * @return {Vector|boolean}
 */
function createVector(player) {
  const hitstat = player.getStat('standardBatting', 2015, 'H');
  if (hitstat) {
    return new Vector([hitstat]);
  }
  return false;
}
