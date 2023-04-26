'use strict';

const {Item, ItemNotFoundError} = require('../data/base');

class Email extends Item {

    constructor(email) {
        super()
        this.email = email
    }

    static fromItem(item) {
        if (!item) throw new ItemNotFoundError("No item!")
        return new Email(item.email.S)
    }

    pk() {
        return `EMAIL#${this.email}`
    }

    sk() {
        return `#METADATA#${this.email}`
    }

    toItem() {
        return {
            ...this.keys()
        }
    }
}

module.exports = {
    Email
};