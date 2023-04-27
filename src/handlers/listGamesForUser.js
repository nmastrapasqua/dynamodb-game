'use strict';

const {User} = require('../data/user');
const {listGamesForUser} = require('../data/gameuser');

module.exports.main = async (event) => {
    try {

        let user = new User(event.pathParameters.username)
        let result = await listGamesForUser(user)
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('listGamesForUser error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
}