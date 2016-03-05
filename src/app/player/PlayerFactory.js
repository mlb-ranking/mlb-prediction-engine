"use strict";

/**
 * All Player JSON files should be of the following format: 
 *     {
 *         jsonLocation: //location of this file
 *         bio: {name,position}, 
 *         stats:{//depends on source}, 
 *         source: {url, fileLocation, }
 *     }
 */

//Player Types
import Player from './Player.js'; 
// import BaseballReferencePlayer from './BaseballReferencePlayer';

import fsp from 'fs-promise'; 

//Factory Function 
function PlayerFactory(jsonDir, source = Player){
    this.players = new Set();               // Set of all of the players
    this.source = source;                   // What types of players this factory is going to create
    this.jsonPlayersDir = jsonDir;          // Directory of files
    this.jsonPlayersFiles = [];             // JSON Files of players 
    this.getJSONFiles();
}

/*
|--------------------------------------------------------------------------
| Properties
|-------------------------------------------------------------------------- 
| 
|
*/



/*
|--------------------------------------------------------------------------
| Static Util Methods
|--------------------------------------------------------------------------
|   - getJSONFiles
|   - getPitchers 
|   - getPosition  
|
*/

/**
 * Get all of the JSON files 
 * @param  {[type]} dir [description]
 * @return Promise
 */
PlayerFactory.prototype.getJSONFiles = function(update = false, dir = this.jsonPlayersDir){
    if(this.jsonPlayersFiles.length === 0 || update){
        this.jsonPlayersFiles = fsp.readdirSync(dir).filter((file) => {if(file.includes('.json')) return true});
    }
    
    return this.jsonPlayersFiles; 
};

// PlayerFactory.prototype.getPitchers = function(dir){
//     return this.players.filter((player) => {
//         if (player.position == 'pitcher') return true; 
//     });
// };


// PlayerFactory.prototype.getPositionPlayers = function(dir){
//     return this.players.filter((player) => {
//         if (player.position == 'position') return true; 
//     });
// };







/*
|--------------------------------------------------------------------------
| Creation
|--------------------------------------------------------------------------
|   - createPlayer
|
*/

/**
 * Create a player of a particular source 
 * @param  {Object} options creation configuration
 * @param  {Object} data player reprsented by a JSON object
 * @return Player
 */
PlayerFactory.prototype.createPlayer = function(jsonContents){
    let player = new this.source(jsonContents);
    this.players.add(player); 
    return player; 
};

/**
 * Using the source and files properties create all of the players 
 * 
 * @return {Promise} When all of the promises are finished
 */
PlayerFactory.prototype.createPlayers = function(){
    let promises = [];

    for(let file of this.getJSONFiles()){
        let promise = fsp.readFile(this.jsonPlayersDir + file)
            .then((contents) => {
                let jsonContents = JSON.parse(contents);
                this.createPlayer(jsonContents);
            })
            .catch(console.log);
        promises.push(promise); 
    }

    return Promise.all(promises); 
}


/*
|--------------------------------------------------------------------------
| Testing & Debug
|--------------------------------------------------------------------------
|   
|
*/
 
module.exports = PlayerFactory;