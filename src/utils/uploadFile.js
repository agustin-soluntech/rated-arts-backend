import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { streamCollector } from "@aws-sdk/stream-collector-node";
import fs from "fs";
import { Readable } from 'stream'; 

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const downloadFile = async (fileName) => {
  const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  });
  try {
    const { Body } = await client.send(command);
    // Collect the stream into a buffer
    const buffer = await streamCollector(Body);
    return buffer; // This is your file as a buffer
  } catch (error) {
    console.error("Error getting file as buffer from S3:", error);
    throw error;
  }
};
export const uploadFile = async (file, productName, artistName) => {
  const stream = fs.createReadStream(file.tempFilePath);
  const folder = `${artistName}/${productName}/`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: folder + file.name,
    Body: stream,
  };
  const command = new PutObjectCommand(uploadParams);
  const result = await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}${file.name}`;
  return url.replace(/ /g, "+");
};

export const uploadImage = async (buffer, name, artistName, edition, productName) => {
  const vers = edition? `${edition}_` : "";
  const key = `${artistName}/${productName}/shopify/${vers}${name}`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
  };
  const command = new PutObjectCommand(uploadParams);
  await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return url.replace(/ /g, "+");
};
export const uploadFileFromUrl = async (fileUrl, artistName, fileName, productName) => {
  const response = await fetch(fileUrl);
  const file = await streamToBuffer(response.body);
  const key = artistName + "/" + productName + "/" + fileName;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'image/jpg',
  };
  const command = new PutObjectCommand(uploadParams);
  const result = await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return url.replace(/ /g, "+");
};