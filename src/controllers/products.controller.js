import { Editions } from "../models/Editions.js";
import { Size } from "../models/Size.js";
import { Products } from "../models/Products.js";
import { Artist } from "../models/Artist.js";
import { framings } from "../utils/constants.js";
import uploadFile from "../utils/uploadFile.js";
import { Op } from "sequelize";
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
          option1: edition,
          option2: size,
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
  }

  return response.json().body.product;
};

const createImageShopifyProduct = async (productId, imageUrl, variants) => {
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

  return response.json();
};

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
  const upload = await uploadFile(req.files.image, artist.dataValues.full_name);
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
    image_url: req.body.imageUrl,
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
    variants = groupedVariants[key].map((variant) => variant.id);
    const newImage = ""; //generate image
    await createImageShopifyProduct(shopifyProduct.id, imageUrl, variants);
  }

  res.send(shopifyProduct);
};