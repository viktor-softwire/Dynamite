const Parameters = require('./parameters');
const gameHelper = require('./gameHelper');
const WinTable = require('./winTable');


// Trying to estimate remaining #rounds
function expectedRemainingTurn(gamestate) {
    if (gamestate.rounds.length < 30) return Parameters.EXPECTED_RUNTIME;
    const wins = gameHelper.currentPoints(gamestate);
    const maxWin = Math.max(wins.p1, wins.p2);
    const maxWinRate = maxWin / gamestate.rounds.length;
    const expectedCalculatedEnd = Math.min((1000 - maxWin) / maxWinRate, 2500 - gamestate.rounds.length);
    if (gamestate.rounds.length < 200) {
        const weight = (gamestate.rounds.length - 30) / 170;
        return expectedCalculatedEnd*weight + (1-weight)*Parameters.EXPECTED_RUNTIME;
    }
}


// A naive implementation of randomized dynamite
function dynamiteChance(gamestate, dynamiteCounter) {
    return Math.min((100 - dynamiteCounter) / expectedRemainingTurn(gamestate));
}


//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Choose randomly between RPS
function chooseRPS() {
	return WinTable.intToChar(getRandomInt(0, 3));
}

module.exports = {expectedRemainingTurn, dynamiteChance, getRandomInt, chooseRPS};