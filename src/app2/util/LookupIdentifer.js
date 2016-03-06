"use strict";

/**
 * Generic class to create shorthand identifiers to make 
 * it easier to look up full identifies. Main use will be for 
 * stats.  
 * 
 */

class LookupIdentifer{
    constructor (shortIds = [], fullIds = []) {
        this.lookupMap = new Map(); 
        this.addMany(shortIds, fullIds);
    }

    getId(shortId){
        return this.lookupMap.get(shortId); 
    }

    addMany(shortIds, fullIds) {
        if (shortIds.length === fullIds.length){
            for (let i = 0; i < shortIds.length; ++i){
                this.add(shortIds[i], fullIds[i]);
            }
        }
    }

    add(shortId, fullId){
        shortId = shortId.toLowerCase(); 
        fullId = fullId.toLowerCase(); 
        
        if (!this.hasShortId(shortId)){
            this.lookupMap.set(shortId, fullId);
        }
    }

    hasShortId(shortId){

        return this.lookupMap.has(shortId);
    }

    
    static getDefault() {

    }
}


module.exports = LookupIdentifer;

