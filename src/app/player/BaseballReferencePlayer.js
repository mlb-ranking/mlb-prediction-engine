"use strict";
import Player from './Player.js'

//Inheritance from base player
BaseballReferencePlayer.prototype = new Player();  
BaseballReferencePlayer.prototype.constructor = BaseballReferencePlayer;  
BaseballReferencePlayer.prototype.parent = Player.prototype;  

function BaseballReferencePlayer(json){
    BaseballReferencePlayer.prototype.parent.constructor.call(this, json);
}


module.exports = BaseballReferencePlayer;
