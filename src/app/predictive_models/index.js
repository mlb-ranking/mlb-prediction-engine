import { mongoose } from './../util/mongoose';
import Player from './../models/Player';
import { EuclidPredictions } from './euclid/index';
import { logger } from 'js-utils';

mongoose.connect('mongodb://localhost/test');

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


function euclidPredictions() {
  logger('Running Elucid Predictions...');
  const stream = getPlayerStream();
  const predictions = new EuclidPredictions();

  predictions.addStat('standardBatting', 2015, 'H');
  predictions.addStat('standardBatting', 2015, 'HR');
  predictions.addStat('standardBatting', 2015, 'RBI');
  predictions.addStat('standardBatting', 2015, 'BA');
  predictions.addStat('postSeasonBatting', 2015, 'G');

  stream.on('data', (player) => {
    predictions.addPlayer(player);
  });

  stream.on('close', () => {
    const results = predictions.compute();
    const result = results.list[23];
    const player = predictions.getPlayer(result.player2);

    logger(player);
  });
}


euclidPredictions();
