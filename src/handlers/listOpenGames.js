'use strict';

const {listOpenGames, listOpenGamesByMap} = require('../data/game');

module.exports.main = async (event) => {
    try {

        let map = event?.queryStringParameters?.map
        let result = map ? await listOpenGamesByMap(map) : await listOpenGames()
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('listOpenGames error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}