// Base object for all stats
"use strict";

class Stat {

	constructor(name, influence, value) {
		this.influence = influence;
		this.name = name; 
		this.value = value; 
	}

	/**
	 * Return a percentage (0-1) of how common this stat is in the data set. 
	 * i.e how many players have this stat for every year. 
	 * @return {Float} 0-1 
	 */
	get frequency(){

	}

	

}