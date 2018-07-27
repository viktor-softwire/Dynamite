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