// import { getPlayer, getPlayersStreaming } from './../index';
import { Vector } from './../vectors';
import { EuclidPair } from './../datastructures/EuclidPair';

class EuclidPredictions {
  constructor(players, statList) {
    this.players = players;
    this.statList = statList;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  // Compare each of the pairs of players return results object
  comparePairs() { }


}
