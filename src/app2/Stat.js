"use strict";

class BaseStat{
    constructor(id, value, modifiers = {}){ 
        this.value = value;
        this.id = id;
        this.uid = Stat.addModifiers(this.id, modifiers); 
    }

    get description(){
        return Stat.getDescription(this.id, this.uid); 
    }

    get name(){
        return Stat.getName(this.id, this.uid); 
    }

    static getDescription(id, uid = false){
        return `Look up the description for '${id}' in the DB.`; 
    }

    static getName(id, uid = false){
        return `Look up the name for '${id}' in the DB.`; 
    }

    static addModifiers(id, modifiers){
        let uid = id;

        if(modifiers.suffix){
            const suffix = modifiers.suffix.toString();
            uid = suffix.length ? `${uid}-${suffix}` : uid; 
        }

        if(modifiers.prefix){
            const prefix = modifiers.prefix.toString();
            uid = prefix.length ? `${prefix}-${uid}` : uid; 
        }
        return uid; 
    }
}


class Stat extends BaseStat{
    constructor(id, value, year, group, season){
        super(id, value); 
    }
}




class AvgStat extends Stat{
    constructor(id, value, year = null){
        super(id, value, year);
        this._type  = 'AvgStat';  
    }
}

class PredictedStat extends Stat{
    constructor(id, value, year = null){
        super(id, value, year);
        this._type  = 'PredictedStat';  
    }
}


module.exports = {
    Stat,
    BaseStat
}