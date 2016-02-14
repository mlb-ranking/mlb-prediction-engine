"use strict";

import fsp from 'fs-promise'; 

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
|   
*/

/**
 * [writeJSON description]
 * 
 * @param  {[type]} name   full file name
 * @param  {[type]} data   [description]
 * @param  {Object} config [description]
 * @return {[type]}        [description]
 */
function writeJSON(dir, filename, data, config = {ts: false}){
    if(config.ts) filename = getTimeStampFileName(filename);
    return fsp.writeFile(dir + filename + '.json', JSON.stringify(data, null, 2));
}

function getTimeStampFileName(filename){
    let time = new Date().getTime();
    return `${filename}-${time}`;
}


module.exports = {
    writeJSON
}