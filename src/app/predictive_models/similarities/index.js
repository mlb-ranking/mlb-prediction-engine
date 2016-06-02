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

class StatNotQualified extends Error {
  constructor(message) {
    super(message);
    this.name = 'StatNotQualified';
    this.console = false;
  }
}

export class Similiarties extends PredictionModel {

  /**
   * Setup a euclid prediction set
   * @param  {Array}  players
   * @param  {Array}  statList
   */
  constructor(players = [], statList = []) {
    super(players);
    this.statList = [];
    this.qualifiers = [];

    if (statList.length) {
      this.statList = statList;
    }
  }

  /**
   * Add a stat to the statlist
   * @param {String} group Stat group name (e.g. 'standardBatting')
   * @param {Integer} year  integer of the year for the stat
   * @param {String} name  the name of the stat
   * @return {Similiarties}
   */
  addStat(group, year, name, sign, value) {
    if (!group || !year || !name) {
      throw new Error('Must have group year and name!');
    }

    if (sign && value) {
      this.qualifiers.push([sign, value]);
    } else {
      this.qualifiers.push(false);
    }

    this.statList.push([group, year, name]);
    return this;
  }


  /**
   * Add a player to the players set
   * @param {Player} player
   * @throws {Error} If statlist isn't set
   * @return {Similiarties}
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

    for (let i = 0; i < this.statList.length; i++) {
      const stat = this.statList[i];
      const statVal = player.getStat(...stat);

      if (statVal) {
        if (this.qualifiers[i]) {
          const qualifer = this.qualifiers[i];
          if (!this.isQualifed(statVal, qualifer)) {
            throw new StatNotQualified(`Stat ${stat} with value of ${statVal} 
                doesn't qualify with ${qualifer[0]} and ${qualifer[1]}`);
          }
        }
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
    if (this.players.length <= 1) {
      throw new Error('Not enough players to compute!');
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

    const euclideanRes = this.euclideanResult(p1, p2);
    const jaccardRes = this.jaccardResult(p1, p2);
    const cosineRes = this.cosineResult(p1, p2);

    const result = {
      player1: p1.id,
      player2: p2.id,
      euclideanDistance: euclideanRes.distance,
      euclideanSimilarity: euclideanRes.similarity,
      jaccardSimilarity: jaccardRes.similarity,
      cosineSimilarity: cosineRes.similarity,
    };

    return result;
  }

  /**
   * Determine the similarities and distances based on the euclidean algorithm
   * @param  {Player} p1
   * @param  {Player} p2
   * @return {Object}    Resulting object with similarity and distance
   */
  euclideanResult(p1, p2) {
    const distance = p1.vector.getEuclideandistance(p2.vector);
    const similarity = p1.vector.getEuclideanSimilarity(p2.vector, distance);
    return { distance, similarity };
  }

  /**
   * Determine the similaries based on the Jaccard Index
   * @param  {Player} p1
   * @param  {Player} p2
   * @return {Object}    Resulting object with similarity and distance
   */
  jaccardResult(p1, p2) {
    const similarity = p1.vector.getJaccardSimilarity(p2.vector);
    return { similarity };
  }

  /**
   * Determine the similarites of based on the cosine
   * @param  {Player} p1
   * @param  {Player} p2
   * @return {Object}    Resulting object with similarity
   */
  cosineResult(p1, p2) {
    const similarity = p1.vector.getCosineSimilarity(p2.vector);
    return { similarity };
  }

}
