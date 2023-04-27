'use strict';

const {Game} = require('../data/game');
const {listUsersInGame} = require('../data/gameuser');

module.exports.main = async (event) => {
    try {

        let game = new Game(null, null, event.pathParameters.gameId)
        let result = await listUsersInGame(game)
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('listUsersInGame error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}