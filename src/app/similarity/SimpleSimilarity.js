"use strict";

import PlayerFactory from '../player/PlayerFactory.js'
import distances from './distances.js'
import fileUtil from '../../util/files.js'

let yearToCompare = 2015;
let statsToCompare = ['pa', 'h', 'hr', 'rbi', 'ba'];

let BaseBallReferenceFactory;
let allPlayers;
let positionPlayers;
let pitchers;

let similarites = {
    meta: {
        "year": yearToCompare,
        "stats": statsToCompare,
        "date": new Date(),
        "distanceAlgorithm": 'euclidean', 
        "similairtyAlgorith": '1/(1 + distance)',
        "qualifier": 'plate appearences > 502'
    },
    results: []
}; 


/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
|   
|
*/

function computeSimilairty(distance){
    return 1 / (1 + distance); 
}

function init(){
    BaseBallReferenceFactory = new PlayerFactory({source: 'baseballreference', jsonDir: 'data/baseballref/json/'});
    allPlayers = BaseBallReferenceFactory.createPlayers();

    return Promise.all(BaseBallReferenceFactory.playerPromises)
        .then(()=>{
            positionPlayers = BaseBallReferenceFactory.getPositionPlayers();
            pitchers = BaseBallReferenceFactory.getPitchers();
        })
}


/*
|--------------------------------------------------------------------------
| Testing & Debug
|--------------------------------------------------------------------------
|   
|
*/

//Load up all of the JSON files
init()
    .then(()=>{

        //Filter Players 
        positionPlayers = positionPlayers.filter(player => {
            try{
                return player.getStat('pa', yearToCompare) > 502;
            }
            catch(err){
                return false; 
            }
        });

        //Compute Similairties for each pair of players 
        let count = 0; 
        for(let i=0; i<positionPlayers.length; i++){
            let playerI = positionPlayers[i];

            try{
                let playerIVector = playerI.getStatVector(statsToCompare, yearToCompare);
                for(let j=i+1; j<positionPlayers.length; j++){
                    let playerJ = positionPlayers[j];
                    try{
                        let playerJVector = playerJ.getStatVector(statsToCompare, yearToCompare);
                        let sim = {};
                        sim.players = [playerI.name, playerJ.name];
                        sim.distance = distances.computeEuclidNDim(playerIVector, playerJVector);
                        sim.similarity = computeSimilairty(sim.distance); 

                        similarites.results.push(sim); 
                        count++;
                    }
                    catch(err){
                        console.error(err);
                    }
                }
            }
            catch(err){
                console.error(err);
            }
        }

        //Post Processing Meta
        similarites.meta.pairs = count; 

        //Sort by similarity score
        similarites.results.sort(function(a, b){
            if(a.similarity < b.similarity){
                return 1;
            }
            else if(a.similarity > b.similarity){
                return -1; 
            }
            else{
                return 0; 
            }
        });

        //Write to File
        fileUtil.writeJSON('data/baseballref/results/', 'result-new', similarites, {ts: true});

        //Output for CSV Table
        similarites.results.splice(0,25).map((result) => {
            console.log(`"${result.players[0]}", "${result.players[1]}", ${result.distance}, ${result.similarity}`);
        });

    });
