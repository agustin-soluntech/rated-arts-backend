import { Editions } from "../models/Editions.js";
import { Sizes } from "../models/Sizes.js";
import { Products } from "../models/Products.js";
import { Artists } from "../models/Artists.js";
import { framings } from "../utils/constants.js";

const createVariants = (data, productsCount) => {
  function createSKU(artist, edition, size, frame, count) {
    const initials = artist
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

  data.editions.forEach((edition) => {
    data.sizes.forEach((size) => {
      framings.forEach((framing) => {
        variants.push({
          option1: edition,
          option2: size,
          option3: framing,
          price: price,
          sku: createSKU(data.artist, edition, size, framing, productsCount),
          inventory_management: "shopify",
          inventory_quantity: 1000,
          taxable: true,
        });
      });
    });
  });

  return variants;
};

const createShopifyProduct = async (data) => {
  const productsCount = await Products.count({where: {artistId: data.artist.id}});
  const shopifyProduct = {
    product: {
      title: data.title,
      body_html: data.description,
      vendor: data.artist.full_name,
      template_suffix: 4,
      variants: createVariants(data, productsCount),
      options: [
        {
          name: "Edition",
          values: data.editions.map((edition) => edition.name),
        },
        {
          name: "Print Size",
          values: data.sizes.map((size) => size.display),
        },
        {
          name: "Framing",
          values: framings,
        },
      ],
      images: [
        {
          src: data.imageUrl,
          variant_ids: [],
          filename: data.imageUrl,
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
  const shopifyProduct = await createShopifyProduct(req.body);
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
    const newImage = '' //generate image
    await createImageShopifyProduct(shopifyProduct.id, imageUrl, variants);
  }

  res.send(shopifyProduct);
};
