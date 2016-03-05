import PlayerFactory from './app/player/PlayerFactory.js';

// Constants 
const JSON_DIR =  'data/baseballref/json/';

//Application Information
let playerFactory = new PlayerFactory(JSON_DIR); 
let playersMap = playerFactory.players;

function init(){
    return playerFactory.createPlayers()
        .then(() => {
            
        });
}

function computeSimiliarities(){
    
}

function getSimilarPlayers(playerID){

}







init()
    .then(computeSimiliarities)