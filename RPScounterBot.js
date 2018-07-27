const prevDatabase = require('./prevDatabase');
const statisticalHelper = require('./statisticalHelper');

class Bot {

    constructor() {
        this.dynamiteNum = 0;
        this.database = new prevDatabase.PrevDatabase();
    }

    makeMove(gamestate) {

        // Update database

        this.database.newData(gamestate);
        const nextMove = this.database.getBestMove(gamestate);
        
        // Random dynamite
        if (this.dynamiteNum < 100 && Math.random() < statisticalHelper.dynamiteChance(gamestate, this.dynamiteNum)) {
            this.dynamiteNum++;
            return 'D';
        }

        return nextMove;
    }
}

module.exports = new Bot();
