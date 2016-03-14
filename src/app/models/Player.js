"use strict";

import {log, trace, error} from './../util/loggingHelpers';
import {mongoose, Schema} from './../util/mongoose';
import StatisticModel from './Statistic.js';

const PlayerSchema = new Schema({
    name:{ type: String, required: true },
    key: {type: String, required: true},
    team:{ type: String },
    type:{ type: String },
    dob: {type: Date},
    height: {type: String},
    weight: {type: Number},
    bats: {type: String},
    throws: {type: String}, 
    age: {type: Number},
    _yearlyStats: {type: Array, ref: 'Statistic'},
    _contact: { type: Schema.Types.ObjectId, ref: 'Contact' }
    // _json: { type: Schema.Types.ObjectId, ref: 'JSON' },
    // _yearStats: {type: Array, ref: 'Statistic'}
    // _avgStats: {type: Array, ref: 'Statistic'}
    // _similaritie: {type: Array, ref: 'Statistic'}
});

PlayerSchema.methods.getSimilarPlayers = function(){
    throw new Error('Needs to be defined.') 
};

module.exports = mongoose.model('Player', PlayerSchema);