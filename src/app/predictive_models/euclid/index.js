// import { getPlayer, getPlayersStreaming } from './../index';
import { Vector } from './../vectors';
import { EuclidPair } from './../datastructures/EuclidPair';


export class Euclid {

  constructor(vectors) {
    this.vectors = vectors;
  }

  add(vector) {
    this.vectors.push(vector);
  }


}


