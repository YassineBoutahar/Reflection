let CreateUser = require("../CreateUser");
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
    getSignedUrl: jest.fn().mockReturnThis(),
    listObjectsV2: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: jest.fn(() => mockDynamoDBObj),
    S3: jest.fn(() => mockS3Obj),
  };
});

describe("create user", () => {
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

  it("should not create a user when no username given", async () => {
    await CreateUser.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith("Body not provided", null);
  });

  it("should create a user when there's no existing user", async () => {
    dynamodb.scan().promise.mockResolvedValueOnce({ Items: [] });
    dynamodb.putItem().promise.mockResolvedValueOnce("my-id");
    await CreateUser.handler(
      {
        body: '{"username": "user"}',
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: '"long-id-123"', statusCode: 200 })
    );
  });

  it("should not create a user when there's an existing user with same name", async () => {
    dynamodb
      .scan()
      .promise.mockResolvedValueOnce({
        Items: [{ Item: { username: { S: "user" } } }],
      });
    dynamodb.putItem().promise.mockResolvedValueOnce("my-id");
    await CreateUser.handler(
      {
        body: '{"username": "user"}',
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        body: '"This username is already taken"',
        statusCode: 403,
      })
    );
  });
});
