import { mongoose } from './../util/mongoose';
import Player from './../models/Player';
import { Similiarties } from './similarities/index';
import { KNearestNeighbors } from './knearestNeighbors/index';
import { logger } from 'js-utils';
import { Vector } from './datastructures/Vector';



// getPlayersStreaming((doc) => console.log(doc._id));
// euclidFromStreaming();


export function close() {
  mongoose.connection.close();
}


export function getPlayer(id) {
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


export function getPlayerStream() {
  const stream = Player.find().stream(0);

  stream.on('close', () => {
    close();
  });

  return stream;
}

function displayResults(predictions, results) {
  logger(`Total Results = ${results.list.length}`);
  const res = results.list.splice(0, 5);
  // res = results.list;
  logger(results.statList);
  for (const result of res) {
    const p1 = predictions.getPlayer(result.player1);
    const p2 = predictions.getPlayer(result.player2);
    logger(`${p1.name} and ${p2.name}`);
    logger(p1.vector.values);
    logger(p2.vector.values);
    logger(`eD = ${result.euclideanDistance} eS = ${result.euclideanSimilarity} \
jS = ${result.jaccardSimilarity} cS = ${result.cosineSimilarity} \n`);
  }
}

function updateDB(predictions, results) {

}

function euclidPredictions() {
  mongoose.connect('mongodb://localhost/test');

  // console.time("computeEuclid");
  logger('Running Elucid Predictions...');
  const stream = getPlayerStream();
  const predictions = new Similiarties();

  // predictions.addStat('standardBatting', 2015, 'AB', '>', 100);
  predictions.addStat('standardBatting', 2015, 'H');
  predictions.addStat('standardBatting', 2015, 'G', '>', 70);
  // predictions.addStat('standardBatting', 2015, 'RBI');
  // predictions.addStat('standardBatting', 2015, 'BA');
  // predictions.addStat('postSeasonBatting', 2015, 'G', '>', 70);

  stream.on('data', (player) => {
    predictions.addPlayer(player);
  });

  stream.on('close', () => {
    const results = predictions.compute();
    // const result = results.list[results.list.length - 1];
    // const player = predictions.getPlayer(result.player2);
    // logger(result);
    // displayResults(predictions, results);
    knearestNeighbor(results);
  });
}

function knearestNeighbor(results) {
  logger('Running K Nearest knearestNeighbor');
  const predictions = new KNearestNeighbors(results);


}

function similarityTests() {
  const c1 = new Vector([3, 45, 7, 2]);
  const c2 = new Vector([2, 54, 13, 15]);
  logger(Vector.cosineSimilarity(c1, c2)); // 0.972

  const e1 = new Vector([0, 3, 4, 5]);
  const e2 = new Vector([7, 6, 3, -1]);
  logger(Vector.euclideanDistance(e1, e2)); // 9.74679434481
}

// similarityTests();

euclidPredictions();
// knearestNeighbor();
