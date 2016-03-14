"use strict";

import util from 'util'; 
import chalk from 'chalk'; 
import singleLog from 'single-line-log';

let _showHidden = true; 
let _depth = null; 

const inspect = function(obj, showHidden = _showHidden, depth = _depth){
    try{
        return util.inspect(obj, showHidden, depth, true);
    }
    catch(err){
        message('Helper Class Error', 'magenta');
        trace(err);  
    }
};


const message = function(message, color = 'green'){
    message = chalk[color](message);
    console.log(message); 
}



const log = function(){
    for(let arg of arguments){
        console.log(inspect(arg));
    }
};



const trace = function(){
    for(let arg of arguments){
        console.trace(inspect(arg));
    }
};

const error = function(){
    for(let arg of arguments){
        console.error(inspect(arg));
    }
}

const staticLog = function(obj){
    let argArray = [];
    for(let arg of arguments){
        argArray.push(inspect(arg));
    }
    argArray.push('\n');
    singleLog.stdout.apply(null, argArray);
}

const setShallow = function(depth = 2){
    _showHidden = false;
    _depth = 2;
};

const setDeep = function(){
    _showHidden = true;
    _depth = null;
};


module.exports = {
    trace, 
    log, 
    error,
    setShallow,
    options: {
        setShallow, 
        setDeep
    },
    staticLog
};