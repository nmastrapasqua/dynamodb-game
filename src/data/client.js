'use strict';

const AWS = require('aws-sdk'); 
AWS.config.setPromisesDependency(require('bluebird'));

const IS_OFFLINE = process.env.IS_OFFLINE;

let client = null;

// Create the DynamoDB service object
module.exports.getClient = () => {
    if (client) return client
    console.log('Creating new DynamoDB service object');
    if (IS_OFFLINE === 'true') {
        console.log('Use DynamoDB local');
        client = new AWS.DynamoDB({
            region: 'localhost',
            accessKeyId: 'dummy',
            secretAccessKey: 'dummy',
            endpoint: 'http://localhost:8000',
        });
    } else {
        client = new AWS.DynamoDB({
            httpOptions: {
                connectTimeout: 1000,
                timeout: 1000
            }
        });
    }
    return client;
};