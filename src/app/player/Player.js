"use strict";

import PlayerFactory from './PlayerFactory.js'; 
import fsp from 'fs-promise'; 

function Player(){}

/*
|--------------------------------------------------------------------------
| Default Properties
|--------------------------------------------------------------------------
|
*/
Player.prototype.options = {};          //Config
Player.prototype.data = false;          //False until loaded
Player.prototype.isReady = false;       //False until loaded
Player.prototype.readyPromise = null;   //False until loaded
Player.prototype.optData = false;       //Optimized data structure for storing and accessing stats fast
Player.prototype.uid = -1;              //Unique ID
Player.prototype.name = '';             //Simple Name for easy debuggin
Player.prototype.positon = '';          //player or position 

/*
|--------------------------------------------------------------------------
| Methods to be defined
|--------------------------------------------------------------------------
|   - hasStats
|   - hasYear
|   - generateOptData
|
*/
Player.prototype.hasStats = function(stats, year){throw new Error('Method hasStats not defined')}; 
Player.prototype.hasYear = function(stats, year){throw new Error('Method hasYear not defined')}; 
Player.prototype.generateOptData = function(){throw new Error('Method generateOptData not defined')}; 

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
|   - getStat
|   - getStatVector
|
*/

/**
 * Get a stat for this player for the supplied year. Using the optimiszed and normalized data
 *     that should be the same across all sources.
 * 
 * @param  {string} statname [description]
 * @param  {integer} year     [description]
 * @return {mixed} 
 */
Player.prototype.getStat = function(statname, year){
    if(this.ready()){   
        statname = statname.toLowerCase(); 
        return this.optData[year][statname]; 
    }
    return false; 
}

/**
 * Get a stat for this player for the supplied year
 * @param  {[type]} statname [description]
 * @param  {[type]} year     [description]
 * @return {[type]}          [description]
 */
Player.prototype.getStatVector = function(stats, year){
    if(this.ready()){ 
        let vector = [];
        for(let stat of stats){
            let result = this.getStat(stat,year); 

            if(result){
                vector.push(this.getStat(stat, year));
            }
            else{
                throw new Error(`Stat ${stat} not found in data for year ${year}`); 
                return false; 
            }
        }

        return vector; 
    }

    return false; 
}

/*
|--------------------------------------------------------------------------
| Util Methods
|--------------------------------------------------------------------------
|   - getJSONFile
|
*/

/**
 * Get the JSON file for this player. Set the readyPromise property on this 
 * object to read it when ready. 
 * 
 * @param  {string} filename full filename for the JSON file
 */
Player.prototype.getJSONFile = function(filename){
    this.readyPromise = fsp.readFile(`${filename}`)
        .then((data) => {
            this.data =  JSON.parse(data);
            this.isReady = true; 

            this.generateOptData(); //Immediate generate opt datastructure 

            //Setup Basic properites
            this.name = this.data.bio.name;
            this.position = this.data.bio.position;
            this.uid = false; //TODO
        })
        .catch((err) => { throw new Error(`Error reading JSON file ${filename}`) });
}

/**
 * Determine if this player is ready to be used. 
 * 
 * @return {boolean} 
 */
Player.prototype.ready = function(){
    if(this.optData === false) this.generateOptData();
    
    if(this.isReady && this.optData !== false){
        return true; 
    }
    else{
        if(!this.isReady) console.log("[LOADING JSON] File Not Ready");
        else if(this.optData === false) this.generateOptData();
        return false; 
    }
}



module.exports = Player;