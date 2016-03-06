require('source-map-support').install();

import Player from './Player';
import LookupIdentifer from './util/LookupIdentifer';
import PlayerFactory from './PlayerFactory';
import Stats from './Stats';
import {BaseStat, Stat} from './Stat';
import util from 'util'; 
import {log, trace, error, setShallow, setDeep} from './util/helpers';
import mongoose from 'mongoose';
























const url = 'mongodb://localhost:27017/mlb';
mongoose.Promise = Promise;

// mongoose.connect(url, trace);

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

const JSONSchema = new Schema({
    json: {type: String, required: true}
});

const StatSchema = new Schema({
    name:    {type: String, required: true, lowercase: true },
    value:   { type: Schema.Types.Mixed, required: true, lowercase: true },
    group:   { type: String, lowercase: true, required: true  }, 
    year:    { type: Number, required: true},
    _player: { type: Schema.ObjectId, ref: 'Player' }
});

StatSchema.index({name: 1, value: 1, group: 1, year: 1, _player: 1}, {unique: true})

const StatModel = mongoose.model('StatModel', StatSchema);
const PlayerModel = mongoose.model('Player', PlayerSchema);
const JSONModel = mongoose.model('JSON', JSONSchema);

//Everything that needs to be writted to DB
let playerModels = [];
let jsonModels = [];
let statModels = [];

function createBackupJSON(playerObj){
    let json = new JSONModel({json: JSON.stringify(playerObj)});
    jsonModels.push(json); 
    return json; 
}

function createPlayer(playerObj, jsonID){
    let player = new PlayerModel({
        key: playerObj.id,
        name: playerObj.name,
        team: playerObj.team, 
        type: playerObj.type,
        dob: playerObj.data.bio.birth,
        height: playerObj.data.bio.height,
        weight: playerObj.data.bio.weight,
        bats: playerObj.data.bio.bats,
        throws: playerObj.data.bio.throws,
        age: playerObj.data.bio.age,
        _json: json.id 
    }); 

    playerModels.push(player); 
    log('creation', player);
    return player; 
}

function createStat(name, value, group, year, playerID){
    let stat = new StatModel({
        name: name, 
        value: value, 
        group: group, 
        year: year,
        _player: playerID, 
    });

    statModels.push(stat); 
    return stat; 
}

function getPlayerDB(playerData){
    return  PlayerModel.find({ key: playerData.id}, '_id')
        .exec()
        .then((doc, err) => {
            if(doc.length > 0){
                log('MOTHERFUCKER', doc[0]);
                return doc[0]._id;
            }
            else{
                 return createPlayer(playerData).id;
            }
        })
        .catch(trace);
}

function createStats(playerData, mongoPlayerID){
    let promises = [];
    let stats = [];

    // log(playerData.data.stats);
    let statsObj = playerData.data.stats;
    for(let group in statsObj){
        for(let statList of statsObj[group]){
            let year = statList['Year'];
            for(let statId in statList){
                let stat = createStat(statId, statList[statId], group, year, mongoPlayerID);
                stats.push(stat); 
            }
        }
    }

    return stats;
}



function addToMongo(){
    let factory = new PlayerFactory('data/baseballref/json/');
    let promises = [];

    factory.createPlayers()
        .then(()=>{
            let pplayers = factory.getPositionPlayers();
            // let player = pplayers.get('tex-josh-hamilton-5dc5d62df9e4fca0f29a9e9ae05a4f52');
            for(let player of pplayers.values()){
                let promise = 
                    getPlayerDB(player)
                        .then(PlayerID => {
                            log(PlayerID);``
                            createStats(player, playerID);
                        })
                        .catch(trace);

                promises.push(promise); 
            }
        })
        .then(()=> log('when does this happen'))
        .catch(trace);

        Promise.all(promises).then(()=>log('We gucci')); 
}




// addToMongo(); 

// PlayerModel.findOne({key: 'durham-boog-powell-c7078f0fc52baf1429994751129efce3'})
//     // .populate('_json')
//         .then(doc=> {
//             log(doc);
//         })
//         .catch(trace);







// let factory = new PlayerFactory('data/baseballref/json/');
// factory.createPlayers()
//     .then(()=>{
//         console.log(factory.getPitchers().size);
//         console.log(factory.getPositionPlayers().size);
//     })

// const stats = new Stats();

// let statArray = [];

// statArray.push(new Stat('full-id', 100));
// statArray.push(new Stat('full-id-2', 50)); 

// statArray.push(new Stat('std-hitting-h', 22));
// statArray.push(new Stat('std-hitting-h', 102, {suffix: '2013'}));
// statArray.push(new Stat('std-hitting-h', 5,  {suffix: '2014'}));
// statArray.push(new Stat('std-hitting-h', 50, {suffix: '2015'}));

// statArray.push(new Stat('std-hitting-rbi', 22));
// statArray.push(new Stat('std-hitting-rbi', 102, {suffix: '2013'}));
// statArray.push(new Stat('std-hitting-rbi', 5,  {suffix: '2014'}));
// statArray.push(new Stat('std-hitting-rbi', 50, {suffix: '2015'}));

// statArray.push(new Stat('std-hitting-h', 4, {prefix: 'post'}));
// statArray.push(new Stat('std-hitting-h', 2, {prefix: 'post', suffix: '2013'}));
// statArray.push(new Stat('std-hitting-h', 9, {prefix: 'post', suffix: '2014'}));
// statArray.push(new Stat('std-hitting-h', 3, {prefix: 'post', suffix: '2015'}));

// stats.add(statArray); 



// console.log(util.inspect(stats.getStats('rbi'), true, null, true));
// console.log(util.inspect(stats.createVector(['full-id', 'full-id-2']), true, null, true));
// console.log(util.inspect(stats.createVector(['full-id', 'full-id-2']), true, null, true));
// console.log(util.inspect(stats.getStatYear('h', 2013), true, null, true));
// console.log(util.inspect(stats.getStat('full-id'), true, null, true));






// console.log(stats.getStatYear('h', 2014));

// console.log(stats.getStats('h', {prefix: 'post'}));


// console.log(util.inspect(PlayerFactory, true, null, true));
// 