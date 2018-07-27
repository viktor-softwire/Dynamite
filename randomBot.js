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

        if (gamestate.rounds.length < 3) return chooseRPS();

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
            if (possibilities[i] === maxValue) maxArray.push(intToChar(i));
            if (possibilities[i] === maxRPSValue && i < 3) maxRPS.push(intToChar(i));
        }


        // Currently only optimise for RPS
        const chosenOneIndex = getRandomInt(0, maxRPS.length)
        const expectedNextMove = maxRPS[chosenOneIndex];
        return this.antiMove(expectedNextMove);
    }

    integerize(lastString) {
        lastString.forEach(round => {
            round.p1 = charToInt(round.p1);
            round.p2 = charToInt(round.p2);
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


class Bot {

    constructor() {
        this.dynamiteNum = 0;
        this.database = new PrevDatabase();
    }

    makeMove(gamestate) {
        
        // Update database
        // this.database.newData(gamestate);
        // const nextBestMove = this.database.getBestMove(gamestate);
        
        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }
        
        return chooseRPS();

        
        // if (Math.random() > 0.8 && gamestate.rounds.length > 200) {
        //     return this.database.antiMove(getMostUsedInRange(gamestate));
        // }
        
        // if (Math.random() > 0.7) {
        //     return chooseRPS();
        // }



        // return nextBestMove;
    }
}

module.exports = new Bot();


// Trying to estimate remaining #rounds
function expectedRemainingTurn(gamestate) {
    if (gamestate.rounds.length < 30) return Parameters.EXPECTED_RUNTIME;
    const wins = currentPoints(gamestate);
    const maxWin = Math.max(wins.p1, wins.p2);
    const maxWinRate = maxWin / gamestate.rounds.length;
    const expectedCalculatedEnd = Math.min((1000 - maxWin) / maxWinRate, 2500 - gamestate.rounds.length);
    if (gamestate.rounds.length < 200) {
        const weight = (gamestate.rounds.length - 30) / 170;
        return expectedCalculatedEnd*weight + (1-weight)*Parameters.EXPECTED_RUNTIME;
    }
}

// Not include D and W
function getMostUsedInRange(gamestate, range = 200) {
    if (gamestate.length < range) return null;

    const neededRounds = gamestate.rounds.slice(-range);
    const counter = [0, 0, 0, 0, 0];
    neededRounds.forEach(round => {
        counter[charToInt(round.p2)]++;
    });

    const maxValue = Math.max(...counter.slice(0, 3));
    const maximumItems = [];
    for (let i = 0; i < 3; i++) {
        if (maxValue === counter[i]) maximumItems.push(i);
    }

    const chosenOne = getRandomInt(0, maximumItems.length);
    return intToChar(maximumItems[chosenOne]);

}

// A naive implementation of randomized dynamite
function dynamiteChance(gamestate, dynamiteCounter) {
    return Math.max((100 - dynamiteCounter) / expectedRemainingTurn(gamestate) * 3, 0);
}


//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// Choose randomly between RPS
function chooseRPS() {
	return intToChar(getRandomInt(0, 3));
}

const Parameters = Object.freeze({
    EXPECTED_RUNTIME: 1500,    
});

function whoWonRound(round) {
    return winTable[charToInt(round.p1)][charToInt(round.p2)];
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
        default: return char;
    }
}

function intToChar(int) {
    switch(int) {
        case 0: return 'R';
        case 1: return 'P';
        case 2: return 'S';
        case 3: return 'W';
        case 4:return 'D';
        default: return int;
    }
}