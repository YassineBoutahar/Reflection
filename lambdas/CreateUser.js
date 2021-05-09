const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB();

exports.handler = async (event, context, callback) => {
  if (!event.body) {
    callback("Body not provided", null);
    return;
  }

  let eventBody = JSON.parse(event.body);
  let accountToken = context.awsRequestId;
  let username = eventBody.username.toLowerCase();

  const ddbScanParams = {
    FilterExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": { S: username },
    },
    ProjectionExpression: "username",
    TableName: "ReflectionUsers",
  };

  let ddbPutParams = {
    TableName: "ReflectionUsers",
    Item: {
      username: { S: username },
      userToken: { S: accountToken },
    },
  };

  // Check if user already exists and add them if they do not
  await ddb
    .scan(ddbScanParams)
    .promise()
    .then(
      async function (data) {
        if (data.Items && data.Items.length > 0) {
          let response = {
            statusCode: 403,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify("This username is already taken"),
            isBase64Encoded: false,
          };
          callback(null, response);
        } else {
          await ddb
            .putItem(ddbPutParams)
            .promise()
            .then(
              function (data) {
                let response = {
                  statusCode: 200,
                  headers: { "Access-Control-Allow-Origin": "*" },
                  body: JSON.stringify(accountToken),
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
        }
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
