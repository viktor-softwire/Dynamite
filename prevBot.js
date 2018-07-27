class PrevDatabase {

    constructor() {
        // Create a large 7-deep list (last 3 moves for everyone)
        // vStored as: this.previous[p2][p1][p2][p1][p2][p1][p2] where the last p2 is the unkown 
        this.database = this.addLevel(0, 7);
        
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
        return possibilities;
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
        this.LAST20WEIGHT = 1;
        this.LAST100WEIGHT = 2;
        this.DATABASE_WIEGHT = 0.15;
        this.database = new PrevDatabase();
        this.DCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.WCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.situationCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.enemyDNum = 0;
        this.waterNum = 0;
        this.dynamiteNum = 0;
        this.RCounter = 0;
        this.PCounter = 0;
        this.SCounter = 0;
    }

    makeMove(gamestate) {

        // Init
        if (gamestate.rounds.length === 0) {
            // console.log(`Rock: ${this.RCounter}`);
            // console.log(`Pper: ${this.PCounter}`);
            // console.log(`Scissors: ${this.SCounter}`);
            // console.log(`Prev Water: ${this.waterNum}`);
            // console.log(`Prev Dynamite: ${this.dynamiteNum}`); 
            this.database = new PrevDatabase();
            this.DCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.WCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.situationCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.enemyDNum = 0;
            this.waterNum = 0;
            this.dynamiteNum = 0;
            this.RCounter = 0;
            this.PCounter = 0;
            this.SCounter = 0;
        }
        
        // Update database
        this.database.newData(gamestate);
        this.updateDWCounter(gamestate);
        
        // Base distros
        const probabilities = [1/3, 1/3, 1/3];

        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < this.dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }

        /*
        // Random water
        if (this.waterChance(gamestate) > Math.random()) {
            this.waterNum++;
            return 'W';
        }*/

        // Last20
        const last20 = lastNDistro(gamestate, 20);
        if (!last20) return chooseRPS();
        const maxValue = Math.max(...last20);
        if (maxValue > 7) {
            let squaredSum = 0;
            last20.forEach(distro => {
                squaredSum += distro * distro
            });
            const squaredDistro = last20.map(distro => {
                return (distro*distro/squaredSum - 1/3);  
            });
            for (let i = 0; i < squaredDistro.length; i++) {
                probabilities[i] += squaredDistro[i] * this.LAST20WEIGHT;
            }
        }

        // Last 100
        const last100 = lastNDistro(gamestate, 100);
        if (last100) {
            const sum = last100.reduce((a, b) => a+b, 0);
            const last100Distro = last20.map(distro => {
                return distro/sum;
            });
            for (let i = 0; i < last100Distro.length; i++) {
                probabilities[i] += (last100Distro[i] - 1/3) * this.LAST100WEIGHT;
            }
        }

        // Finally database lookup
        if (gamestate.rounds.length > 100) {
            const databaseProbabilities = this.database.getBestMove(gamestate).slice(0, 3); // Only interested in RPS
            for (let i = 0; i < 3; i++) {
                probabilities[i] += Math.max(databaseProbabilities[i] - 1, 0) * this.DATABASE_WIEGHT;
            }
        }

        // Normalize probabilites
        // Make everything positive
        const minP = Math.min(...probabilities);
        if (minP < 0) {
            for (let i = 0; i < 3; i++) {
                probabilities[i] += minP;
            }
        }
        const probSum = probabilities.reduce((a, b) => a+b, 0)
        const normalized = probabilities.map(p => {
            return p/probSum;
        });
        for (let i = 0; i < 3; i++) {
            probabilities[i] = normalized[i];
        }

        // And now predict!
        const seed = Math.random();
        if (seed > probabilities[0] + probabilities[1]) {this.RCounter++; return this.database.antiMove('S');}
        if (seed < probabilities[0]) {this.PCounter++; return this.database.antiMove('R');}
        this.SCounter++;
        return this.database.antiMove('P');    
        
    }

    updateDWCounter(gamestate) {
        if (gamestate.rounds.length > 0) {
            this.situationCounter[accumuolatedPoints(gamestate)]++;
        } 
        if (gamestate.rounds.length > 0 && gamestate.rounds[gamestate.rounds.length - 1].p2 === 'D') { 
            this.enemyDNum++;
            if (accumuolatedPoints(gamestate) < 10) {
                this.situationCounter[accumuolatedPoints(gamestate)]++;
                this.DCounter[accumuolatedPoints(gamestate)]++;
            }
        }
        if (gamestate.rounds.length > 0 && gamestate.rounds[gamestate.rounds.length - 1].p2 === 'W') { 
            if (accumuolatedPoints(gamestate) < 10) {
                this.WCounter[accumuolatedPoints(gamestate)]++;
            }
        }

        // console.log('Updated situationCounter');
        // console.log(this.situationCounter);
    }


    // A naive implementation of randomized dynamite
    dynamiteChance(gamestate, dynamiteCounter) {
        const baseChance = (100 - dynamiteCounter) / expectedRemainingTurn(gamestate) * 0.5;

        const addedChance = accumuolatedPoints(gamestate) * 0.3;
        // console.log('First bit' + this.DCounter[accumuolatedPoints(gamestate)]/this.situationCounter[accumuolatedPoints(gamestate)]);
        // console.log(this.situationCounter[accumuolatedPoints(gamestate)]);
        // console.log(this.DCounter[accumuolatedPoints(gamestate)]/this.situationCounter[accumuolatedPoints(gamestate)]);
        // console.log(`Dynamite chance: ${baseChance + addedChance}`);
        return Math.max(baseChance + addedChance, 0);
    }

    waterChance(gamestate) {
        if (this.enemyDNum === 100) return 0;
        return this.DCounter[accumuolatedPoints(gamestate)] / this.situationCounter[accumuolatedPoints(gamestate)] * 3;
    }

}

module.exports = new Bot();




function accumuolatedPoints(gamestate) {
    let points = 0;
    while (gamestate.rounds.length > points && winTable[charToInt(gamestate.rounds[gamestate.rounds.length-1-points].p1)][charToInt(gamestate.rounds[gamestate.rounds.length-1-points].p2)] === 0) {
        points++;
    }
    return points;
}

// Not playing water yet
function waterChance(gamestate) {
    return accumuolatedPoints*accumuolatedPoints*0.02
}


// Trying to estimate remaining #rounds
function expectedRemainingTurn(gamestate) {
    if (gamestate.rounds.length < 30) return Parameters.EXPECTED_RUNTIME;
    const wins = currentPoints(gamestate);
    const maxWin = Math.max(wins.p1, wins.p2);
    const maxWinRate = maxWin / gamestate.rounds.length;
    const expectedCalculatedEnd = Math.min((1000 - maxWin) / maxWinRate, 2500 - gamestate.rounds.length);
    if (gamestate.rounds.length < 200) {
        const weight = (gamestate.rounds.length - 30) / 170;
        return Math.min(expectedCalculatedEnd*weight + (1-weight)*Parameters.EXPECTED_RUNTIME, 2500-gamestate.rounds.length);
    }
    return Math.min(expectedCalculatedEnd, 2500 - gamestate.rounds.length);
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

function lastNDistro(gamestate, limit) {
    if (gamestate.rounds.length < limit) return null;
    const played = [0, 0, 0];
    const neededRounds = gamestate.rounds.slice(-limit);
    neededRounds.forEach(round => {
        if (charToInt(round.p2) < 3) {
            played[charToInt(round.p2)]++;
        }
    })
    return played;
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