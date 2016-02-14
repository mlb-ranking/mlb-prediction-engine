"use strict";

import distances from './distances.js';
import Vectors from '../../util/Vectors.js';

function Similarity(vectors, options = {}){
    if(vectors instanceof Vectors){
        this.vectors = vectors;
    }
    else{
        throw new Error('Must be a Vectors instance'); 
    }

    //Specifing what algoirhtm to use
    if(options.algorithm){
        switch(options.algorithm){
            case "simple":
                this.similarityFunction = this.simpleSimilarity;
                break;
        }
    }

    if(options.qualifiers) this.qualifiers = options.qualifiers;

}

/*
|--------------------------------------------------------------------------
| Algorithms
|--------------------------------------------------------------------------
|
*/
Similarity.prototype.distances = distances;

Similarity.prototype.simpleSimilarity = function(vectorPair){
    let distance = distances.computeEuclidNDim(vectorPair[0], vectorPair[1]);
    return 1 / (1 + distance); 
}

Similarity.prototype.otherSimilarity = function(vectorPair){

}

/*
|--------------------------------------------------------------------------
| Default Properties
|--------------------------------------------------------------------------
|
*/
Similarity.prototype.options = {};              //Config
Similarity.prototype.qualifiers = {};          
Similarity.prototype.results = {scores: []};    
 
Similarity.prototype.similarityFunction = Similarity.prototype.simpleSimilarity;   


/*
|--------------------------------------------------------------------------
| Methods to be defined
|--------------------------------------------------------------------------
|
*/
Similarity.prototype.run = function(){
    this.filtering();

    let pairs = this.vectors.getPairs(); 
    for(let pair of pairs){
        this.results.scores.push(this.similarityFunction(pair)); 
    }
    this.results = this.results; 
}      

//Add the index to the qualifiers object for performance
Similarity.prototype.updateQualifiers = function(){
    for(let qualifier of this.qualifiers){
        qualifier.index = this.vectors.getHeadingIndex(qualifier.stat);
    }
    console.log(this.qualifiers); 
}

Similarity.prototype.filtering = function(){
    this.updateQualifiers(); 

    this.vectors.filter((vector) => {
        for(let qualifier of this.qualifiers){
            let checking = vector[qualifier.index];
            switch(qualifier.compare){
                case ">":
                    if(qualifier.value > checking) return false; 
                    break;
                case "<":
                    if(qualifier.value < checking) return false; 
                    break;
                case "=":
                    if(!(qualifier.value === checking)) return false; 
                    break;
            }
        }
        return true; 
    });
}





/*
|--------------------------------------------------------------------------
| Tests & Debug
|--------------------------------------------------------------------------
|
*/
let vectors = new Vectors(['pa', 'h', 'r'], [[50, 10, 3], [30, 14, 2], [40, 13, 2], [42, 13, 2]]);
let similarity = new Similarity(vectors, {qualifiers: [{stat: 'pa', compare: '>', value: 35}]});
similarity.run();

console.log(similarity);