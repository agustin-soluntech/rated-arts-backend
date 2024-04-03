import { framings } from "../utils/constants.js";
import fetch from "node-fetch";

/**
 * The function `createVariants` generates product variants with unique SKUs based on specified
 * editions, sizes, and artist information.
 * @param productsCount - Products count is the total number of products available for sale.
 * @param editions - Editions refer to different versions or variations of a product, such as limited
 * edition, special edition, etc. In the `createVariants` function, the `editions` parameter is an
 * array containing objects that represent different editions of the product. Each object in the
 * `editions` array should
 * @param sizes - It seems like you forgot to provide the `sizes` parameter in your function call.
 * Could you please provide the `sizes` parameter so that I can assist you further with creating the
 * variants?
 * @param artistName - artistName is the name of the artist who created the products.
 * @param price - The `price` parameter in the `createVariants` function represents the price of the
 * product. This price will be assigned to each variant created based on the combinations of editions,
 * sizes, and framings.
 * @returns An array of variant objects is being returned. Each variant object contains the following
 * properties: option1 (edition display), option2 (size display), option3 (framing), price, sku,
 * inventory_management, inventory_quantity, and taxable.
 */
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

/**
 * The function `createShopifyProduct` creates a new product on Shopify with specified data, image,
 * artist name, editions, sizes, and product count.
 * @param data - The `data` parameter in the `createShopifyProduct` function likely contains
 * information about the product being created, such as its title, description, and price. It seems to
 * be an object with properties like `title`, `description`, and `price`. This data is used to populate
 * the Shopify
 * @param imageUrl - The `imageUrl` parameter in the `createShopifyProduct` function is the URL of the
 * image associated with the product being created in Shopify. This image will be displayed on the
 * product page in the Shopify store.
 * @param artistName - The `artistName` parameter in the `createShopifyProduct` function refers to the
 * name of the artist associated with the product being created in the Shopify store. This information
 * is used to set the vendor field in the Shopify product details. It helps in categorizing and
 * attributing the product to the
 * @param editions - Editions refer to different versions or variations of the product being created.
 * In the context of the `createShopifyProduct` function, editions are likely different versions or
 * variations of the artwork being sold. Each edition may have unique characteristics or features that
 * distinguish it from other editions.
 * @param sizes - Sizes is an array that contains objects representing different print sizes available
 * for the product. Each object typically includes properties like `display` (the size label shown to
 * customers) and `value` (the actual size value used in calculations).
 * @param productsCount - The `productsCount` parameter in the `createShopifyProduct` function
 * represents the number of products you want to create in Shopify. This value is used in the function
 * to determine how many variants of the product to create based on the provided editions, sizes, and
 * other details. It helps in generating
 * @returns The `createShopifyProduct` function returns the created product object from Shopify if the
 * request is successful. If there is an error during the process, it catches the error and logs it to
 * the console.
 */
export const createShopifyProduct = async (
  data,
  imageUrl,
  artistName,
  editions,
  sizes,
  productsCount
) => {
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

/**
 * The function `createImageShopifyProduct` sends a POST request to Shopify's API to create an image
 * for a specific product with the provided image URL, variants, and product ID.
 * @param productId - The `productId` parameter in the `createImageShopifyProduct` function is the
 * unique identifier of the Shopify product to which you want to add an image. It is used to specify
 * the product to which the image will be associated.
 * @param imageUrl - The `imageUrl` parameter in the `createImageShopifyProduct` function represents
 * the URL of the image you want to associate with the Shopify product. This image will be uploaded to
 * Shopify and linked to the specified product.
 * @param variants - The `variants` parameter in the `createImageShopifyProduct` function is an array
 * that contains the variant IDs of the product in Shopify to which the image should be associated.
 * Each variant ID corresponds to a specific variant of the product, allowing you to link the image to
 * multiple variants if needed.
 * @returns The function `createImageShopifyProduct` is returning the response from the Shopify API
 * after creating an image for a specific product.
 */
export const createImageShopifyProduct = async (
  productId,
  imageUrl,
  variants
) => {
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

/**
 * The function `groupVariants` takes an array of variants and groups them based on a combination of
 * two options, returning an object with the grouped variants.
 * @param variants - An array of variant objects, where each variant object contains information about
 * different options such as option1, option2, option3, etc.
 * @returns The `groupVariants` function is returning an object where the keys are a combination of
 * `option1` and `option3` from each variant, and the values are arrays of variants that share the same
 * combination of `option1` and `option3`.
 */
export const groupVariants = (variants) => {
  return variants.reduce((grouped, variant) => {
    const key = `${variant.option1}-${variant.option3}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(variant);
    return grouped;
  }, {});
};

/**
 * This function retrieves an order by its ID from a Shopify store using the Shopify API.
 * @param id - The `id` parameter in the `getOrderById` function represents the unique identifier of
 * the order you want to retrieve from the Shopify store. This function fetches the order details from
 * the Shopify API based on the provided `id`.
 * @returns The `getOrderById` function is returning the parsed response data from the Shopify API
 * call.
 */
export const getOrderById = async (id) => {
  try {
    let response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/orders/${id}.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    const parsedResponse = await response.json();
    return parsedResponse;
  } catch (error) {
    console.log(error);
  }
};

/**
 * The function `getOrders` fetches order data from a Shopify API, processes and maps the data, and
 * returns an array of formatted order objects.
 * @returns The `getOrders` function is returning an array of mapped order objects. Each order object
 * contains details such as id, date, total price, line items (with details like title, quantity,
 * price, size, type, frames, itemId, sku), and customer information (name, phone, address, city,
 * province, zip, country). The function logs the first mapped order object to the console
 */
export const getOrders = async () => {
  try {
    let response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/orders.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    const parsedResponse = await response.json();

    const ordersId = parsedResponse.orders.map((order) => {
      return order.id;
    });

    let responseOrderDetails = await Promise.all(
      ordersId.map((id) =>
        fetch(
          `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/orders/${id}.json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
          }
        )
      )
    );

    const parsedResponseOrderDetails = await Promise.all(
      responseOrderDetails.map((res) => res.json())
    );

    const mappedOrders = parsedResponseOrderDetails.map((order) => {
      return {
        id: order.order.id ?? "",
        date: order.order.created_at
          ? moment(order.order.created_at).format("MMM D [at] h:mm a")
          : "",
        total: order.order.total_price ?? 0,
        lineItems: order.order.line_items
          ? order.order.line_items.map((item) => {
              const parts = item.name.split(" - ");
              const name = parts[0];
              const [type, size, frames] = parts[1].split(" / ");
              return {
                title: name ?? "",
                quantity: item.quantity ?? "",
                price: item.price ?? "",
                size: size ?? "",
                type: type ?? "",
                frames: frames ?? "",
                itemId: item.id ?? "",
                sku: item.sku ?? "",
              };
            })
          : [],
        customerInfo: order.order.billing_address
          ? {
              name: order.order.billing_address.name ?? "",
              phone: order.order.billing_address.phone ?? "",
              address: order.order.billing_address.address1 ?? "",
              city: order.order.billing_address.city ?? "",
              province: order.order.billing_address.province ?? "",
              zip: order.order.billing_address.zip ?? "",
              country: order.order.billing_address.country ?? "",
            }
          : {},
      };
    });
    console.log(mappedOrders[0]);
    return mappedOrders;
  } catch (error) {
    console.log(error);
  }
};

/**
 * This function fetches a product by its ID from a Shopify store using the Shopify API.
 * @param id - The `id` parameter in the `getProductById` function represents the unique identifier of
 * the product you want to retrieve from the Shopify store. This function fetches product data from the
 * Shopify API based on this specific product ID.
 * @returns The `getProductById` function is returning the `product` object from the parsed response.
 */
export const getProductById = async (id) => {
  try {
    let response = await fetch(
      `${process.env.SHOPIFY_API_URL}/admin/api/2023-04/products/${id}.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
      }
    );
    const parsedResponse = await response.json();
    return parsedResponse.product;
  } catch (error) {
    console.log(error);
  }
};
