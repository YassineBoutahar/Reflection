const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const ddb = new AWS.DynamoDB();
exports.handler = async (event, context, callback) => {
  if (!event.body) {
    callback("Body not provided", null);
    return;
  }

  let eventBody = JSON.parse(event.body);
  let imageId = context.awsRequestId;

  let imageType = eventBody.imageType.toLowerCase();
  let username = eventBody.username.toLowerCase();
  let filename = eventBody.filename.toLowerCase();
  let description = eventBody.description.toLowerCase();
  let hashtags = eventBody.hashtags.toLowerCase();
  let privateStatus = eventBody.private.toString().toLowerCase();

  let s3UploadParams = {
    Bucket: "reflection-images",
    ContentType: imageType,
    Key: `${username}/${imageId}`,
    Metadata: {
      filename,
      description,
      hashtags,
      username,
      private: privateStatus,
    },
  };

  let ddbParams = {
    TableName: "ReflectionImages",
    Item: {
      imageKey: { S: `${username}/${imageId}` },
      contentType: { S: imageType },
      filename: { S: filename },
      description: { S: description },
      hashtags: { S: hashtags },
      username: { S: username },
      private: { S: privateStatus },
    },
  };

  ddb.putItem(ddbParams, function (err, data) {});

  const presignedPutUrl = s3.getSignedUrl("putObject", s3UploadParams);
  let response = {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: presignedPutUrl,
    isBase64Encoded: false,
  };
  callback(null, response);
};
