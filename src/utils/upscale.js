import { uploadFileFromUrl } from "./uploadFile.js";
import axios from "axios";
import FormData from "form-data";

/**
 * The upscaleImage function processes and uploads images based on specified sizes and parameters.
 * @param imageUrl - The `imageUrl` parameter is the URL of the image that you want to upscale.
 * @param imageWidth - The `imageWidth` parameter in the `upscaleImage` function represents the width
 * of the original image that you want to upscale. This value is used to determine if the image needs
 * to be upscaled or if the provided sizes are already larger than the original image.
 * @param sizes - The `sizes` parameter in the `upscaleImage` function represents an array of objects
 * that contain information about different image sizes. Each object in the `sizes` array should have
 * the following properties:
 * @param productName - The `productName` parameter in the `upscaleImage` function is a string that
 * represents the name of the product associated with the image being processed. It is used within the
 * function to help with image processing and uploading tasks.
 * @param artistName - The `artistName` parameter in the `upscaleImage` function refers to the name of
 * the artist associated with the image. It is used within the function to process and upload the image
 * accordingly.
 * @returns The function `upscaleImage` returns an array `imagesUrl` containing URLs of the upscaled
 * and reduced images for each size specified in the input `sizes` array.
 */
export const upscaleImage = async (
  imageUrl,
  imageWidth,
  sizes,
  productName,
  artistName
) => {
  let imagesUrl = [];
  // order the size from largest to smallest
  const orderedSizes = sizes.sort((a, b) => b.width - a.width);
  if (orderedSizes[0].width <= imageWidth) {
    for (let size of orderedSizes) {
      imagesUrl[size.id] = await reduceAndUploadImage(
        imageUrl,
        artistName,
        imageWidth,
        size,
        productName
      );
    }
  } else {
    const data = new FormData();
    data.append("image_url", imageUrl);
    data.append("upscale_factor", orderedSizes[0].width / parseInt(imageWidth));
    data.append("mode", "sync");
    data.append("format", "JPG");
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.PICSART_URL}/upscale/ultra`,
      headers: {
        "content-Type": "multipart/form-data",
        "x-picsart-api-key": process.env.X_PICSART_API_KEY,
        ...data.getHeaders(),
      },
      data: data,
    };
    const response = await axios.request(config);
    for (let size of orderedSizes) {
      imagesUrl[size.id] = await reduceAndUploadImage(
        response.data.data.url,
        artistName,
        orderedSizes[0].width,
        size,
        productName
      );
    }
  }
  return imagesUrl;
};

/**
 * The function `reduceAndUploadImage` resizes an image if its width is less than a specified value and
 * then uploads it.
 * @param imageUrl - The `imageUrl` parameter is the URL of the image that needs to be reduced and
 * uploaded.
 * @param artistName - The `artistName` parameter is a string that represents the name of the artist
 * who created the image.
 * @param width - The `width` parameter in the `reduceAndUploadImage` function represents the desired
 * width that the image should be resized to. If the width of the image is less than this specified
 * width, the function will resize the image.
 * @param size - The `size` parameter in the `reduceAndUploadImage` function seems to be an object with
 * properties `width` and `display`. The `width` property is used for comparison in the `if` condition,
 * and the `display` property is used to generate the file name for the uploaded
 * @param productName - The `productName` parameter in the `reduceAndUploadImage` function represents
 * the name of the product associated with the image being processed. It is used when uploading the
 * image file to specify the name of the file.
 * @returns The function `reduceAndUploadImage` is returning the result of the `uploadFileFromUrl`
 * function, which is being awaited.
 */
const reduceAndUploadImage = async (
  imageUrl,
  artistName,
  width,
  size,
  productName
) => {
  if (size.width < width) {
    const form = new FormData();
    form.append("image_url", imageUrl);
    form.append("width", size.width);
    form.append("mode", "resize");
    form.append("format", "JPG");
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${process.env.PICSART_URL}/edit`,
      headers: {
        "content-Type": "multipart/form-data",
        "x-picsart-api-key": process.env.X_PICSART_API_KEY,
        ...form.getHeaders(),
      },
      data: form,
    };
    const response = await axios.request(config);
    imageUrl = response.data.data.url;
  }
  return await uploadFileFromUrl(
    imageUrl,
    artistName,
    size.display.replace(/\s+/g, "") + ".jpg",
    productName
  );
};
