"use strict";

import colors from 'colors';
import util from 'util';

let loggers = new Map();
let loggerGroups = new Map(); 
let aliases = new Map();

let logger = {
    overrides: {},
    name: 'debug',      //Make immutable
    aliases: [],
    group: 'general', 
    debugLevel: 1,      
    minDebugLevel: 1,   //Won't fire if debug level is below this
    maxDebugLevel: 100, //Won't fire if debug level is past this
    prefix: '[DEBUG] ',
    color: 'green',
    always: false,

    log: function(){
        console.log.apply(this, arguments)
    }, 
    setProperty: function(name, value){
        this[name] = value; 
    }
};

let loggerGroup = {
    overrides: {},
    name: 'general',           //Make immutable
    aliases: [],
    groupDebugLevel: 1, 
    groupMinDebugLevel: 1,      //Won't fire if debug level is below this
    groupMaxDebugLevel: 100,    //Won't fire if debug level is past this
    groupPrefix: '[DEBUG] ',
    groupColor: 'green',
    groupAlways: false,
    loggers: null
};


function registerDefaults(){
    registerLogger('debug', {minDebugLevel: 1})
    registerLogger('info', {minDebugLevel: 2})
    registerLogger('all', {minDebugLevel: 3})
    registerLogger('always', {minDebugLevel: -1, always: true})
}


function registerLogger(name, options = {}){
    let newLogger = Object.create(logger);
    Object.assign(newLogger, {name: name}, options);
    loggers.set(newLogger.name, newLogger);
    addToLoggerGroup(newLogger);
    return newLogger;
}

function createLoggerAliases(logger){
    
}


function registerLoggerGroup(name, options = {}){
    let newLoggerGroup = Object.create(loggerGroup);
    Object.assign(newLoggerGroup, {name: name, loggers: new Map()}, options);
    loggerGroups.set(newLoggerGroup.name, newLoggerGroup);
    return newLoggerGroup;
}

function createLoggerGroupAliases(loggerGroup){
    
}

function addToLoggerGroup(logger){
    if(!loggerGroups.has(logger.group)){
        let newLoggerGroup = registerLoggerGroup(logger.group);
        newLoggerGroup.loggers.set(logger.name, logger);
    }
    else{
        loggerGroups.get(logger.group).loggers.set(logger.name, logger)
    }
}



///HELPERS
function log(message){
    message = util.inspect(message, {
        showHidden: true, 
        depth: null, 
        colors: true
    });

    console.log(message); 
}




//Check out
//https://github.com/mohsen1/better-console/blob/master/index.js

registerDefaults();
let filesystemLogger = registerLogger('filesystem', {prefix: '[FILESYSTEM] ', group: 'filesystem'});
let downloaderLogger = registerLogger('downloader', {prefix: '[DOWNLOADER] ', group: 'app'});

module.exports = {
    registerLogger: registerLogger,
}