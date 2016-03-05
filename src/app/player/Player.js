"use strict";

import fsp from 'fs-promise'; 
import md5 from 'md5'; 

function Player(json = ''){
    this.data = false;
    this.id = false; 

    if(typeof json === 'object'){
        if(json.jsonData == 'optimized'){
            Object.assign(this, json);
        }
        else{
            this.jsonData = json;
            this.filename = json.jsonLocation;
            this.optimize();
        }
        
    }
    else if(json.includes('.json')){
        //Read the file and add it to this player
        this.filename = json; 
    
    }
    else{
        this.filename = false;
        this.jsonData = false;
    } 

}

Player.prototype.DEFAULT_YEAR = 2015;

/*
|--------------------------------------------------------------------------
| Util Methods
|--------------------------------------------------------------------------
|  
|
*/
Player.prototype.optimize = function(){
    if(this.data) return this; 

    this.data = true;
    this.download = this.jsonData.source;  

    this.name = this.jsonData.bio.name;
    this.team = this.jsonData.bio.team;
    this.id = this.createUID(this.name, this.team, this.download.url);
    this.type = this.jsonData.bio.position;

    //Ability to create a download obj and redownload this player
    this.bio = this.jsonData.bio; 

    //Create Good data structure for accesing this
    this.stats = this.jsonData.stats;

    this.jsonData = 'optimized';

    return this; 
};

Player.prototype.createUID = function(playerName, team, url){
    return (team + '-' + playerName + '-' + md5(url)).toLowerCase().replace(' ', '-');
};

Player.prototype.getStat = function(statname, year = this.DEFAULT_YEAR){
    if(!this.data) this.optimize();
    statname = statname.toLowerCase(); 
    let result = this.data[year][statname]; 
    return result ? result : false; 
};


Player.prototype.createStatVector = function(stats, year = this.DEFAULT_YEAR){
    if(!this.data) this.optimize(); 

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


Player.prototype.addSimilarities = function(type, similarityMap){
    if(!this.similarityMaps) this.similarityMaps = [];
    this.similarityMaps[type] = similarityMap; //player.id -> similarity score
}


Player.prototype.getJSONFile = function(filename = this.filename){
    fsp.readFile(`${filename}`)
        .then((data) => {
            this.data =  JSON.parse(data);
        })
        .catch((err) => { throw new Error(`Error reading JSON file ${filename}`) });
};


Player.prototype.updateJSONFile = function(){
    return fsp.writeFile(this.filename, this.toJSON())
        .then(()=> {})
        .catch(console.log);
};

Player.prototype.toJSON = function(){
    let json = {};
    Object.assign(json, this);
    return JSON.stringify(json); 
};


module.exports = Player;