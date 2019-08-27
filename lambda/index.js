const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

function formatResponse(data) {
  return {
    "statusCode": 200,
    "body": JSON.stringify(data),
    "headers": {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    },
    "isBase64Encoded": false
  };
}

exports.handler = (event, context, callback) => {
  let payload;
  const operation = event.httpMethod;

  switch (operation) {
    case 'POST':
      payload = JSON.parse(event.body);
      payload.TableName = process.env.TABLE_NAME;
      dynamo.put(payload, callback);
      break;
    case 'GET':
      if (event.queryStringParameters && event.queryStringParameters.tags) {
        const tags = event.queryStringParameters.tags;
        const filterExpressionArray = [];
        const attributeValues = {};

        tags.split(",").forEach((tag, i) => {
          filterExpressionArray.push(`contains(tags, :tag${i+1})`);
          attributeValues[`:tag${i+1}`] = tag;
        });
        payload = {
          "TableName": process.env.TABLE_NAME,
          "FilterExpression": filterExpressionArray.join(" AND "),
          ExpressionAttributeValues: attributeValues
        };
        dynamo.scan(payload, (err, data) => {
          callback(null, formatResponse(data));
        });
      } else {
        payload = {
          "TableName": process.env.TABLE_NAME,
          ProjectionExpression: "RestaurantId"
        };
        dynamo.scan(payload, (err, data) => {
          const totalItems = data.Items.length;
          const randomIndex = Math.floor(Math.random() * totalItems);
          const restaurantId = data.Items[randomIndex].RestaurantId;
          payload = {
            "TableName": process.env.TABLE_NAME,
            "KeyConditionExpression": `RestaurantId = :restaurantId`,
            "ExpressionAttributeValues": {
              ":restaurantId": restaurantId
            }
          };
          dynamo.query(payload, (error, restaurant) => {
            callback(null, formatResponse(restaurant));
          });
        });
      }
      break;
    default:
      callback(`Unknown operation: ${operation}`);
  }
};