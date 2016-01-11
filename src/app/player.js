"use strict";

class Player {


	constructor(name, team, position, height, weight, age) {
		this.name = name;
		this.team = team;
		this.position = position;
		this.height = height;
		this.weight = weight;
		this.age = age;
	}

	get contract(){
		return contract; 
	}

	get stats(){
		return set; 
	}

	/**
	 * Use players current stats to determine his value with 
	 * out considerin his teammates. Useful for determing value when 
	 * suggestion trades.  
	 * @return {Array of sets} Array of each year containing all stats 
	 */
	get futureStats(){
		
	}

	/**
	 * Use players current stats to determine his value with 
	 * but considering his team. Useful to rank teams. 
	 * 
	 * @return {Array of sets} Array of each year containing all stats 
	 */
	get futureStatsWithTeam(){
		
	}

	/**
	 * Verify if the player is the same as this current
	 * player. 
	 * @param  {String} potentialID [description]
	 * @return {Boolean}             [description]
	 */
	verifyPlayer(potentialID){
		
	} 
}

