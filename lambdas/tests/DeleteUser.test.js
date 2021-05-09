let DeleteImage = require("../DeleteImage");
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

describe("delete image", () => {
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

  it("should not delete when no image key provided", async () => {
    await DeleteImage.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith(
      "Body not provided",
      expect.objectContaining({ body: '"Body not provided"', statusCode: 400 })
    );
  });

  it("should delete object successfully", async () => {
    s3.deleteObject().promise.mockResolvedValueOnce({});
    await DeleteImage.handler(
      {
        body: '{"username": "user", "imageId": "long-id-789"}',
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ body: "{}", statusCode: 200 })
    );
  });
});
