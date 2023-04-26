'use strict';

const {User, getUser} = require('../data/user');

module.exports.main = async (event) => {

    try {
        const user = new User(event.pathParameters.username)
        const result = await getUser(user);
    
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch(error) {
        console.error('getUser error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
};