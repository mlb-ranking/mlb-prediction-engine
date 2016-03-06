"use strict";

import fsp from 'fs-promise'; 
import Player from './Player.js'; 
import util from 'util'; 

/**
 * All Player JSON files should be of the following format: 
 *     {
 *         jsonLocation: //location of this file
 *         bio: {name,position}, 
 *         stats:{//depends on source}, 
 *         source: {url, fileLocation, }
 *     }
 */

class PlayerFactory{
    constructor(jsonDir){
        this.playersMap = new Map();                                // player-id -> Player
        this.jsonDir = jsonDir;                                     // Directory of player data json files
        this.files = this.getFilesList(this.jsonDir);
        this.playersLoaded = false;          
    }

    getFilesList(dir){
        let files = [];
        files = fsp.readdirSync(dir).filter((file) => {if(file.includes('.json')) return true});
        return files; 
    }

    createPlayers(){
        let promises = [];
        for(let file of this.files){
        let promise = fsp.readFile(this.jsonDir + file)
            .then((contents) => {
                this.createPlayer(JSON.parse(contents));
            })
            .catch(console.error);
            promises.push(promise); 
        }
        return Promise.all(promises).then(() => this.playersLoaded = true);
    }

    createPlayer(playerData){
        let player = new Player(playerData);
        this.playersMap.set(player.id, player); 
        return player; 
    }

    getPlayers(filter){
        let players = new Map(); 
        for(let player of this.playersMap.values()){
            if (filter(player)) players.set(player.id, player); 
        }
        return players;
    }

    getPitchers(){
        return this.getPlayers((player) => {
            return player.type === 'pitcher';
        });
    }

    getPositionPlayers(){
        return this.getPlayers((player) => {
            return player.type === 'position';
        });    
    }
}


module.exports = PlayerFactory;