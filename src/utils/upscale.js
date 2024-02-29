import { uploadFileFromUrl } from "./uploadFile.js";
import axios from "axios";
import FormData from "form-data";

export const upscaleImage = async (imageUrl, imageWidth, sizes, productName, artistName) => {
  let imagesUrl = [];
  // order the size from largest to smallest
  const orderedSizes = sizes.sort((a, b) => b.width - a.width);
  if (orderedSizes[0].width <= imageWidth) {
    for (let size of orderedSizes) {
      imagesUrl.push(
        await reduceAndUploadImage(imageUrl, artistName, imageWidth, size, productName)
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
      imagesUrl.push(
        await reduceAndUploadImage(
          response.data.data.url,
          artistName,
          orderedSizes[0].width,
          size,
          productName
        )
      );
    }
  }
  return imagesUrl;
};

const reduceAndUploadImage = async (imageUrl, artistName, width, size, productName) => {
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
  await uploadFileFromUrl(imageUrl, artistName, size.display.replace(/\s+/g, '')+'.jpg', productName);
};
