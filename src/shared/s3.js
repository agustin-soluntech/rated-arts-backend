const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-west-1",
});

export const s3 = new AWS.S3();

export const uploadFile = (file, fileName) => {
  const params = {
    Bucket: "ratedarts",
    Key: fileName,
    Body: file,
  };

  return s3.upload(params).promise();
};
