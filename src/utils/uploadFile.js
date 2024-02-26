import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const downloadFile = async (fileName) => {
  const s3Url = "https://s3.amazonaws.com/questionimagesjs/";
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  });
  const result = await client.send(command);
  result.Body.pipe(fs.createWriteStream(`./${fileName}`));
  console.log(result);
};
const uploadFile = async (file, artistName) => {
  const stream = fs.createReadStream(file.tempFilePath);
  const folder = artistName + "/";
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: folder + file.name,
    Body: stream,
  };
  const command = new PutObjectCommand(uploadParams);
  const result = await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}${file.name}`;
  return url;
};

export default uploadFile;
