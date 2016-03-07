"use strict";

import {log, trace, error, setShallow, setDeep} from './../util/loggingHelpers';
import {mongoose, Schema} from './../util/mongoose';

const StatisticSchema = new Schema({
    name:    {type: String, required: true, lowercase: true },
    value:   { type: Schema.Types.Mixed, required: true, lowercase: true },
    group:   { type: String, lowercase: true, required: true  }, 
    year:    { type: Number, required: true},
    _player: { type: Schema.ObjectId, ref: 'Player' }
});

StatisticSchema.index({name: 1, value: 1, group: 1, year: 1, _player: 1}, {unique: true});

module.exports = mongoose.model('Statistic', StatisticSchema);