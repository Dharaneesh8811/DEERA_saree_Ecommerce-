"use client";

import { useEffect, useState } from "react";

import { getCategories } from "@/services/categoryService";
import { getProductImages } from "@/services/productImageService";
import { getProducts } from "@/services/productService";

let catalogCache = null;
let catalogRequest = null;

const imageRequests = new Map();
const IMAGE_REQUEST_BATCH_SIZE = 6;

function getCatalogErrorMessage(error) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your session has expired. Please refresh and try again.";
  }

  if (status === 403) {
    return "You do not have permission to view these products.";
  }

  if (status === 404) {
    return "The product catalog could not be found.";
  }

  if (error.request && !error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  if (status >= 500) {
    return "The catalog could not be loaded. Please try again.";
  }

  return "Unable to load products. Please try again.";
}

function normalizeProduct(product, categoryById) {
  const categoryId = product.category_id
    ? String(product.category_id)
    : "";

  const category = categoryById.get(categoryId);

  const badge = product.is_editor_pick
    ? "Editor's Pick"
    : product.is_best_seller
      ? "Bestseller"
      : product.is_new_arrival
        ? "New Arrival"
        : null;

  return {
    ...product,

    id: product.id,

    name: product.name,

    /*
     * Category ID used throughout the storefront.
     */
    categoryId,

    category: category?.name || "Unknown category",

    image: null,

    sellingPrice:
      product.price == null
        ? null
        : Number(product.price),

    mrp:
      product.mrp == null
        ? null
        : Number(product.mrp),

    discountPercentage:
      product.discount_percentage == null
        ? null
        : Number(product.discount_percentage),

    occasion: product.occasion || "",

    fabricWeight: product.fabric_weight || "",

    borderStyle: product.border_style || "",

    badge,
  };
}

function getStorefrontCatalog() {
  if (catalogCache) {
    return Promise.resolve(catalogCache);
  }

  if (catalogRequest) {
    return catalogRequest;
  }

  catalogRequest = Promise.allSettled([
    getProducts(),
    getCategories(),
  ])
    .then(([productsResult, categoriesResult]) => {
      if (productsResult.status === "rejected") {
        throw productsResult.reason;
      }

      const rawProducts = Array.isArray(productsResult.value)
        ? productsResult.value
        : [];

      const rawCategories =
        categoriesResult.status === "fulfilled" &&
        Array.isArray(categoriesResult.value)
          ? categoriesResult.value
          : [];

      /*
       * Convert category IDs to strings so the comparison
       * works consistently.
       */
      const categoryById = new Map(
        rawCategories.map((category) => [
          String(category.id),
          category,
        ])
      );

      catalogCache = {
        products: rawProducts
          .filter((product) => product.is_active === true)
          .map((product) =>
            normalizeProduct(product, categoryById)
          ),

        categories: rawCategories.filter(
          (category) => category.is_active === true
        ),

        categoryError:
          categoriesResult.status === "rejected"
            ? "Categories could not be loaded. Product category names may be unavailable."
            : "",
      };

      return catalogCache;
    })
    .catch((error) => {
      catalogRequest = null;
      throw error;
    });

  return catalogRequest;
}

function getCardImage(productId) {
  if (!imageRequests.has(productId)) {
    imageRequests.set(
      productId,
      getProductImages(productId)
        .then((images) => {
          if (!Array.isArray(images) || images.length === 0) {
            imageRequests.delete(productId);
            return null;
          }

          const firstImage =
            images.find((image) => image.is_primary) ||
            images[0];

          return firstImage?.image_url || null;
        })
        .catch(() => {
          imageRequests.delete(productId);
          return null;
        })
    );
  }

  return imageRequests.get(productId);
}

async function loadCardImages(products) {
  const imageByProductId = new Map();

  for (
    let index = 0;
    index < products.length;
    index += IMAGE_REQUEST_BATCH_SIZE
  ) {
    const batch = products.slice(
      index,
      index + IMAGE_REQUEST_BATCH_SIZE
    );

    const batchImages = await Promise.all(
      batch.map(async (product) => [
        product.id,
        await getCardImage(product.id),
      ])
    );

    for (const [productId, imageUrl] of batchImages) {
      imageByProductId.set(productId, imageUrl);
    }
  }

  return imageByProductId;
}

export default function useStorefrontCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getStorefrontCatalog()
      .then((catalog) => {
        if (!isCurrent) return;

        setProducts(catalog.products);
        setCategories(catalog.categories);
        setCategoryError(catalog.categoryError);
        setLoading(false);

        loadCardImages(catalog.products).then(
          (imageByProductId) => {
            if (!isCurrent) return;

            setProducts((currentProducts) =>
              currentProducts.map((product) => ({
                ...product,
                image:
                  imageByProductId.get(product.id) ||
                  null,
              }))
            );

            if (catalogCache) {
              catalogCache = {
                ...catalogCache,

                products: catalogCache.products.map(
                  (product) => ({
                    ...product,
                    image:
                      imageByProductId.get(product.id) ||
                      null,
                  })
                ),
              };
            }
          }
        );
      })
      .catch((requestError) => {
        if (!isCurrent) return;

        setError(
          getCatalogErrorMessage(requestError)
        );

        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    categoryError,
  };
}