const upscaleImage = async (imageUrl, imageWidth, sizes, artistName) => {
  let imagesUrl = [];
  // order the size from largest to smallest
  const orderedSizes = sizes.sort((a, b) => b.width - a.width);
  if (orderedSizes[0].width < imageWidth) {
    //reduce the image
    let response = await fetch(`${process.env.PICSART_URL}/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        "x-picsart-api-key": process.env.X_PICSART_API_KEY,
      },
    });
    const parsedResponse = await response.json();
    // push the url to imagesUrl
  } else {
    const upscale_factor = orderedSizes[0].width / imageWidth;
    const image_url = imageUrl;
    const mode = "async";
    let response = await fetch(`${process.env.PICSART_URL}/upscale/ultra`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        "x-picsart-api-key": process.env.X_PICSART_API_KEY,
      },
    });
    //take the upscaled imaage by the transcation_id
    //upload the url to s3
  }
};
