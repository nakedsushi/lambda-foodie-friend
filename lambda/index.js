const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  let payload;
  const operation = event.httpMethod;
  console.log(event);

  switch (operation) {
    case 'POST':
      payload = JSON.parse(event.body);
      dynamo.put(payload, callback);
      break;
    case 'GET':
      payload = {
        "TableName": "Restaurants",
        "FilterExpression": "contains(tags, :tag1) OR contains(tags, :tag2)",
        ExpressionAttributeValues: {
          ":tag1": "low",
          ":tag2": "dumplings"
        }
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