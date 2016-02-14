"use strict";
import Player from './Player.js'

//Base Player Prototype
BaseballReferencePlayer.prototype = new Player;  

//Default Properties


function BaseballReferencePlayer(options){
    this.options = options; 
    this.getJSONFile(options.filename);
}


/**
 * Only iterate through the entire file one time. 
 * Everything else can be done more efficiently with lookup tables and other 
 * datastructures. 
 * 
 * @return {boolean} 
 */
BaseballReferencePlayer.prototype.generateOptData = function(){
    if(this.optData === false){
        let opt = {};
        for(let category in this.data.stats){
            for(let year of this.data.stats[category]){
                let obj = opt[year.Year] || {};
                for(let statName in year){
                    let statNameLower = statName.toLowerCase(); 
                    if(obj[statNameLower]) statNameLower = statNameLower + '-' + category.toLowerCase(); 
                    obj[statNameLower] = year[statName];
                }
                opt[year.Year] = obj; 
            }
        }
        this.optData = opt; 
        return true; 
    }
    else{
        return true; 
    }
}

module.exports = BaseballReferencePlayer;
