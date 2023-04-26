'use strict';

const {Item, ItemNotFoundError} = require('./base');
const {getClient} = require('./client');
const AWS = require('aws-sdk');

class Game extends Item {

    constructor(creator, map, 
        game_id=AWS.util.uuid.v4(),
        people=1, 
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

var createGame = async(game) => {
    const dbb = getClient();

    await dbb
        .putItem({
            TableName: process.env.TABLE_NAME,
            Item: game.toItem(),
            ConditionExpression: "attribute_not_exists(PK)"
        })
        .promise()

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

module.exports = {
    Game,
    createGame,
    getGame
};
