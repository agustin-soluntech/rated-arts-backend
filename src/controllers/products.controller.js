import { Editions } from "../models/Editions.js";
import { Sizes } from "../models/Sizes.js";
import { Products } from "../models/Products.js";
import { Artists } from "../models/Artists.js";
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
import { sequelize } from "../database/database.js";

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

/**
 * The function `createVariantsImages` generates variant images for different editions and framings of
 * a product using provided file, artist, editions, and product name.
 * @param file - The `file` parameter is the image file that will be processed and framed to create
 * variants images.
 * @param artist - The `artist` parameter in the `createVariantsImages` function represents the artist
 * who created the artwork for which variants images are being generated.
 * @param editions - It looks like you forgot to provide the `editions` parameter in your message.
 * Could you please provide the details for the `editions` parameter so I can assist you further with
 * the `createVariantsImages` function?
 * @param productName - productName is a string representing the name of the product for which variants
 * images are being created.
 * @returns The function `createVariantsImages` is returning an object `variantsImages` that contains
 * processed and framed photos for each combination of edition and frame. The keys of the object are in
 * the format `${edition.display}-` and the values are the result of processing and framing the
 * photo using the `processAndFramePhoto` function.
 */
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

async function createImagesToPrint(
  imageUrl,
  imageWidth,
  product,
  sizes,
  artistName
) {
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

/**
 * The function `createProductAndVariants` creates a product and its variants in a Shopify store using
 * provided data and images.
 * @param shopifyProduct - The `shopifyProduct` parameter in the `createProductAndVariants` function
 * likely represents a product object retrieved from a Shopify store. It contains information about a
 * specific product, such as its ID, title, description, images, variants, vendor, and other details.
 * This object is used as
 * @param transaction - The `transaction` parameter in the `createProductAndVariants` function is used
 * to ensure that all database operations within the function are executed as part of a single
 * transaction. This helps maintain data integrity by ensuring that either all operations are
 * successfully completed or none of them are committed to the database.
 * @param body - The `body` parameter in the `createProductAndVariants` function represents an object
 * containing additional information about the product being created. It may include properties like
 * `title`, `description`, and `price` that can be used to override the corresponding values from the
 * `shopifyProduct` object.
 * @param imageUrl - The `imageUrl` parameter in the `createProductAndVariants` function is used to
 * specify the image URL for the product being created. This URL will be used as the image for the
 * product in the database. If the `imageUrl` parameter is provided, it will be used as the image URL
 * @returns The function `createProductAndVariants` returns the newly created product as a plain
 * JavaScript object.
 */
export const createProductAndVariants = async (
  shopifyProduct,
  transaction,
  body,
  imageUrl
) => {
  const editions = await Editions.findAll({
    raw: true,
  });
  const sizes = await Sizes.findAll({
    raw: true,
  });
  let artist = await Artists.findOne({
    where: { full_name: shopifyProduct.vendor },
    raw: true,
  });
  if (!artist && shopifyProduct.vendor && shopifyProduct.vendor !== "") {
    artist = await Artists.create(
      { full_name: shopifyProduct.vendor },
      { transaction }
    );
  }
  const product = await Products.create(
    {
      id: shopifyProduct.id,
      title: body?.title ?? shopifyProduct.title,
      description: body?.description ?? shopifyProduct.body_html,
      image_url: imageUrl ?? shopifyProduct.images[0].src ?? "",
      price: body?.price ?? shopifyProduct.variants[0].price,
      quantity: 1000,
      artist_id: artist.id,
    },
    { transaction }
  );
  const variants = await Variants.bulkCreate(
    shopifyProduct.variants.map((variant) => {
      return {
        id: variant.id,
        title: variant.title,
        product_id: product.id,
        option1: variant.option1,
        option2: variant.option2.replace(/"/g, ""),
        option3: variant.option3,
        price: variant.price,
        sku: variant.sku,
        inventory_quantity: variant.inventory_quantity,
        edition_id: editions.find(
          (edition) => edition.display === variant.option1
        ).id,
        size_id: sizes.find(
          (size) => size.display === variant.option2.replace(/"/g, "")
        ).id,
        created_at: variant.created_at,
        updated_at: variant.updated_at,
      };
    }),
    { transaction }
  );
  return product.get({ plain: true });
};

/**
 * The function `findMissingProducts` filters out products that do not exist in the database based on
 * their IDs.
 * @param products - The `findMissingProducts` function takes an array of product IDs as input and then
 * queries the database to find the existing products based on those IDs. It then returns an array of
 * product IDs that are missing from the database.
 * @returns An array of product IDs that are missing from the database.
 */
export const findMissingProducts = async (products) => {
  const existingProducts = await Products.findAll({
    where: { id: { [Op.in]: products } },
    raw: true,
  });
  const existingProductsIds = existingProducts.map((product) => product.id);
  return products.filter((product) => !existingProductsIds.includes(product));
};

export const createProducts = async (req, res) => {
  try {
    const artist = await Artists.findOne({ where: { id: req.body.artist } });
    const productsCount = await Products.count({
      where: { artist_id: req.body.artist },
    });

    const editionIds = req.body.editions.split(",");
    const editions = await Editions.findAll({
      where: { id: { [Op.in]: editionIds } },
      raw: true,
    });

    const sizeIds = req.body.sizes.split(",");
    const sizes = await Sizes.findAll({
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

    const product = await sequelize.transaction(async (transaction) => {
      return await createProductAndVariants(
        shopifyProduct,
        transaction,
        req.body,
        upload
      );
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
    res.status(200).json(productImage.get({ plain: true }).image_url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
