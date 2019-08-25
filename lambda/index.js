const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  let payload;
  const operation = event.httpMethod;

  switch (operation) {
    case 'POST':
      payload = JSON.parse(event.body);
      dynamo.put(payload, callback);
      break;
    case 'GET':
      const tags = event.queryStringParameters.tags;
      const filterExpressionArray = [];
      const attributeValues = {};
      tags.split(",").forEach((tag, i) => {
        filterExpressionArray.push(`contains(tags, :tag${i+1})`);
        attributeValues[`:tag${i+1}`] = tag;
      });
      payload = {
        "TableName": "Restaurants",
        "FilterExpression": filterExpressionArray.join(" OR "),
        ExpressionAttributeValues: attributeValues
      };
      dynamo.scan(payload, function(err, data) {
        const response = {
          "statusCode": 200,
          "body": JSON.stringify(data),
          "isBase64Encoded": false
        };
        callback(null, response);
      });
      break;
    case 'update':
      dynamo.update(payload, callback);
      break;
    case 'delete':
      dynamo.delete(payload, callback);
      break;
    case 'echo':
      callback(null, 'Success');
      break;
    case 'ping':
      callback(null, 'pong');
      break;
    default:
      callback(`Unknown operation: ${operation}`);
  }
};