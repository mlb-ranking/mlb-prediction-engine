"use strict";

import {log, trace, error} from './../util/loggingHelpers';
import {mongoose, Schema} from './../util/mongoose';


const StatisticSchema = new Schema({
    type:    {type: String, required: true, lowercase: true }, //e.g. yearly, avg, predicted
    name:    {type: String, required: true, lowercase: true },
    value:   { type: Schema.Types.Mixed, required: true, lowercase: true },
    group:   { type: String, lowercase: true  }, 
    year:    { type: Number},
    _player: { type: Schema.ObjectId, ref: 'Player' }
});


module.exports = mongoose.model('Statistic', StatisticSchema);