const WinTable = require('./winTable');
const statisticalHelper = require('./statisticalHelper');

class PrevDatabase {

    constructor() {
        // Create a large 7-deep list (last 3 moves for everyone)
        // vStored as: this.previous[p2][p1][p2][p1][p2][p1][p2] where the last p2 is the unkown 
        this.database = this.addLevel(0, 7);
        console.log()
        
    }

    addLevel(depth, limit = 7) {
        if (depth === limit) {
            return 0;   // We start with 0
        }
        const thisLevel = [];
        for (let i = 0; i < 5; i++) {
            thisLevel.push(this.addLevel(depth + 1, limit));
        }
        return thisLevel;
    }

    newData(gamstate) {
        if (gamstate.rounds.length < 4) return;
        const lastFour = gamstate.rounds.slice(-4);
        this.integerize(lastFour);
        this.database[lastFour[0].p2][lastFour[0].p1][lastFour[1].p2][lastFour[1].p1][lastFour[2].p2][lastFour[2].p1][lastFour[3].p2]++;
    }

    getBestMove(gamestate) {

        if (gamestate.rounds.length < 3) return statisticalHelper.chooseRPS();

        const lastThree = gamestate.rounds.slice(-3);
        this.integerize(lastThree);
        const possibilities = this.database[lastThree[0].p2][lastThree[0].p1][lastThree[1].p2][lastThree[1].p1][lastThree[2].p2][lastThree[2].p1];
        return this.findBestMove(possibilities);
    } 

    findBestMove(possibilities) {
        const maxValue = Math.max(...possibilities);
        const maxRPSValue = Math.max(...possibilities.slice(0, 3));
        const maxRPS = [];
        const maxArray = [];

        // Also keep track of max RPS
        for (let i = 0; i < possibilities.length; i++) {
            if (possibilities[i] === maxValue) maxArray.push(WinTable.intToChar(i));
            if (possibilities[i] === maxRPSValue && i < 3) maxRPS.push(WinTable.intToChar(i));
        }


        // Currently only optimise for RPS
        const chosenOneIndex = statisticalHelper.getRandomInt(0, maxRPS.length)
        const expectedNextMove = maxRPS[chosenOneIndex];
        return this.antiMove(expectedNextMove);
    }

    integerize(lastString) {
        lastString.forEach(round => {
            round.p1 = WinTable.charToInt(round.p1);
            round.p2 = WinTable.charToInt(round.p2);
        });
    }

    // ONLY WORKS FOR RPS
    antiMove(expectedNextMove) {
        switch(expectedNextMove) {
            case('R'): return 'P';
            case('P'): return 'S';
            case('S'): return 'R';
        }
    }
}

module.exports = {PrevDatabase}