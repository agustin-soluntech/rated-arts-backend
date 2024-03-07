import { framings } from "../utils/constants.js";
import fetch from "node-fetch";

const createVariants = (
  productsCount,
  editions,
  sizes,
  artistName,
  price
) => {
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

export const createShopifyProduct = async (
  data,
  imageUrl,
  artistName,
  editions,
  sizes,
  productsCount,
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

export const groupVariants = (variants) => {
  return variants.reduce((grouped, variant) => {
    const key = `${variant.option1}-${variant.option3}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(variant);
    return grouped;
  }, {});
}

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
    return parsedResponse;
  } catch (error) {
    console.log(error);
  }
}