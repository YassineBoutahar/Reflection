const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    callback("Query strings not provided", null);
    return;
  }

  let username = event.queryStringParameters.username;

  let s3listObjectsParams = {
    Bucket: "reflection-images",
    Prefix: `${username}/`,
  };

  // Get all image ids under a user's folder
  await s3
    .listObjectsV2(s3listObjectsParams)
    .promise()
    .then(
      function (data) {
        let foundKeys = data.Contents.map((imgObj) => imgObj.Key);
        let response = {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(foundKeys),
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
