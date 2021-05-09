let GetImage = require("../GetImage");
const AWS = require("aws-sdk");

// const dynamoDBImages = [{}]

jest.mock("aws-sdk", () => {
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
    S3: jest.fn(() => mockS3Obj),
  };
});

describe("get image", () => {
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

  it("should not get when no image key provided", async () => {
    await GetImage.handler({}, { awsRequestId: "long-id-123" }, callback);
    expect(callback).toHaveBeenCalledWith("Query strings not provided", null);
  });

  it("should get image successfully", async () => {
    s3.headObject().promise.mockResolvedValueOnce({
      Metadata: { private: "false", username: "user" },
    });
    await GetImage.handler(
      {
        queryStringParameters: {
          username: "user",
          imageKey: "user/long-img-key",
        },
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        body:
          '{"presignedUrl":"https://myphoto.photo.com","metadata":{"private":"false","username":"user","uploader":"user","imageId":"long-img-key"}}',
        statusCode: 200,
      })
    );
  });

  it("should not get image if it belongs to another user and is private", async () => {
    s3.headObject().promise.mockResolvedValueOnce({
      Metadata: { private: "true", username: "differentuser" },
    });
    await GetImage.handler(
      {
        queryStringParameters: {
          username: "user",
          imageKey: "user/long-img-key",
        },
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        body: "This image is private",
        statusCode: 403,
      })
    );
  });

  it("should get image if it belongs to same user and is private", async () => {
    s3.headObject().promise.mockResolvedValueOnce({
      Metadata: { private: "true", username: "user" },
    });
    await GetImage.handler(
      {
        queryStringParameters: {
          username: "user",
          imageKey: "user/long-img-key",
        },
      },
      { awsRequestId: "long-id-123" },
      callback
    );
    expect(callback).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        body:
          '{"presignedUrl":"https://myphoto.photo.com","metadata":{"private":"true","username":"user","uploader":"user","imageId":"long-img-key"}}',
        statusCode: 200,
      })
    );
  });
});
