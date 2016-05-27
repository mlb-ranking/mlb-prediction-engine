// import { getPlayer, getPlayersStreaming } from './../index';
import { Vector } from './../datastructures/Vector';
import { PredictionModel } from './../PredictionModel';

// Dev stuff
import { logger } from 'js-utils';

class StatListNotSetError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StatListNotSetError';
  }
}

class StatNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StatNotFound';
    this.console = false;
  }
}

export class EuclidPredictions extends PredictionModel {

  /**
   * Setup a euclid prediction set
   * @param  {Array}  players
   * @param  {Array}  statList
   */
  constructor(players = [], statList = []) {
    super(players);
    this.statList = [];

    if (statList.length) {
      this.statList = statList;
    }
  }

  /**
   * Add a stat to the statlist
   * @param {String} group Stat group name (e.g. 'standardBatting')
   * @param {Integer} year  integer of the year for the stat
   * @param {String} name  the name of the stat
   * @return {EuclidPredictions}
   */
  addStat(group, year, name) {
    if (!group || !year || !name) {
      throw new Error('Must have group year and name!');
    }
    this.statList.push([group, year, name]);
    return this;
  }

  /**
   * Add a player to the players set
   * @param {Player} player
   * @throws {Error} If statlist isn't set
   * @return {EuclidPredictions}
   */
  addPlayer(player) {
    if (this.statList.length === 0) {
      throw new StatListNotSetError('StatList must be set!');
    }

    try {
      const vector = this.createVector(player);
      player.addVector(vector);
      this.players.push(player);
      this.playersMap.set(player.id, player);
    } catch (err) {
      // log this error somewhere
      if (err.console !== false) {
        logger(err);
      }
    }

    return this;
  }

  /**
   * Create the vector for this euclid set using the provided statlist
   * @param  {Player} player
   * @throws {Error} If a player doesn't have one of the stats
   * @return {Vector}        vector in order of the statList
   */
  createVector(player) {
    const vector = new Vector();

    for (const stat of this.statList) {
      const statVal = player.getStat(...stat);

      if (statVal) {
        vector.add(statVal, stat.toString());
      } else {
        throw new StatNotFoundError(`Stat ${stat} doesn't exist for ${player.name}!`);
      }
    }
    return vector;
  }

  /**
   * Compare all of the pairs of players to determine the distance
   * and similarity between them.
   * @return {Object}   Object containg the results of the computation with player ids
   */
  compute() {
    if (this.players.length === 0) {
      throw new Error('No players to compute!');
    }

    this.results.list = [];
    this.results.statList = this.statList;

    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const result = this.comparePair(this.players[i], this.players[j]);
        this.results.list.push(result);
      }
    }
    logger(`Computed ${this.results.list.length} pairs of players.`);
    return this.results;
  }

  /**
   * Compare two players and compute their distance
   * @param  {Player} p1
   * @param  {Player} p2
   * @return {Object}    Object containing the players and results of the comparision
   */
  comparePair(p1, p2) {
    if (!p1.vector || !p2.vector) {
      throw new Error('Players must have an attached vector!');
    }

    const distance = p1.vector.getdistance(p2.vector);
    const similarity = 1.0 / (1.0 + distance);
    const result = { player1: p1.id, player2: p2.id, distance, similarity };
    return result;
  }

}
