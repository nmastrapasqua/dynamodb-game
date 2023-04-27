'use strict';

const {Item, ItemNotFoundError} = require('./base');
const {Email} = require('./email');
const {getClient} = require('./client');

class User extends Item {

    constructor(username, name='', address='', birthdate='', email='') {
        super()
        this.username = username
        this.name = name
        this.address = address
        this.birthdate = birthdate
        this.email = email
    }

    static fromItem(item) {
        if (!item) throw new ItemNotFoundError("No item!")
        return new User(item.username.S, item.name.S, item.address.S, item.birthdate.S, item.email.S)
    }

    pk() {
        return `USER#${this.username}`
    }

    sk() {
        return `#METADATA#${this.username}`
    }

    toItem() {
        return {
            ...this.keys(),
            name: {S: this.name},
            username: {S: this.username},
            address: {S: this.address},
            birthdate: {S: this.birthdate},
            email: {S: this.email}
        }
    }
}

/**
 * Questo metodo usa un pattern per
 * implementare il vincolo di unicità su un campo
 * non chiave (email). Per ulteriori dettagli si rimanda
 * ai seguenti link:
 * 
 * https://advancedweb.hu/how-to-properly-implement-unique-constraints-in-dynamodb/
 * https://aws.amazon.com/it/blogs/database/simulating-amazon-dynamodb-unique-constraints-using-transactions/
 */
var createUser = async(user) => {
    const dbb = getClient();

    const email = new Email(user.email);

    await dbb.transactWriteItems({
        TransactItems: [
            {
                Put: {
                    TableName: process.env.TABLE_NAME,
                    Item: user.toItem(),
                    ConditionExpression: "attribute_not_exists(PK)",
                }
            },
            {
                Put: {
                    TableName: process.env.TABLE_NAME, 
                    ConditionExpression: "attribute_not_exists(PK)",
                    Item : email.toItem()
                }
            }
        ]
    })
    .promise();

    return user;
}

var getUser = async(user) => {
    const dbb = getClient();

    const resp = await dbb
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: user.keys()
            })
            .promise()
    return User.fromItem(resp.Item)
}


module.exports = {
    User,
    createUser,
    getUser
};
