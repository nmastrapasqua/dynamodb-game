'use strict';

const {Game, getGame} = require('../data/game');

module.exports.main = async (event) => {
    try {
        const game = new Game(null, null, event.pathParameters.gameId)
        const result = await getGame(game);
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('getGame error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}
