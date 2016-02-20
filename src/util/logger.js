"use strict";

import colors from 'colors';
import util from 'util';

colors.setTheme({
    normal: 'white',
    debug: 'green',
    more: 'blue',
    all: 'magenta',
    warning: ['red', 'underline'],
    error: 'red'
});


//Inital debug level to control what gets output
let level = 3; 

//Default options
let options = {
    prefix: '[DEBUG] ',
    color: 'green',
    always: false,
    colorAll: false
};

//Often used presets
let presets = new Map(); 


//Register some presets 
presets.set('debug', {}); //Basepreset no changes
presets.set('info', {prefix: '[INFO] ', color: 'blue'}); 
presets.set('all', {prefix: '[ALL] ', color: 'magenta'}); 
presets.set('error', {prefix: '[ERROR] ', color: 'red'}); 


function cout(minLevel, message, config = {}){
    let preset = (config.preset && presets.get(config.preset)) ? presets.get(config.preset) : {};
    let currentConfig = Object.assign({}, options, preset, config);
    
    if(options.always || level >= minLevel){
        console.log(formatMessage(message, currentConfig));
    }

}

function registerPreset(name, presetOptions){
    presets.set(name, presetOptions);
}

function setLevel(newLevel, config){
    level = newLevel;
}

//Helpers
function formatMessage(message, config){
    let output = ''; 

    if(config.prefix){
        output += colorize(config.prefix, config);
    }

    if(config.colorAll === true){
        output += colorize(message, config);
    }
    else{
        output += message; 
    }

    return output;
}

function colorize(string, config){
    // if(config.color)
    if(colors[config.color]){
        return colors[config.color](string);
    }
    else{
        return colors.green(string); //Default
    }
}


//Check out
//https://github.com/mohsen1/better-console/blob/master/index.js

module.exports = {
    cout: cout,
    setLevel: setLevel, 
    registerPreset: registerPreset
}