const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-west-1",
});

export const s3 = new AWS.S3();

/**
 * The `uploadFile` function uploads a file to an S3 bucket with the specified file name.
 * @param file - The `file` parameter is the file object that you want to upload to the specified S3
 * bucket. It could be an image, video, document, or any other type of file that you want to store in
 * the cloud.
 * @param fileName - The `fileName` parameter is a string that represents the name of the file you want
 * to upload to the "ratedarts" bucket.
 * @returns The `uploadFile` function is returning a promise that resolves when the file upload to the
 * specified S3 bucket is completed.
 */
export const uploadFile = (file, fileName) => {
  const params = {
    Bucket: "ratedarts",
    Key: fileName,
    Body: file,
  };

  return s3.upload(params).promise();
};
