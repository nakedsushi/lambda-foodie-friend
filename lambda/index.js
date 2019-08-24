const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  const payload = JSON.parse(event.body);
  const operation = payload.operation;

  switch (operation) {
    case 'create':
      dynamo.put(payload, callback);
      break;
    case 'read':
      dynamo.get(payload, callback);
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