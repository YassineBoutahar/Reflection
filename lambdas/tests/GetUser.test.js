let GetUser = require("../GetUser");
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

describe("get user", () => {
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

  it("should not get a user when no username given", async () => {
    await GetUser.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith("Query strings not provided", null);
  });

  it("should get a user if they exist", async () => {
    dynamodb
      .getItem()
      .promise.mockResolvedValueOnce({ Item: { username: { S: "user" } } });
    await GetUser.handler(
      {
        queryStringParameters: {userToken: "long-id-123"},
      },
      { awsRequestId: "random-request-id-321" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: "\"user\"", statusCode: 200 })
    );
  });

  test("should not get a user when no user exists with that token", async () => {
    dynamodb.getItem().promise.mockResolvedValueOnce({});
    await GetUser.handler(
      {
        queryStringParameters: {userToken: "wrong-id-321"},
      },
      { awsRequestId: "random-request-id-321" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        body: "\"User not found\"",
        statusCode: 404,
      })
    );
  });
});
