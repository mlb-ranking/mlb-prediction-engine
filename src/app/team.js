"use strict";

class Team {


	constructor(teamAbrev) {
		this.teamAbrev = teamAbrev;
	}

	get payroll() {
		return contract;
	}

	get payrollFlexibility() {

	}

	get stats() {
		return set;
	}

	get coaches() {
		return coaches;
	}

	get players() {
		return players;
	}

	/**
	 * Suggest which mode the team should currently be in. 
	 * 
	 * @return {Mode} Aggresive, Conserative, Rebuild, Win Now 
	 */
	suggestMode() {

	}
}


/**
 * Rebuilding team types focus on 5 years in the future.
 * 	- Years 1-3
 * 		- Dropping high contract older players. 
 *		- Getting lots of youth by trading top level guys to teams who are now contenders 
 *		- Cheap old vererans under short contracts 
 *  - Years 3-5
 *  	- Transition into aggressive or win now teams 
 *  	- Transition into conseerative team and keep making incremental improvements
 *  - Years 5+
 *  	- Transition into conserative hoping you have not sold too much away if you went aggressive. 
 */
class RebuildingTeam extends Team {
	constructor(teamAbrev, rebuildLevel, rebuildTime) {
		super(teamAbrev);
		this.rebuildLevel = rebuildLevel;
		this.rebuildTime = rebuildTime;
		this.rebuildYear = 0;
	}

	/**
	 * Look at the team payroll, individual contracts, 
	 * future performances, age,
	 * @return {[type]} [description]
	 */
	get determineNeeds() {

	}

	get suggestedDrops() {

	}

	get suggestTrades() {

	}

	get suggestFreeAgents() {

	}


	/**
	 * Predict future using the howRebuilding algorithm 
	 * 
	 * @param  {integer} level Influence how howRebuilding this team is
	 * @return {Stats}                [description]
	 */
	predictFuture() {;

	}
}


class WinNowTeam extends Team {
	constructor(teamAbrev) {
		super(teamAbrev);
	}

	get determineNeeds() {

	}

	get suggestedDrops() {

	}

	get suggestTrades() {

	}
}

class ConserativeTeam extends Team {

	constructor(teamAbrev, conseravtiveLevel) {
		super(teamAbrev);
		this.conseravtiveLevel
	}

	get determineNeeds() {

	}

	get suggestedDrops() {

	}
}


class AggresiveTeam extend Team {
	constructor(teamAbrev, aggresiveLevel) {
		super(teamAbrev);
		this.aggresiveLevel;
	}

	get determineNeeds() {

	}

	get suggestedDrops() {

	}
}