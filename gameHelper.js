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