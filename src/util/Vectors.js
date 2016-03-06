"use strict";


function Vectors(headings = [], vectors = []){
    this.addHeadings(headings); 

    for(let vector of vectors){
       this.addVector(vector); 
    }

}

/*
|--------------------------------------------------------------------------
| Default Properties
|--------------------------------------------------------------------------
|
*/
Vectors.prototype.headings = [];           
Vectors.prototype.vectors = [];           
Vectors.prototype.vectorPairs = [];         


/*
|--------------------------------------------------------------------------
| API 
|--------------------------------------------------------------------------
|
*/
Vectors.prototype.addHeadings = function(headings){
    this.headings = headings;  
}

Vectors.prototype.getHeadingIndex = function(heading){
    return this.headings.indexOf(heading);
}

Vectors.prototype.addVector = function(vector){
    if(this.validVector(vector)){
        this.vectors.push(vector);
        return true; 
    }
    else{
        return false; 
    }
}

Vectors.prototype.getPairs = function(){
    let pairs = [];
    for(let i=0; i < this.vectors.length; i++){
        let pair1 = this.vectors[i];

        for(let j=i+1; j < this.vectors.length; j++){
            let pair2 = this.vectors[j];
            pairs.push([pair1, pair2]);
        }
    }
    this.vectorPairs = pairs; 
    return pairs; 
}


Vectors.prototype.filter = function(filter){
    this.vectors = this.vectors.filter((vector) => {
        return filter(vector); 
    })
}



/*
|--------------------------------------------------------------------------
| Methods 
|--------------------------------------------------------------------------
|
*/

//Headings must be set
Vectors.prototype.validVector = function(vector){
    if(vector.length !== this.headings.length){
        return false; 
    }

    return true; 
}


Vectors.prototype.isValid = function(){
    if(this.headings.length <= 0) return false; 
    else if(this.vectors.length){
        //All must be the same size 
    }
}


module.exports = Vectors;