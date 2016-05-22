"use strict";

import {Vectors, Vector} from './../vectors';

class EuclidDistance{
  constructor(v1, v2){
    if(v1.length !== v2.length){
      throw new Error('Must be the same length'); 
    }
    else{
      this.v1 = v1; 
      this.v2 = v2; 
    }
  }

  get distance(){
    return this.computed === undefined ? this.computeDistance() : this.computed; 
  }

  get similarity(){
    return 1.0 / (1.0 + this.distance);
  }

  computeDistance(){
    let innerSum = 0;

    for(let i = 0; i < v1.length; i++){
      innerSum += Math.pow(this.v1.get(i) - this.v2.get(i) ,2);
    }

    this.computed = Math.sqrt(innerSum);
    return this.computed;
  }

}




/**
 * Compute all of the pairs from a list of ids
 * @return {[type]} [description]
 */
function computeAllFromIds(ids){
  
}






/**************************** TESTING ****************************/
let v1 = new Vector([1,2,5]);
let v2 = new Vector([3,3,6]);

let euc = new EuclidDistance(v1, v2);
console.log(euc);
console.log(euc.distance);
console.log(euc.similarity);