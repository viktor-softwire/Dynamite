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

module.exports = {winTable, charToInt, intToChar};