"use strict";

import {Vectors, Vector} from './../vectors';


class EuclidDistance extends Vectors{
  constructor(vector1, vector2){
    super(vector1); 
    this.add(vector1); 
    this.add(vector2); 
  }

}

let v1 = new Vector([1,2]);
let v2 = new Vector([1,3]);

let euc = new EuclidDistance(v1, v2);
console.log(euc);