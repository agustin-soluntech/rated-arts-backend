import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { streamCollector } from "@aws-sdk/stream-collector-node";
import fs from "fs";
import fetch from "node-fetch";

/**
 * The function `streamToBuffer` converts a readable stream into a buffer by concatenating its chunks.
 * @param stream - The `stream` parameter in the `streamToBuffer` function is expected to be a readable
 * stream, such as a stream created by Node.js `fs.createReadStream()` or `http.get()`. This stream
 * will be read chunk by chunk, and the function will concatenate these chunks into a single Buffer
 * @returns The `streamToBuffer` function returns a single `Buffer` object that is the concatenation of
 * all the chunks read from the input stream.
 */
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

/**
 * The function `downloadFile` downloads a file from an AWS S3 bucket and returns it as a buffer.
 * @param fileName - The `fileName` parameter in the `downloadFile` function represents the name of the
 * file that you want to download from an AWS S3 bucket. This function constructs the S3 URL for the
 * file based on the bucket name and region from environment variables, then uses the AWS SDK to
 * retrieve the file
 * @returns The `downloadFile` function returns the file content as a buffer after downloading it from
 * an AWS S3 bucket.
 */
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
/**
 * The function `uploadFile` uploads a file to an AWS S3 bucket and returns the URL of the uploaded
 * file.
 * @param file - The `file` parameter is the file object that you want to upload. It typically contains
 * information such as the file name, size, type, and a temporary file path where the file is stored on
 * the server before uploading.
 * @param productName - The `productName` parameter is the name of the product for which the file is
 * being uploaded.
 * @param artistName - The `artistName` parameter refers to the name of the artist associated with the
 * file being uploaded.
 * @returns The function `uploadFile` returns a URL string that points to the uploaded file in an AWS
 * S3 bucket.
 */
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

/**
 * The function `uploadImage` uploads an image to an AWS S3 bucket and returns the URL of the uploaded
 * image.
 * @param buffer - The `buffer` parameter in the `uploadImage` function is typically a binary data
 * representing the image file that you want to upload to an AWS S3 bucket. This buffer contains the
 * actual image data that will be uploaded to the specified location in the S3 bucket.
 * @param name - The `name` parameter refers to the name of the image file that you want to upload.
 * @param artistName - The `artistName` parameter refers to the name of the artist who created the
 * image being uploaded.
 * @param edition - The `edition` parameter refers to the edition of the image being uploaded. If the
 * image belongs to a specific edition, the value of this parameter will be the edition number. If the
 * image is not part of any edition, the value will be `null` or `undefined`.
 * @param productName - The `productName` parameter refers to the name of the product for which the
 * image is being uploaded.
 * @returns The function `uploadImage` returns a URL string that points to the uploaded image in an AWS
 * S3 bucket. The URL is generated based on the provided parameters such as the artist name, product
 * name, edition, and image name.
 */
export const uploadImage = async (
  buffer,
  name,
  artistName,
  edition,
  productName
) => {
  const vers = edition ? `${edition}_` : "";
  const key = `${artistName}/${productName}/shopify/${vers}${name}`;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "image/jpeg",
  };
  const command = new PutObjectCommand(uploadParams);
  await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return url.replace(/ /g, "+");
};
/**
 * The function `uploadFileFromUrl` uploads a file from a given URL to an AWS S3 bucket with specified
 * parameters.
 * @param fileUrl - The `fileUrl` parameter is the URL of the file you want to upload to an AWS S3
 * bucket.
 * @param artistName - The `artistName` parameter refers to the name of the artist associated with the
 * file being uploaded.
 * @param fileName - The `fileName` parameter refers to the name of the file that will be used for
 * uploading. It is a string value that represents the name of the file to be uploaded to the specified
 * AWS S3 bucket.
 * @param productName - The `productName` parameter in the `uploadFileFromUrl` function refers to the
 * name of the product for which the file is being uploaded. It is used to construct the key under
 * which the file will be stored in the AWS S3 bucket.
 * @returns The function `uploadFileFromUrl` returns a URL string that points to the uploaded file in
 * an AWS S3 bucket.
 */
export const uploadFileFromUrl = async (
  fileUrl,
  artistName,
  fileName,
  productName
) => {
  const response = await fetch(fileUrl);
  const file = await streamToBuffer(response.body);
  const key = artistName + "/" + productName + "/" + fileName;
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: "image/jpg",
  };
  const command = new PutObjectCommand(uploadParams);
  const result = await client.send(command);
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  return url.replace(/ /g, "+");
};
