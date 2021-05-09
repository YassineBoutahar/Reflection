let GetUserImages = require("../GetUserImages");
const AWS = require("aws-sdk");

// const dynamoDBImages = [{}]

jest.mock("aws-sdk", () => {
  const mockS3Obj = {
    deleteObject: jest.fn().mockReturnThis(),
    headObject: jest.fn().mockReturnThis(),
    getSignedUrl: jest.fn().mockReturnThis(),
    listObjectsV2: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    S3: jest.fn(() => mockS3Obj),
  };
});

describe("get user image", () => {
  let s3;
  const callback = jest.fn();
  beforeEach(() => {
    s3 = new AWS.S3();
  });
  afterEach(() => {
    callback.mockReset();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should not get images when no username provided", async () => {
    await GetUserImages.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith(
      "Query strings not provided", null
    );
  });

  it("should get images successfully", async () => {
    s3.listObjectsV2().promise.mockResolvedValueOnce({Contents: [{Key: "long-id-number-one"}, {Key: "long-id-number-two"}]});
    await GetUserImages.handler(
      {
        queryStringParameters: {username: "user"},
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: "[\"long-id-number-one\",\"long-id-number-two\"]", statusCode: 200 })
    );
  });
});
