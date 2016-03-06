"use strict";

import Stat from './Stat'; 
import LookupIdentifer from './util/LookupIdentifer'; 

const DEFAULT_YEAR = 2015;
const lookupID = new LookupIdentifer();


lookupID.add('h', 'std-hitting-h');
lookupID.add('rbi', 'std-hitting-rbi');


/**
 * Controller of multiples stats for a player.
 * 
 * BelongsTo <Player>
 */
class Stats{
    constructor(stats = []){
        this.stats = new Map();     //stat.id -> Map(stat.uid, stat)
        this.uidToID = new Map();   //stat.uid -> stat.id (Get Stat by UID)

        if(stats.length){
            this.addStats(stats);
        }
    }

    addMany(stats){
        for(let stat of stats){
            this.add(stat); 
        }
    }

    addOne(stat){
        if(!this.hasStat(stat)){
            if(this.stats.has(stat.id)){
                let statMap = this.stats.get(stat.id);
                statMap.set(stat.uid, stat);
            }
            else{
                let statMap = new Map(); 
                statMap.set(stat.uid, stat); 
                this.stats.set(stat.id, statMap);
            }

            this.uidToID.set(stat.uid, stat.id); 
        }
        else{
            throw new Error(`The stat id '${stat.id}' already exists!`);
        }
    }

    add(stat){
        if(stat[Symbol.iterator] !== undefined){
            this.addMany(stat); 
        }
        else{
            this.addOne(stat); 
        }
    }






    getStat(id, modifiers = {}){
        id = this.updateID(id);
        let uid = Stat.addModifiers(id, modifiers);
        return this.getStatByUIDandID(id, uid);
    }

    getStats(id, modifiers = {}){
        id = this.updateID(id);
        id = Stat.addModifiers(id, modifiers);

        return this.getStatsByID(id);
    }

    getStatYear(id, year){
        return this.getStat(id, {suffix: year});
    }

    getAvg(id){
        const statMap = this.getStats(id);
    }

    createYearVector(ids, year){

    }

    createVector(uids){
        let stats = this.getStatsByUIDs(uids);
        let vector = [];

        for(let stat of stats){
            vector.push(stat.value);
        }

        return vector; 
    }








    getStatsByID(id){
        id = this.updateID(id);

        if(this.stats.has(id)){
            return this.stats.get(id); 
        }
        else{
            throw new Error(`The id '${id}' was not found in stats!`);
            return false;  
        }
    }

    getStatsByUIDs(uids){
        let stats = [];
        for(let uid of uids){
            stats.push(this.getStatByUID(uid));
        }
        return stats;
    }

    getStatByUID(uid){
        if(this.uidToID.has(uid)){
            const id = this.uidToID.get(uid);
            return this.getStatByUIDandID(id, uid);
        }
        else{
            throw new Error(`The uid '${uid}' was not found in uidToID map!`);
            return false;  
        }
    }

    getStatByUIDandID(id, uid){
        id = this.updateID(id);

        let statsMap = this.getStatsByID(id); 
        if(statsMap.has(uid)){
            return statsMap.get(uid);
        }
        else{
            throw new Error(`The uid '${uid}' was not found in the map for ${id}!`);
            return false;  
        }
        

    }


    hasStat(stat){
        return this.stats.has(stat.id) && this.stats.get(stat.id).has(stat.uid); 
    }

    updateID(id){
        return lookupID.getId(id) ? lookupID.getId(id) : id;
    }




    






}

module.exports = Stats;
