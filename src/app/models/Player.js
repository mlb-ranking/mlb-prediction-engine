"use strict";

import {log, trace, error} from './../util/loggingHelpers';
import {mongoose, Schema} from './../util/mongoose';
import StatisticModel from './Statistic.js';

const PlayerSchema = new Schema({
    name:{ type: String, required: true },
    slug: {type: String, required: true},
    key: {type: String, required: true},
    team:{ type: String },
    type:{ type: String },
    dob: {type: Date},
    height: {type: String},
    weight: {type: Number},
    bats: {type: String},
    throws: {type: String}, 
    age: {type: Number},
    yearlyStats: {type: Array, ref: 'Statistic'},
    json: { type: Object },
    similarities: {type: Array}
    // _avgStats: {type: Array, ref: 'Statistic'}
    // _contract: { type: Schema.Types.ObjectId, ref: 'Contact' }
});

PlayerSchema.methods.getSimilarPlayers = function(){
    throw new Error('Needs to be defined.') 
};

/**
 * Get a standard hitting stat
 * @param  {Number} year 
 * @param  {String} name name of the string
 * @return {Number}      value of that stat
 */
PlayerSchema.methods.stdHittingStat = function(year, name){
    if(this.stdHitting){
        return this.stdHitting[lookupKey(year, name)];
    }
    else{
        buildStatLookup(this);
        this.stdHittingStat(year, name); 
    }
};

/**
 * Create a hashtable holding keys for faster access to stats 
 * @param  {Player} player 
 * 
 */
function buildStatLookup(player){
    let stdHitting = [];

    for(let statObj of player.yearlyStats){
        if(statObj.group === 'standardBatting'){
             stdHitting[lookupKey(statObj.year, statObj.name)] = statObj.value; 
        }
    }

    player.stdHitting = stdHitting;
}

/**
 * Create the lookup key for the stat table
 * @param  {Number} year 
 * @param  {String} name 
 * @return {String}      key to lookup values
 */
function lookupKey(year, name){
    return `${year}-${name}`;
}


module.exports = mongoose.model('Player', PlayerSchema);
