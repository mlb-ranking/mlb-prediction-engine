import PlayerFactory from './app/player/PlayerFactory.js';

// Constants 
const JSON_DIR =  'data/baseballref/json/';

//Application Information
let playerFactory = new PlayerFactory(JSON_DIR); 
let playersMap = playerFactory.playersMap;


function init(){
    return playerFactory.createPlayers()
        .then(() => {
        
        });
}


function computeSimiliarities(){
    let pitchers = playerFactory.getPitchers(); 
    let batters = playerFactory.getPositionPlayers(); 

    console.log(playersMap.size, pitchers.size, batters.size);
    // let iter = playersMap.values();
    // let player = iter.next().value;
    // console.log(player);
    // player.updateJSONFile();
    

    // console.log(playersMap.size);
    // console.log(playerFactory.tempPlayersSet.size);
}


function getSimilarPlayers(playerID){

}





const name = 'john';

for (let i = 0; i < name.length; ++i) {
    console.log(i, name[i]);
}

for (let i = 0; i < name.length; i++) {
    console.log(i, name[i]);
}

