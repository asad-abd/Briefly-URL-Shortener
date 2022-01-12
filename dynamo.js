const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'short_to_long_url';

const getLongUrl = async (short) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            short
        },
    };
    return await dynamoClient.get(params).promise();
};

const addOrUpdateUrl = async (item) => {
    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };
    return await dynamoClient.put(params).promise();
};

const deleteUrl = async (short) => {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            short,
        },
    };
    return await dynamoClient.delete(params).promise();
};

module.exports = {
    dynamoClient,
    getLongUrl,
    addOrUpdateUrl,
    deleteUrl,
};