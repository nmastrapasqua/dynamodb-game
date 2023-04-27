'use strict';

const {User} = require('../data/user');
const {Game, startGame} = require('../data/game');

module.exports.main = async (event) => {
    try {

        const game = new Game(null, null, event.pathParameters.gameId)
        const {username} = JSON.parse(event.body);
        const user = new User(username)
        let result = await startGame(game, user)
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('startGame error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}