"use strict";

// import PlayerFactory from './PlayerFactory.js'; 
import fsp from 'fs-promise'; 
import md5 from 'md5'; 

function Player(json){
    this.data = false;

    if(typeof json === 'object'){
        this.jsonData = json;
        this.filename = json.jsonLocation;
        this.optimizeData();
    }
    else if(json.includes('.json')){
        this.jsonData = json; 
        //Read the file and add it to this player
        
    }
    else{
        this.filename = false;
        this.jsonData = false;
    } 

}

Player.prototype.DEFAULT_YEAR = 2015;

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
 * @return {mixed} Returns the stat for that year or false if not found
 */
Player.prototype.getStat = function(statname, year = this.DEFAULT_YEAR){
    if(!this.data) this.optimizeData();
    statname = statname.toLowerCase(); 
    let result = this.data[year][statname]; 
    return result ? result : false; 
};

/**
 * Get a stat for this player for the supplied year
 * @param  {Array} stats Array of stats
 * @param  {Integer} year     year of the stats 
 * @return {Array}          ex: getStatVector(['h', 'r', 'sb'], 2015) -> [5,32,13]
 */
Player.prototype.createStatVector = function(stats, year = this.DEFAULT_YEAR){
    if(!this.data) this.optimizeData(); 

    let vector = [];
    for(let stat of stats){
        let result = this.getStat(stat,year); 

        if(result){
            vector.push(result);
        }
        else{
            throw new Error(`Stat ${stat} not found in data for year ${year}`); 
            return false; 
        }
    }
    return vector.length > 0 ? vector : false; 
};

/*
|--------------------------------------------------------------------------
| Util Methods
|--------------------------------------------------------------------------
|   - getJSONFile
|
*/
Player.prototype.optimizeData = function(){
    if(this.data) return this.data; 
    this.data = true; 

    let stats = {};
    this.name = this.jsonData.bio.name;
    this.type = this.jsonData.bio.position;

    //Ability to create a download obj and redownload this player
    this.download = this.jsonData.source;  

    console.log(this.jsonData);
    this.jsonData = 'optimized';
    console.log(this);
};


Player.prototype.createUID = function(playerName, url){
    return (playerName + '-' + md5(url)).toLowerCase().replace(' ', '-');
};

/**
 * Get the JSON file for this player. Set the readyPromise property on this 
 * object to read it when ready. 
 * 
 * @param  {string} filename full filename for the JSON file
 */
Player.prototype.getJSONFile = function(filename = this.filename){
    fsp.readFile(`${filename}`)
        .then((data) => {
            this.data =  JSON.parse(data);
            // this.name = this.data.bio.name;
            // this.position = this.data.bio.position;
            // this.uid = false; //TODO
        })
        .catch((err) => { throw new Error(`Error reading JSON file ${filename}`) });
};

module.exports = Player;


/*
|--------------------------------------------------------------------------
| Testing
|--------------------------------------------------------------------------
|   - getJSONFile
|
*/
