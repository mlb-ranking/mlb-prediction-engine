/**
 * @fileoverview first draft to compute the jaccard similarites on the JSON files   
 * @author JoshJRogan@gmail.com (Josh Rogan)
 */

import fsp from 'fs-promise'; 

//Constants
const JSON_FILES_LOC        = 'data/baseballref/json';
const JSON_FILE_PREFIX      = 'route.cgi?'; 
const RESULTS_FILE_LOC      = 'data/baseballref/results'; 

let players                 = [];  //Player Objects 
let statsToCompare          = ['H', 'HR', 'BB', 'R', 'G']; //Stat dimensions
let yearToCompare           = 2015;    //Year to look at stats 


/**
 * Read all of the JSON files and add it the players array
 * @return {Promise} 
 */
function setup(){
    return fsp.readdir(JSON_FILES_LOC)
        .then((files) => {

            //Filter out only json files
            files = files.filter(filename => {
                if(!filename.includes(JSON_FILE_PREFIX)) return false; 
                else if(!filename.includes('.json')) return false; 
                // else if(filename.includes('120074')) return true; 
                // else if(filename.includes('121347')) return true; 
                else return true; 
            }); 

            // Start Reading the files
            let readingPromises = [];
            files.map((filename) => {
                let promise = fsp.readFile(`${JSON_FILES_LOC}/${filename}`)
                        .then((data) => {
                            data = JSON.parse(data); 
                            players.push(data);  
                            // console.log("[READING]", data); 
                        });
                readingPromises.push(promise); 

            });

            return Promise.all(readingPromises); 
        })
        .catch(err => console.log(`[ERROR] Error during setup`, err));
}

//Create a stat vector for each player
function createStatsVector(player){
    let vector  = []; //Array of coordinate pairs
    
    //Validate Stats Vector
    if(player.stats === undefined) {
        throw new Error('[STATS VECTOR] No stats object');
    }
    if(!Array.isArray(player.stats.standardBatting)) {
        throw new Error('[STATS VECTOR] No standard batting object');
    }

    //Standard Batting for year 2015
    player.stats.standardBatting.map((stats)=>{
        if(stats.Year === yearToCompare && (stats.Lg == 'AL' || stats.Lg == 'NL')){
            for(let statName of statsToCompare){
                if(stats[statName]){
                    vector.push(stats[statName]);
                } 
                else{
                    throw new Error(`[STATS VECTOR] Stat ${statName} not found for ${player.jsonLocation}`);
                }
            }
        }
    });

    if(vector.length === 0) throw new Error(`[STATS VECTOR] No stats found for ${yearToCompare}`);

    return vector; 
}


/**
 * Filter players to only that have all of the stat properties for 
 * that year. 
 * 
 * @param  {Array} stats array of stat properties
 * @param  {integer} year  year of the stat
 * @return {Array.players}       
 */
function filterPlayers(stats,year){
    return players.filter((player)=>{
        
    });
}










/**************************************************** SIMLIARITY ****************************************************/

/**
 * Given an array of coords compute the distance using euclidean 
 *     calculation.  
 *  
 * @param  {Array.points} coords array of points
 * @return {number} the distance between all coordinates
 */
function computeDistance(coordPairs){
    return coordPairs.reduce((prev, curr) => {
        return prev + computeEuclid(curr[0], curr[1]); 
    }, 0);
}

//Helper Function
function computeSimilairty(distance){
    return 1 / (1 + distance); 
}

/**
 * Compute the euclid distance of the n-dimensional vectors. 
 *     Result = straight line Tip to tail
 *     Example Vector: [144, 37, 0, 77] (hits, homeruns, stolen bases, walks)
 * 
 * IMPORTANT: Find other distance algorithms. Doesn't work well on lots of dimensions
 * 
 * @param  {Vector} vector1 n dimensional vector  
 * @param  {Vector} vector2 n dimensional vector  
 * @return {[type]}         [description]
 */
function computeEuclidNDim(vector1, vector2){
    if(vector1.length !== vector2.length) throw new Error(`[COMPUTE EUCLID] Vectors not equal length`);
    

    let inner = 0;
    //Inner = the sum of the difference between each dimension squared
    for(let i = 0; i < vector1.length; i++){
        inner += Math.pow(vector1[i] - vector2[i], 2);
    }

    let result = Math.sqrt(inner)
    console.log(`[DEBUG] Distance between ${vector1} and ${vector2} is ${result}`);
    return result; 
}
/**************************************************** SIMLIARITY ****************************************************/




function run(){

    return setup()
        .then(() => {
            console.log(`[DEBUG] ${players.length} added to the players array.`);
            

            //Filter out players first
            // players = players.slice(0,100);
            // players = filterPlayers(); 

            let similarites = {
                meta: {
                    "year": yearToCompare,
                    "stats": statsToCompare,
                    "date": new Date()
                },
                results: []
            }; 

            let playersAnalyzed = 0;
            for(let i=0; i<players.length; i++){
                try{
                   let playerIVector = createStatsVector(players[i]);
                    for(let j = i + 1; j<players.length; j++){
                        try{
                            let playerJVector = createStatsVector(players[j]);
                            let sim = {};

                            sim.distance = computeEuclidNDim(playerIVector, playerJVector);
                            sim.similarity = computeSimilairty(sim.distance); 
                            sim.players = [players[i].bio.name, players[j].bio.name];
                            similarites.results.push(sim); 
                        }
                        catch(err){
                            console.log(err); 
                        }
                    }
                    playersAnalyzed++;
                }
                catch(err){
                    console.log(err); 
                }                
            }

            similarites.meta.playersAnalyzed = playersAnalyzed;
            similarites.meta.similarites = similarites.results.length;
            //Avg sim, lowest, highest, etc.

            let time = new Date().getTime();
            let filename = `results-${time}.json`;
            fsp.writeFile(`${RESULTS_FILE_LOC}/${filename}`, JSON.stringify(similarites, null, 2));


            // let distance = computeEuclidNDim(vector1, vector2);
            // let sim = computeSimilairty(distance); 


            // try{
            //     computeEuclidNDim(createStatsVector(players[0], 2015), createStatsVector(players[1], 2015));
            // }
            // catch(err){
            //     console.log(err); 
            // }




            
        });
        

    // let distance = computeEuclidNDim(vectorPairs[0][0], vectorPairs[0][1]);    
}


run()
    .catch(err => console.log(err));




