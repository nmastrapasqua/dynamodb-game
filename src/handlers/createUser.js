'use strict';

const {User, createUser} = require('../data/user');

module.exports.main = async (event) => {

    try {
        const {username, name, address, birthdate, email} = JSON.parse(event.body);
        const user = new User(username, name, address, birthdate, email);

        const newUser = await createUser(user);
        
        return {
            statusCode: 200,
            body: JSON.stringify(newUser)
        };
    } catch(error) {
        console.error('createUser error:', error)
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error)
        };
    }
};