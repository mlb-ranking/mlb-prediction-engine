"use strict";

class Player {
	// const current = 2015; //The last year where there a good stats 

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

	/**
	 * Return the value of a specific stat
	 * @param  {String} name The name of the statistic to look up for this player.
	 * @return {[type]}      [description]
	 */
	get stat(){

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
	 * Find players that have a similar makeup with lots of statistical 
	 * history. 
	 * RECALL BIG DATA CLASS!!!!
	 * @return {Set of Players}
	 */
	get similiarPlayers(){
		//Consider age, weight, height, position. 
		//Add similiarity property
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

