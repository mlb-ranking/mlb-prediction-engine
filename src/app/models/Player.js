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
    // _contact: { type: Schema.Types.ObjectId, ref: 'Contact' }
    json: { type: Object },
    // _yearStats: {type: Array, ref: 'Statistic'}
    // _avgStats: {type: Array, ref: 'Statistic'}
    similarities: {type: Array}
});

PlayerSchema.methods.getSimilarPlayers = function(){
    throw new Error('Needs to be defined.') 
};

// Alternate option add the logic for parsing here 
// class Player{

// }

// module.exports = Player;
module.exports = mongoose.model('Player', PlayerSchema);
