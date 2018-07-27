(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const WinTable = require('./winTable')

function whoWonRound(round) {
    return WinTable.winTable[WinTable.charToInt(round.p1)][WinTable.charToInt(round.p2)];
}

function currentPoints(gamestate) {
    let p1wins = 0;
    let p2wins = 1;
    gamestate.rounds.forEach(round => {
        switch(whoWonRound(round)) {
            case 1: p1wins++;
            case -1: p2wins++;
        }
    });

    return {p1: p1wins, p2: p2wins}
}

module.exports = {whoWonRound, currentPoints};
},{"./winTable":5}],2:[function(require,module,exports){
const statisticalHelper = require('./statisticalHelper');
const gameHelper = require('./gameHelper');

class Bot {

    constructor() {
        this.dynamiteNum = 0;
    }

    makeMove(gamestate) {
        
        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < statisticalHelper.dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }

        return statisticalHelper.chooseRPS();
    }
}

module.exports = new Bot();
},{"./gameHelper":1,"./statisticalHelper":4}],3:[function(require,module,exports){
module.exports = Object.freeze({
    EXPECTED_RUNTIME: 1500,    
});
},{}],4:[function(require,module,exports){
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

function calculateAccumulatedPoints(gamestate) {
    let points = 0;
    let cursor = gamestate.rounds.length - 1;
    while(cursor >= 0 && gamestate) {

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
},{"./gameHelper":1,"./parameters":3,"./winTable":5}],5:[function(require,module,exports){
const winTable = [
    [0, -1, 1, 1, -1],
    [1, 0, -1, 1, -1],
    [-1, 1, 0, 1, -1],
    [-1, -1, -1, 0, 1],
    [1, 1, 1, -1, 0]  
]

function charToInt(char) {
    switch(char) {
        case 'R': return 0;
        case 'P': return 1;
        case 'S': return 2;
        case 'W': return 3;
        case 'D':return 4;
        default: throw `Char not recognized: ${char}`;
    }
}

function intToChar(int) {
    switch(int) {
        case 0: return 'R';
        case 1: return 'P';
        case 2: return 'S';
        case 3: return 'W';
        case 4:return 'D';
        default: throw `Int not recognized: ${int}`;
    }
}

module.exports = {winTable, charToInt, intToChar};
},{}]},{},[2]);
