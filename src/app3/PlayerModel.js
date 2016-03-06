import {log, trace, error, setShallow, setDeep} from './../app2/util/helpers';
import mongoose from 'mongoose';
mongoose.Promise = Promise;

const url = 'mongodb://localhost:27017/mlb';
const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    name:{ type: String, required: true },
    key: {type: String, required: true, index: {unique: true}},
    team:{ type: String },
    type:{ type: String },
    dob: {type: Date},
    height: {type: String},
    weight: {type: Number},
    bats: {type: String},
    throws: {type: String}, 
    age: {type: Number},
    _contact: { type: Schema.ObjectId, ref: 'Contact' },
    _json: { type: Schema.ObjectId, ref: 'JSON' },
    _stats: {type: Array, ref: 'Statistic'}
});

PlayerSchema.methods.getSimilarPlayers = function(){
    return 'Bob'; 
};

const PlayerModel = mongoose.model('Player', PlayerSchema);

module.exports = PlayerModel;