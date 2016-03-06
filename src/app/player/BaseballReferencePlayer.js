"use strict";

import Player from './Player.js'

function BaseballReferencePlayer(json){
    Player.call(this, json);
}

//Inheritance from base player
BaseballReferencePlayer.prototype = Object.create(Player.prototype);  
BaseballReferencePlayer.prototype.parent = Player.prototype;  


module.exports = BaseballReferencePlayer;
