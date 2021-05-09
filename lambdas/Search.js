const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB();

exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    callback("Query strings not provided", null);
    return;
  }

  let username = event.queryStringParameters.username.toLowerCase();
  let searchQuery = event.queryStringParameters.searchQuery.toLowerCase();

  // Get all images with matching metadata
  const ddbSearchParams = {
    FilterExpression:
      "contains (contentType, :searchQuery) OR contains (description, :searchQuery) OR contains (username, :searchQuery) OR contains (filename, :searchQuery) OR contains (hashtags, :searchQuery)",
    ExpressionAttributeValues: {
      ":searchQuery": { S: searchQuery },
    },
    ProjectionExpression: "imageKey",
    TableName: "ReflectionImages",
  };

  await ddb
    .scan(ddbSearchParams)
    .promise()
    .then(
      function (data) {
        let response = {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(data.Items.map((imgItem) => imgItem.imageKey.S)),
          isBase64Encoded: false,
        };
        callback(null, response);
      },
      function (err) {
        let response = {
          statusCode: err.statusCode,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(err.message),
          isBase64Encoded: false,
        };
        callback(null, response);
      }
    );
};
