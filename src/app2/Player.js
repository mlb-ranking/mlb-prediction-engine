"use strict";

import {log, trace, error, setShallow, setDeep} from './util/helpers';
import fsp from 'fs-promise'; 
import md5 from 'md5'; 
import util from 'util'; 
import Stats from './Stats'; 
import Similarity from './Similarity'; 

const aggregateStats = new Stats(); 


/**
 *  Main class to manage a player
 *  
 *  HasOne <Stats> 
 *  HasMany <Similarity>
 *  HasOne <Download>
 */
class Player {

    constructor(playerJSON){
        this.id = null;
        this.data = playerJSON;
        this.stats = new Stats();
        this.similarity = new Similarity(); 

        if(this.data.jsonData === 'optimized'){
            Object.assign(this, playerJSON);
        }
        else{
            this.filename = this.data.jsonLocation;
            this.initProperties(); 
        }
    }

    initProperties(){
        this.name = this.data.bio.name;
        this.team = this.data.bio.team;
        this.type = this.data.bio.position;
        this.url = (this.data.download) ? this.data.download.url : this.data.source.url;
        this.id = this.uid;
    }

    getStat(id, year = 2015){

    }

    updateJSONFile(){
        return fsp.writeFile(this.filename, this.toJSON())
            .then(log)
            .catch(trace);
    }
   
    get uid(){
        let uid = `${this.team}-${this.name}-${md5(this.url)}`;
        return uid.toLowerCase().replace(' ', '-');
    }

}


module.exports = Player;