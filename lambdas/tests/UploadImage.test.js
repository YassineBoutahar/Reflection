let UploadImage = require("../UploadImage");
const AWS = require("aws-sdk");

// const dynamoDBImages = [{}]

jest.mock("aws-sdk", () => {
  const mockDynamoDBObj = {
    scan: jest.fn().mockReturnThis(),
    putItem: jest.fn().mockReturnThis(),
    getItem: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  const mockS3Obj = {
    deleteObject: jest.fn().mockReturnThis(),
    headObject: jest.fn().mockReturnThis(),
    getSignedUrl: jest
      .fn()
      .mockImplementation(() => "https://myphoto.photo.com"),
    listObjectsV2: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: jest.fn(() => mockDynamoDBObj),
    S3: jest.fn(() => mockS3Obj),
  };
});

describe("upload image", () => {
  let dynamodb;
  const callback = jest.fn();
  beforeEach(() => {
    dynamodb = new AWS.DynamoDB();
  });
  afterEach(() => {
    callback.mockReset();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should not upload when no body given", async () => {
    await UploadImage.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith("Body not provided", null);
  });

  it("should upload successfully", async () => {
    dynamodb.putItem().promise.mockResolvedValueOnce({});
    await UploadImage.handler(
      {
        body:
          '{"username": "user", "imageType": "image/png", "filename": "myfile.png", "description": "desc", "hashtags": "", "private": "false"}',
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: "https://myphoto.photo.com", statusCode: 200 })
    );
  });
});
