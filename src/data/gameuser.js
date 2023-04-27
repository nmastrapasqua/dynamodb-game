'use strict';

const {Item, ItemNotFoundError} = require('./base');
const {Game} = require('./game');
const {User} = require('./user');
const {getClient} = require('./client');

class GameUser extends Item {

    constructor(game_id, username) {
        super()
        this.game_id = game_id
        this.username = username
    }

    static fromItem(item) {
        if (!item) throw new ItemNotFoundError("No item!")
        return new GameUser(item.game_id.S, item.username.S)
    }

    pk() {
        return `GAME#${this.game_id}`
    }

    sk() {
        return `USER#${this.username}`
    }

    toItem() {
        return {
            ...this.keys(),
            game_id: {S: this.game_id},
            username: {S: this.username}
        }
    }
}

var joinGames = async(gameUser) => {
    const dbb = getClient();
    const game = new Game(null, null, gameUser.game_id)
    const user = new User(gameUser.username)

    await dbb.transactWriteItems({
        TransactItems: [
            {
                Put: {
                    TableName: process.env.TABLE_NAME,
                    Item: gameUser.toItem(),
                    ConditionExpression: "attribute_not_exists(SK)"
                }
            },
            {
                Update: {
                    TableName: process.env.TABLE_NAME,
                    Key: game.keys(),
                    UpdateExpression: "SET people = people + :p",
                    ConditionExpression: "people < :limit",
                    ExpressionAttributeValues: {
                        ":p": { N: "1" },
                        ":limit": { N: "50" }
                    }
                }
            },
            {
                ConditionCheck: {
                    TableName: process.env.TABLE_NAME,
                    ConditionExpression: "attribute_exists(PK)",
                    Key: user.keys()
                }
            }
        ]
    })
    .promise();

    return gameUser
}

var listUsersInGame = async(game) => {
    const dbb = getClient();

    const resp = await dbb
        .query({
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "PK = :pk AND SK BETWEEN :metadata AND :users",
            ExpressionAttributeValues: {
                ":pk": { "S": game.pk() },
                ":metadata": { "S": game.sk() },
                ":users": { "S": "USER$" }
            },
            ScanIndexForward: true
        })
        .promise()

    return {
        game: Game.fromItem(resp.Items[0]),
        users: resp.Items.slice(1).map((item) => GameUser.fromItem(item))
    }
}


var listGamesForUser = async(user) => {
    const dbb = getClient();

    const resp = await dbb
        .query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'InvertedIndex',
            KeyConditionExpression: "SK = :sk",
            ExpressionAttributeValues: {
                ":sk": { "S": user.pk() }
            },
            ScanIndexForward: true
        })
        .promise()

    return resp.Items.map((item) => GameUser.fromItem(item))
}


module.exports = {
    GameUser,
    joinGames,
    listUsersInGame,
    listGamesForUser
};
