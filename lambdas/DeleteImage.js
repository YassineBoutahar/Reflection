const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  let errorResponse = {
    statusCode: 400,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify("Body not provided"),
    isBase64Encoded: false,
  };

  if (!event.body) {
    callback("Body not provided", errorResponse);
    return;
  }

  let eventBody = JSON.parse(event.body);
  let s3DeleteParams = {
    Bucket: "reflection-images",
    Key: `${eventBody.username}/${eventBody.imageId}`,
  };

  await s3
    .deleteObject(s3DeleteParams)
    .promise()
    .then(
      function (data) {
        let response = {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(data),
          isBase64Encoded: false,
        };
        callback(null, response);
      },
      function (err) {
        let response = {
          statusCode: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify(err),
          isBase64Encoded: false,
        };
        callback(null, response);
      }
    );
};
