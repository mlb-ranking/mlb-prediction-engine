"use strict";

import {logger} from 'js-utils';
import {mongoose, Schema} from './../util/mongoose';
import StatisticModel from './Statistic.js';

const PlayerSchema = new Schema({
    name:{ type: String, required: true },  
    // first_name:{ type: String, required: true },  
    // last_name:{ type: String, required: true },  
    slug: {type: String, required: true},
    key: {type: String, required: true},
    team:{ type: String },
    type:{ type: String },  //Position or Pitcher
    dob: {type: Date},      
    height: {type: String}, 
    weight: {type: Number}, // Pounds
    bats: {type: String},
    throws: {type: String}, 
    age: {type: Number},
    yearlyStats: {type: Array, ref: 'Statistic'},
    json: { type: Object },
    // similarities: {type: Array}
    // _avgStats: {type: Array, ref: 'Statistic'}
    // _contract: { type: Schema.Types.ObjectId, ref: 'Contact' }
});


/**
 * Get a stat from this player 
 * @param  {String} type 
 * @param  {Integer} year 
 * @param  {String} name name or abbrevation of stat ex: 'H'
 * @return {Mixed}      the value of the stat
 */ 
PlayerSchema.methods.getStat = function(type, year, name){
    if(!this.statHashMap){
        buildStatHashMap(this); 
    }

    return this.statHashMap[statKey(type, year, name)];   
};



module.exports = mongoose.model('Player', PlayerSchema);

/**
 * Create a hashmap attached to this player to allow for quick stat lookup 
 * @param  {Player} player 
 */
function buildStatHashMap(player){
    let statMap = [];
    for(let statObj of player.yearlyStats){
        statMap[statKey(statObj.group, statObj.year, statObj.name)] = statObj.value; 
    }
    player.statHashMap = statMap; 
}


/**
 * Create a unique stat key for this stat
 * @param  {String} type 
 * @param  {Number} year 
 * @param  {String} name 
 * @return {String}      Key to lookup this stat
 */
function statKey(type, year, name){
    return `${type}-${year}-${name}`; 
}

/************************************************ TODO ************************************************/

/**
 * Find similar players based on similarities, attributes, and more. 
 *     
 * @param  {Object} options
 * @return {Array.<Players>}         
 */
PlayerSchema.methods.getSimilarPlayers = function(options = {}){
    throw new Error('Needs to be defined.') 
};
