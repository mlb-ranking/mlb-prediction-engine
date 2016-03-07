"use strict";

import {log, trace, error, setShallow, setDeep} from './../util/loggingHelpers';
import {mongoose, Schema} from './../util/mongoose';

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
    _contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    _json: { type: Schema.Types.ObjectId, ref: 'JSON' },
    _stats: {type: Array, ref: 'Statistic'}
});

PlayerSchema.methods.getSimilarPlayers = function(){
    throw new Error('Needs to be defined.') 
};

module.exports = mongoose.model('Player', PlayerSchema);