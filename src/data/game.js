'use strict';

const {Item, ItemNotFoundError} = require('./base');
const {User} = require('./user');
const {getClient} = require('./client');
const AWS = require('aws-sdk');

class Game extends Item {

    constructor(creator, map, 
        game_id=AWS.util.uuid.v4(),
        people=49, 
        create_time=new Date().toISOString().slice(0,19), 
        open_timestamp=new Date().toISOString().slice(0,19), 
        start_time=undefined) {

        super()
        this.creator = creator
        this.map = map
        this.game_id = game_id
        this.people = people
        this.create_time = create_time
        // Le seguenti proprietà possono
        // essere presenti o meno a seconda
        // dello stato del gioco
        this.open_timestamp = open_timestamp
        this.start_time = start_time
    }

    static fromItem(item) {
        if (!item) throw new ItemNotFoundError("No item!")
        return new Game(item.creator.S, 
            item.map.S, 
            item.game_id.S, 
            Number(item.people.N), 
            item.create_time.S, 
            item?.open_timestamp?.S, 
            item?.start_time?.S)
    }

    pk() {
        return `GAME#${this.game_id}`
    }

    sk() {
        return `#METADATA#${this.game_id}`
    }

    toItem() {
        return {
            ...this.keys(),
            creator: {S: this.creator},
            map: {S: this.map},
            game_id: {S: this.game_id},
            people: {N: this.people.toString()},
            create_time: {S: this.create_time},
            ...(this.start_time && {start_time: {S: this.start_time}}),
            ...(this.open_timestamp && {open_timestamp: {S: this.open_timestamp}})
        }
    }
}

/**
 * Nel seguente metodo viene mostrato un pattern per
 * implementare un vincolo di integrità referenziale.
 * In pratica l'item game viene creato solo se esiste
 * l'item relativo al creator (User).
 * Per ulteriori dettagli si rimanda al link:
 * 
 * https://advancedweb.hu/foreign-key-constraints-in-dynamodb/
 */
var createGame = async(game) => {
    const dbb = getClient();

    let creator = new User(game.creator);

    await dbb.transactWriteItems({
        TransactItems: [
            {
                Put: {
                    TableName: process.env.TABLE_NAME,
                    Item: game.toItem(),
                    ConditionExpression: "attribute_not_exists(PK)"
                }
            },
            {
                ConditionCheck: {
                    TableName: process.env.TABLE_NAME,
                    ConditionExpression: "attribute_exists(PK)",
                    Key: creator.keys()
                }
            }
        ]
    })
    .promise();

    return game
}

var getGame = async(game) => {
    const dbb = getClient();

    const resp = await dbb
            .getItem({
                TableName: process.env.TABLE_NAME,
                Key: game.keys()
            })
            .promise()
    return Game.fromItem(resp.Item)
}

var listOpenGames = async() => {
    const dbb = getClient();

    const resp = await dbb
        .scan({
            TableName: process.env.TABLE_NAME,
            IndexName: 'OpenGamesIndex'
        })
        .promise()

    return resp.Items.map((item) => Game.fromItem(item))

}

var listOpenGamesByMap = async(map) => {
    const dbb = getClient();

    const resp = await dbb
        .query({
            TableName: process.env.TABLE_NAME,
            IndexName: 'OpenGamesIndex',
            KeyConditionExpression: "#map = :map",
            ExpressionAttributeNames: {"#map": "map"},
            ExpressionAttributeValues: {":map": { "S": map } },
            ScanIndexForward: true
        })
        .promise()

    return resp.Items.map((item) => Game.fromItem(item))
}

var startGame = async(game, user) => {
    const dbb = getClient();

    const resp = await dbb
        .updateItem({
            TableName: process.env.TABLE_NAME,
            Key: game.keys(),
            UpdateExpression: "REMOVE open_timestamp SET start_time = :time",
            ConditionExpression: "people = :limit AND creator = :requesting_user AND attribute_not_exists(start_time)",
            ExpressionAttributeValues: {
                ":time": { "S": new Date().toISOString().slice(0,19) },
                ":limit": { "N": "50" },
                ":requesting_user": { "S": user.username }
            },
            ReturnValues: "ALL_NEW"
        })
        .promise()

    let updatedGame = Game.fromItem(resp.Attributes)
    updatedGame.open_timestamp = undefined
    return updatedGame
}

module.exports = {
    Game,
    createGame,
    getGame,
    listOpenGames,
    listOpenGamesByMap,
    startGame
};
