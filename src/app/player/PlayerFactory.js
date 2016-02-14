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
import BaseballReferencePlayer from './BaseballReferencePlayer';

import fsp from 'fs-promise'; 

//Factory Function 
function PlayerFactory(options = {}){
    this.options = options;
    this.players = [];             //References to all of the players created
    this.playerPromises = [];      //References to all of the player is ready promises

    if(options.jsonDir) this.jsonDir = options.jsonDir; 
    if(options.source) this.source = options.source; 
}

/*
|--------------------------------------------------------------------------
| Properties
|--------------------------------------------------------------------------
|  - source: location of the data
|  - jsonDir: location of the data
|  - jsonFiles: location of the data
|
*/
PlayerFactory.prototype.source      = BaseballReferencePlayer;
PlayerFactory.prototype.jsonDir     = false;    //Location of the JSON files
PlayerFactory.prototype.jsonFiles   = [];       //All file names 


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
PlayerFactory.prototype.getJSONFiles = function(dir = this.jsonDir){
    return fsp.readdirSync(dir);
};

PlayerFactory.prototype.getPitchers = function(dir){
    return this.players.filter((player) => {
        if (player.position == 'pitcher') return true; 
    });
};


PlayerFactory.prototype.getPosition = function(dir){
    return this.players.filter((player) => {
        if (player.position == 'position') return true; 
    });
};







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
PlayerFactory.prototype.createPlayer = function(options){

    //Choose which player type to generate
    switch((options.source) ? options.source : this.source){
        case "baseballreference":
            this.creator = BaseballReferencePlayer;
            break;
        case "other":
            this.creator = OtherPlayer;
            break;
    }
    
    let player = new this.creator(options);
    this.players.push(player); 
    this.playerPromises.push(player.readyPromise);
    return player; 
};

/**
 * Using the source and files properties create all of the players 
 * 
 * @return {[type]} [description]
 */
PlayerFactory.prototype.createPlayers = function(){
    for(let file of this.getJSONFiles()){
        if(file.includes('.json')){
            let player = this.createPlayer({filename: `${this.jsonDir}${file}`});
             
        }
    }

    return this.players; 
}


/*
|--------------------------------------------------------------------------
| Testing & Debug
|--------------------------------------------------------------------------
|   
|
*/

// try{
//     //Testing
//     let BaseBallReferenceFactory = new PlayerFactory({source: 'baseballreference', jsonDir: 'data/baseballref/json/'});    
//     let allPlayers = BaseBallReferenceFactory.createPlayers(); 

//     //Load Up all of the players
//     Promise.all(BaseBallReferenceFactory.playerPromises)
//         .then(
//             () => {
//                 console.log(allPlayers.length); 
//             }
//         )
//         .catch((err) => console.log(err)); 


// }
// catch(err){
//     console.log("ERRRO", err);
// }
 
module.exports = PlayerFactory;