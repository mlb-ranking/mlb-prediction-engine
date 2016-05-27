// import { getPlayer, getPlayersStreaming } from './../index';
import { Vector } from './../vectors';
import { EuclidPair } from './../datastructures/EuclidPair';

const players = []; // Array of Player objects
const statArgs = []; // Array of the stat arguments (ex: ['standardBatting', 2015, 'H'])

/**
 * Create the same vector in order for every player
 * @param  {Player} player
 * @return {Vector|boolean}
 */
function createVector(player) {
  const hits = player.getStat('standardBatting', 2015, 'H');
  if (hits) {
    return new Vector([hits]);
  }
  return false;
}


