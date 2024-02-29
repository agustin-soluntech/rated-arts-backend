import { Editions } from "../models/Editions.js";
import { Size } from "../models/Size.js";
import { Products } from "../models/Products.js";
import { Artist } from "../models/Artist.js";
import { framesDetails, framings } from "../utils/constants.js";
import { downloadFile, uploadFile, uploadImage } from "../utils/uploadFile.js";
import { Op } from "sequelize";
import sharp from "sharp";
import { upscaleImage } from "../utils/upscale.js";

const createVariants = (productsCount, editions, sizes, artistName, price) => {
  function createSKU(artistName, edition, size, frame, count) {
    const initials = artistName
      .split(" ")
      .slice(0, 2)
      .map((e) => e[0].toUpperCase())
      .join("");
    const mid =
      edition.substring(0, 2).toUpperCase() +
      size.match(/\d+/g).join("") +
      frame.substring(0, 2).toUpperCase();
    return initials + "-" + mid + "-" + (count + 1);
  }
  const variants = [];

  editions.forEach((edition) => {
    sizes.forEach((size) => {
      framings.forEach((framing) => {
        variants.push({
          option1: edition.display,
          option2: size.display,
          option3: framing,
          price: price,
          sku: createSKU(
            artistName,
            edition.display,
            size.display,
            framing,
            productsCount
          ),
          inventory_management: "shopify",
          inventory_quantity: 1000,
          taxable: true,
        });
      });
    });
  });

  return variants;
};

const createShopifyProduct = async (
  data,
  imageUrl,
  artistName,
  editions,
  sizes
) => {
  const productsCount = await Products.count({
    where: { ArtistId: data.artist },
  });
  const shopifyProduct = {
    product: {
      title: data.title,
      body_html: data.description,
      vendor: artistName,
      template_suffix: 4,
      variants: createVariants(
        productsCount,
        editions,
        sizes,
        artistName,
        data.price
      ),
      options: [
        {
          name: "Edition",
          values: editions.map((edition) => edition.display),
        },
        {
          name: "Print Size",
          values: sizes.map((size) => size.display),
        },
        {
          name: "Framing",
          values: framings,
        },
      ],
      images: [
        {
          src: imageUrl,
          variant_ids: [],
          filename: imageUrl,
        },
      ],
    },
  };
  try {
    const response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify(shopifyProduct),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.message}`
      );
    } else {
      const createdProduct = await response.json();
      return createdProduct.product;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const createImageShopifyProduct = async (productId, imageUrl, variants) => {
  try {
    const response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-10/products/${productId}/images.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          image: {
            src: imageUrl,
            variant_ids: variants,
            filename: productId + ".jpg",
          },
        }),
      }
    );

    const imageRes = await response.json();
    return imageRes;
  } catch (error) {
    console.error("Error:", error);
  }
};

async function createFramedPhoto(file, frame, frameDetails) {
  const resizedPhotoBuffer = await sharp(file.tempFilePath)
    .resize(frameDetails.width, frameDetails.height, { fit: "fill" })
    .toBuffer();

  return sharp(frame)
    .composite([
      {
        input: resizedPhotoBuffer,
        left: frameDetails.x, // X coordinate of the transparent area
        top: frameDetails.y, // Y coordinate of the transparent area
        //gravity: 'center',
      },
    ])
    .toBuffer();
}

async function processAndFramePhoto(file, artist, edition, frameDetails, productName) {
  try {
    const frame = await downloadFile(`bg/${edition}.png`);
    const framedPhotoBuffer = await createFramedPhoto(
      file,
      frame,
      frameDetails
    );

    return await uploadImage(
      framedPhotoBuffer,
      file.name,
      artist.dataValues.full_name,
      edition,
      productName
    );
  } catch (err) {
    console.error("Error processing photo:", err);
  }
}

export const createProducts = async (req, res) => {
  const artist = await Artist.findOne({ where: { id: req.body.artist } });

  const editionIds = req.body.editions.split(",");
  const editions = await Editions.findAll({
    where: { id: { [Op.in]: editionIds } },
    raw: true,
  });

  const sizeIds = req.body.sizes.split(",");
  const sizes = await Size.findAll({
    where: { id: { [Op.in]: sizeIds } },
    raw: true,
  });

  const upload = await uploadFile(req.files.image, req.body.title, artist.dataValues.full_name);
  const upscaledImages = await upscaleImage(
    upload,
    parseInt(req.body.width),
    sizes,
    req.body.title,
    artist.dataValues.full_name
  );

  const variantsImages = {};
  for (let edition of editions) {
    for (let frame of framings) {
      const frameDetails = framesDetails[frame];
      variantsImages[`${edition.display}-${frame}`] =
        await processAndFramePhoto(
          req.files.image,
          artist,
          edition.display + frame,
          frameDetails,
          req.body.title
        );
    }
  }

  const shopifyProduct = await createShopifyProduct(
    req.body,
    upload,
    artist.dataValues.full_name,
    editions,
    sizes
  );
  await Products.create({
    title: req.body.title,
    description: req.body.description,
    image_url: upload,
    price: req.body.price,
    quantity: 1000,
    artistId: req.body.artist.id,
    product_id: shopifyProduct.id,
  });

  const groupedVariants = shopifyProduct.variants.reduce((grouped, variant) => {
    const key = `${variant.option1}-${variant.option3}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(variant);
    return grouped;
  }, {});

  for (let key in groupedVariants) {
    const variants = groupedVariants[key].map((variant) => variant.id);
    await createImageShopifyProduct(
      shopifyProduct.id,
      variantsImages[key],
      variants
    );
  }

  res.send(shopifyProduct);
};
