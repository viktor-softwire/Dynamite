class Bot {

    constructor() {
        this.LAST20WEIGHT = 1;
        this.LAST100WEIGHT = 2;
        this.DATABASE_WIEGHT = 0.15;
        this.DCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.WCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.situationCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.enemyDNum = 0;
        this.waterNum = 0;
        this.dynamiteNum = 0;
        this.RCounter = 0;
        this.PCounter = 0;
        this.SCounter = 0;
        this.enemyWater = 0;
    }

    makeMove(gamestate) {

        // Init
        if (gamestate.rounds.length === 0) {
            // console.log(`Rock: ${this.RCounter}`);
            // console.log(`Pper: ${this.PCounter}`);
            // console.log(`Scissors: ${this.SCounter}`);
            // console.log(`Water: ${this.waterNum}`);
            // console.log(`Dynamite: ${this.dynamiteNum}`); 
            this.DCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.WCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.situationCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.enemyDNum = 0;
            this.waterNum = 0;
            this.dynamiteNum = 0;
            this.RCounter = 0;
            this.PCounter = 0;
            this.SCounter = 0;
            this.enemyWater = 0;
        }

        this.updateDWCounter(gamestate);
        
        // Random water
        if (this.waterChance(gamestate) > Math.random()) {
            this.waterNum++;
            return 'W';
        }

        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < this.dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }


        return chooseRPS();

    }

    updateDWCounter(gamestate) {
        if (gamestate.rounds.length < 2) return;

        const prevState = {rounds: gamestate.rounds.slice(0, gamestate.rounds.length - 1)};
        if (gamestate.rounds.length > 0) {
            this.situationCounter[accumuolatedPoints(prevState)]++;
        } 
        if (gamestate.rounds.length > 0 && charToInt(gamestate.rounds[gamestate.rounds.length - 1].p2) === 4) { 
            this.enemyDNum++;
            if (accumuolatedPoints(prevState) < 10) {
                // console.log('DCounter updated at ' + accumuolatedPoints(gamestate));
                this.situationCounter[accumuolatedPoints(prevState)]++;
                this.DCounter[accumuolatedPoints(prevState)]++;
            }
        }
        if (gamestate.rounds.length > 0 && charToInt(gamestate.rounds[gamestate.rounds.length - 1].p2) === 3) { 
            this.enemyWater++;
            if (accumuolatedPoints(prevState) < 10) {
                this.WCounter[accumuolatedPoints(prevState)]++;
            }
        }
        // Random water
        if (this.waterChance(gamestate) > Math.random()) {
            this.waterNum++;
            return 'W';
        }
        
        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < this.dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }


        return chooseRPS();

        // console.log('Updated situationCounter');
        // console.log(this.situationCounter);
    }

    // A naive implementation of randomized dynamite
    dynamiteChance(gamestate, dynamiteCounter) {
        let baseChance = 0;
        const endBonus = expectedRemainingTurn(gamestate) < (100 - this.dynamiteNum)*0.2 ? 0.2 : 1
        // const baseChance = (100 - dynamiteCounter) / expectedRemainingTurn(gamestate) * 0.3;
        // if (!baseChance) {console.log('something went wrong wioth E[rem.T] @ round ' + gamestate.rounds.length); baseChance = 1;}
        let addedChance = Math.max(accumuolatedPoints(gamestate) * 0.5 - 0.5, 0);
        let penalty = this.WCounter[accumuolatedPoints(gamestate)]/this.situationCounter[accumuolatedPoints(gamestate)];
        if (!addedChance) addedChance = 0;
        if (!penalty) penalty = 0;
        // console.log('First bit ' + this.DCounter[accumuolatedPoints(gamestate)]/this.situationCounter[accumuolatedPoints(gamestate)]);
        // console.log('Second bit ' + this.WCounter[accumuolatedPoints(gamestate)]/this.situationCounter[accumuolatedPoints(gamestate)]);
        // console.log('Added points ' + addedChance);
        // console.log('Base chance ' + baseChance);
        // console.log('Penalty ' + penalty);
        // console.log(`Dynamite chance: ${baseChance + addedChance}`);
        return Math.max(baseChance + addedChance + endBonus - penalty, 0);
    }

    waterChance(gamestate) {
        if (accumuolatedPoints(gamestate) < 2) return 0;
        // if (accumuolatedPoints(gamestate) === 2) return 1;
        if (this.enemyDNum === 100) return 0;
        let waterChance = this.DCounter[accumuolatedPoints(gamestate)] / this.situationCounter[accumuolatedPoints(gamestate)] * 0.3;
        if (gamestate.rounds.length > 100) waterChance = waterChance * (1.5 - this.enemyWater/gamestate.rounds.length*10);
        if (this.situationCounter[accumuolatedPoints(gamestate)] === 0 && gamestate.rounds.length >= 3) {
           if (charToInt(gamestate.rounds[gamestate.rounds.length-1].p2) === 4) return 1;
        }
        // console.log('Dcounter: ' + this.DCounter);
        // console.log('Situation counter: ' + this.situationCounter);
        // console.log('Accumulated points ' + accumuolatedPoints(gamestate));
        // console.log('Water chance: ' + waterChance);
        return waterChance;


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

// Choose randomly between RPS
function chooseRPS() {
	return intToChar(getRandomInt(0, 3));
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

const Parameters = Object.freeze({
    EXPECTED_RUNTIME: 1500,    
});

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

//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

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
