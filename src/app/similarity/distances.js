"use strict";

/*
|--------------------------------------------------------------------------
| Methods
|--------------------------------------------------------------------------
|   -computeEuclidNDim() - Compute the euclid distance of the n-dimensional vectors.
|
*/

/**
 * Compute the euclid distance of the n-dimensional vectors. 
 *     Result = straight line Tip to tail
 *     Example Vector: [144, 37, 0, 77] (hits, homeruns, stolen bases, walks)
 * 
 * IMPORTANT: Find other distance algorithms. Doesn't work well on lots of dimensions
 * 
 * @param  {Vector} vector1 n dimensional vector  
 * @param  {Vector} vector2 n dimensional vector  
 * @return {[type]}         [description]
 */
function computeEuclidNDim(vector1, vector2){
    if(vector1.length !== vector2.length) throw new Error(`[COMPUTE EUCLID] Vectors not equal length`);
    let inner = 0;

    //Inner = the sum of the difference between each dimension squared
    for(let i = 0; i < vector1.length; i++){
        inner += Math.pow(vector1[i] - vector2[i], 2);
    }

    let result = Math.sqrt(inner)
    // console.log(`[DEBUG] Distance between ${vector1} and ${vector2} is ${result}`);
    return result; 
}


module.exports = {
    computeEuclidNDim
}