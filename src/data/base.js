'use strict';

class Item {

    keys() {
        return {
            PK: { S: this.pk() },
            SK: { S: this.sk() }
        }
    }

    pk() {
        throw new Error("Method 'pk()' must be implemented.");
    }

    sk() {
        throw new Error("Method 'sk()' must be implemented.");
    }

    toItem() {
        throw new Error("Method 'toItem()' must be implemented.");
    }
}

class ItemNotFoundError extends Error {

    constructor(message) {
        super(message);
        this.name = "ItemNotFoundError";
        this.statusCode = 404;
    }
}

module.exports = {
    Item,
    ItemNotFoundError
};
