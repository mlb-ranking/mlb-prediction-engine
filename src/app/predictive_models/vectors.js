"use strict";



/**
 * Vector container
 *
 * 
 */
export class Vectors{

  constructor(names){
    this.vectors = [];
    this.length = names.length; 
  }

  add(vector){
    if(this.validVector(vector)){
      this.vectors.push(vector);
    }
  }

  validVector(vector){
    if(vector instanceof Vector){
      if(vector.length !== this.length){
        console.log('Each vector must be the same size!'); 
        return false; 
      }
      else{
        return true; 
      }
    }
    else{
      console.log('Not a vector!'); 
      return false; 
    }
  }

}



/**
 * Container 
 */
export class Vector{
  constructor(array){
    this.value = array; 
  }

  get length(){
    return this.value.length; 
  }

  get distance(){
    //Placeholder this computation should be done here to save time
  }

  get(index){
    return Number(this.value[index]);
  }
}
