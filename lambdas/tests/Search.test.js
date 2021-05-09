let Search = require("../Search");
const AWS = require("aws-sdk");

// const dynamoDBImages = [{}]

jest.mock("aws-sdk", () => {
  const mockDynamoDBObj = {
    scan: jest.fn().mockReturnThis(),
    putItem: jest.fn().mockReturnThis(),
    getItem: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: jest.fn(() => mockDynamoDBObj),
  };
});

describe("search", () => {
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

  it("should not search if no query params given", async () => {
    await Search.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith("Query strings not provided", null);
  });

  it("should search successfully", async () => {
    dynamodb.scan().promise.mockResolvedValueOnce({ Items: [{imageKey: {S: "long-imagekey-1"}}, {imageKey: {S: "long-imagekey-2"}}] });
    await Search.handler(
      {
        queryStringParameters: {username: "user", searchQuery: "s"},
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: "[\"long-imagekey-1\",\"long-imagekey-2\"]", statusCode: 200 })
    );
  });
});
