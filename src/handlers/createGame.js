'use strict';

const {Game, createGame} = require('../data/game');

module.exports.main = async (event) => {

    try {
        const {creator, map} = JSON.parse(event.body);
        const game = new Game(creator, map);
        const newGame = await createGame(game);

        return {
            statusCode: 200,
            body: JSON.stringify(newGame)
        };
    } catch(error) {
        console.error('createGame error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}