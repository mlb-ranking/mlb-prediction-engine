const DEFAULT_DEBUG = 0; 


/**
 * Print out meaningful debugging messages 
 * 
 * @param  {Number} debugLevel [description]
 * @return {[type]}            [description]
 */
function debugMessage(debugLevel = DEFAULT_DEBUG){
    //Logging with color examples
    console.log('\x1b[36mHello from the log'); 
    console.log('\x1b[36m', 'sometext' ,'\x1b[0m');
}