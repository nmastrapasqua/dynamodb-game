'use strict';

const {GameUser, joinGames} = require('../data/gameuser');

module.exports.main = async (event) => {
    try {
        const {gameId} = JSON.parse(event.body)
        const gameUser = new GameUser(gameId, event.pathParameters.username)

        const result = await joinGames(gameUser)
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('joinGames error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}