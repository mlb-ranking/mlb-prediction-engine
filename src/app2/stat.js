import mongoose from 'mongoose';
import {log, error2} from './util/helpers';

const url = 'mongodb://localhost:27017/mlb';
mongoose.Promise = Promise;

mongoose.connect(url, (err) => {if(err) error2(err)});

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    name:{ type: String, required: true }
});
const StatSchema = new Schema(
    {
        name: {type: String, required: true},
        value:{ type: Number, required: true },
        group:{ type: String },
        season:{ type: String, default: 'regular' }, 
        year:{ type: Number},
        playerKey: {type: String},
        _player: { type: Schema.ObjectId, ref: 'Player' }
    }
)

const StatModel = mongoose.model('Statistic', StatSchema);
const PlayerModel = mongoose.model('Player', PlayerSchema);






let player = new PlayerModel(); 
player.name = 'Josh Rogan';
player.save()
    .then()
    .catch(error);

let stat = new StatModel(); 
stat.name = 'h'; 
stat.value = 99; 
stat.group = 'std-batting';
stat.year = 2015; 
stat._player = player; 
stat.save()
    .then()
    .catch(err => error2(err));


// StatModel.findOne({value: 99})
//     .populate('_player')
//         .then(doc=> {
//             log(doc);
//         })
//         .catch(error2);



class Stat{
    constructor(id, value){ 
        this.value = value;
        this.id = id;
    }

    get description(){
        return `Look up the description for '${id}' in the DB.`; 
    }

    get name(){
        return `Look up the name for '${id}' in the DB.`; 
    }

}

class YearStat extends Stat{
    constructor(id, value, properties = {}){ 
        super(id, value);
        
        this.playerID = properties.playerID || null; 
        this.group = properties.group || null; 
        this.year = properties.year || null; 
        this.season = properties.season || null; 
    }
}