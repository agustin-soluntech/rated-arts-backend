import { Editions } from "../models/Editions.js";
import { Size } from "../models/Size.js";
import { Products } from "../models/Products.js";
import { Artist } from "../models/Artist.js";
import { framesDetails, framings } from "../utils/constants.js";
import { downloadFile, uploadFile, uploadImage } from "../utils/uploadFile.js";
import { Op } from "sequelize";
import sharp from "sharp";
import { upscaleImage } from "../utils/upscale.js";
import {
  createImageShopifyProduct,
  createShopifyProduct,
  groupVariants,
} from "../utils/shopify.js";
import { Variants } from "../models/Variants.js";
import { ProductImages } from "../models/ProductImages.js";

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

async function processAndFramePhoto(
  file,
  artist,
  edition,
  frameDetails,
  productName
) {
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

async function createVariantsImages(file, artist, editions, productName) {
  const variantsImages = {};
  for (let edition of editions) {
    for (let frame of framings) {
      const frameDetails = framesDetails[edition.display][frame];
      variantsImages[`${edition.display}-${frame}`] =
        await processAndFramePhoto(
          file,
          artist,
          edition.display + frame,
          frameDetails,
          productName
        );
    }
  }
  return variantsImages;
}

async function createImagesToPrint(imageUrl, imageWidth, product, sizes, artistName) {
  const upscaledImages = await upscaleImage(
    imageUrl,
    imageWidth,
    sizes,
    product.title,
    artistName
  );
  for (let size of sizes) {
    await ProductImages.create({
      product_id: product.id,
      size_id: size.id,
      image_url: upscaledImages[size.id],
    });
  }
}

export const createProducts = async (req, res) => {
  try {
    const artist = await Artist.findOne({ where: { id: req.body.artist } });
    const productsCount = await Products.count({
      where: { artist_id: data.artist },
    });

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

    const upload = await uploadFile(
      req.files.image,
      req.body.title,
      artist.dataValues.full_name
    );

    const shopifyProduct = await createShopifyProduct(
      req.body,
      upload,
      artist.dataValues.full_name,
      editions,
      sizes,
      productsCount
    );

    const product = await Sequelize.transaction(async (transaction) => {
      const product = await Products.create(
        {
          id: shopifyProduct.id,
          title: req.body.title,
          description: req.body.description,
          image_url: upload,
          price: req.body.price,
          quantity: 1000,
          artist_id: req.body.artist.id,
        },
        { transaction }
      );
      const variants = await Variants.bulkCreate(
        product.variants.map((variant) => {
          return {
            id: variant.id,
            title: variant.title,
            product_id: product.id,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3,
            price: variant.price,
            sku: variant.sku,
            inventory_quantity: variant.inventory_quantity,
            edition_id: editions.find(
              (edition) => edition.display === variant.option1
            ).id,
            size_id: sizes.find((size) => size.display === variant.option2).id,
            created_at: variant.created_at,
            updated_at: variant.updated_at,
          };
        }),
        { transaction }
      );
      return product;
    });
    const variantsImages = await createVariantsImages(
      req.files.image,
      artist,
      editions,
      req.body.title
    );
    const groupedVariants = groupVariants(shopifyProduct.variants);
    for (let key in groupedVariants) {
      const variants = groupedVariants[key].map((variant) => variant.id);
      await createImageShopifyProduct(
        shopifyProduct.id,
        variantsImages[key],
        variants
      );
    }

    createImagesToPrint(
      upload,
      parseInt(req.body.width),
      product,
      sizes,
      artist.dataValues.full_name
    );

    res.status(201).json(shopifyProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getImageUrlToPrint = async (req, res) => {
  try {
    const productImage = await ProductImages.findOne({
      where: { product_id: req.params.product_id, size_id: req.params.size_id },
    });
    res.sendFile(productImage.image_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
