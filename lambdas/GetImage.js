const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  if (!event.queryStringParameters) {
    callback("Query strings not provided", null);
    return;
  }

  let username = event.queryStringParameters.username;
  let imageKey = event.queryStringParameters.imageKey;

  let s3GetParams = {
    Bucket: "reflection-images",
    Key: imageKey,
  };

  // Get image head only to check if private, more efficient
  await s3
    .headObject(s3GetParams)
    .promise()
    .then(
      function (data) {
        if (
          data.Metadata.private == "true" &&
          data.Metadata.username != username
        ) {
          let response = {
            statusCode: 403,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: "This image is private",
            isBase64Encoded: false,
          };
          callback(null, response);
        } else {
          const presignedGetUrl = s3.getSignedUrl("getObject", s3GetParams);
          let response = {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
              presignedUrl: presignedGetUrl,
              metadata: {
                ...data.Metadata,
                uploader: imageKey.split("/")[0],
                imageId: imageKey.split("/")[1],
              },
            }),
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
