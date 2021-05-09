const AWS = require("aws-sdk");
const ddb = new AWS.DynamoDB();

exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    callback("Query strings not provided", null);
    return;
  }

  let userToken = event.queryStringParameters.userToken;

  let ddbGetParams = {
    TableName: "ReflectionUsers",
    Key: {
      userToken: { S: userToken },
    },
    ProjectionExpression: "username",
  };

  await ddb
    .getItem(ddbGetParams)
    .promise()
    .then(
      async function (data) {
        if (data.Item && data.Item.username) {
          let response = {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify(data.Item.username.S),
            isBase64Encoded: false,
          };
          callback(null, response);
        } else {
          let response = {
            statusCode: 404,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify("User not found"),
            isBase64Encoded: false,
          };
          callback(null, response);
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
