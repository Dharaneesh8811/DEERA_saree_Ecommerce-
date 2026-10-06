"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck, MessageCircle } from "lucide-react";
import { useParams } from "next/navigation";

import ProductGallery from "@/components/product/ProductGallery";
import ProductOptions from "@/components/product/ProductOptions";
import ProductReviews from "@/components/product/ProductReviews";
import ProductWhatsAppButton from "@/components/product/ProductWhatsAppButton";
import ProductShare from "@/components/product/ProductShare";
import RecommendedProducts from "@/components/product/RecommendedProducts";
import RecentlyViewed from "@/components/product/RecentlyViewed";

import { getCategories } from "@/services/categoryService";
import { getProduct, getProducts } from "@/services/productService";
import { getProductImages } from "@/services/productImageService";
import { getProductVariants } from "@/services/productVariantService";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";

function getProductPageError(error) {
  if (error.code === "COLLECTION_NOT_FOUND") {
    return "Collection not found.";
  }

  if (error.code === "PRODUCT_NOT_FOUND") {
    return "Product not found.";
  }

  const status = error.response?.status;

  if (status === 401) {
    return "Your session has expired. Please refresh and try again.";
  }

  if (status === 403) {
    return "You do not have permission to view this product.";
  }

  if (status === 404) {
    return "Product not found.";
  }

  if (status === 422) {
    return "This product link is invalid.";
  }

  if (error.request && !error.response) {
    return "Unable to connect to the server. Please try again.";
  }

  if (status >= 500) {
    return "The product could not be loaded. Please try again.";
  }

  return "Unable to load this product. Please try again.";
}

function normalizeProduct(product, category, images, variants) {
  const sellingPrice = Number(product.price);

  const mrp =
    product.mrp == null
      ? null
      : Number(product.mrp);

  const discount =
    product.discount_percentage != null
      ? Math.round(Number(product.discount_percentage))
      : mrp !== null && mrp > sellingPrice
        ? Math.round(((mrp - sellingPrice) / mrp) * 100)
        : null;

  const details = [
    ["Color", product.color],
    ["Occasion", product.occasion],
    ["Fabric", product.fabric],
    ["Fabric Weight", product.fabric_weight],
    ["Weave", product.weave],
    ["Zari", product.zari],
    ["Border Style", product.border_style],
    ["Saree Length", product.saree_length],
    [
      "Blouse",
      product.blouse_included
        ? "Included"
        : "Not included",
    ],
    [
      "GI Certified",
      product.gi_certified ? "Yes" : "No",
    ],
    [
      "Silk Mark Certified",
      product.silk_mark_certified
        ? "Yes"
        : "No",
    ],
  ]
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .map(([label, value]) => ({
      label,
      value,
    }));

  const availableVariantNames = variants
    .map((variant) => variant.name)
    .filter(Boolean);

  if (availableVariantNames.length > 0) {
    details.push({
      label: "Available Options",
      value: availableVariantNames.join(", "),
    });
  }

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

    category: category.name,

    sellingPrice,

    mrp,

    discount,

    badge,

    image: images[0]?.image_url || null,

    images,

    variants,

    details,
  };
}

const productPageRequests = new Map();

function loadProductPageData(categoryId, productId) {
  const requestKey = `${categoryId}/${productId}`;

  const existingRequest =
    productPageRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    const activeCategory = categories.find(
      (item) =>
        item.is_active === true &&
        String(item.id) === String(categoryId)
    );

    if (!activeCategory) {
      const collectionError = new Error(
        "Collection not found"
      );

      collectionError.code =
        "COLLECTION_NOT_FOUND";

      throw collectionError;
    }

    const matchingProduct = products.find(
      (item) =>
        item.is_active === true &&
        String(item.id) === String(productId) &&
        String(item.category_id) ===
          String(activeCategory.id)
    );

    if (!matchingProduct) {
      const productError = new Error(
        "Product not found"
      );

      productError.code =
        "PRODUCT_NOT_FOUND";

      throw productError;
    }

    const productDetails = await getProduct(
      matchingProduct.id
    );

    if (
      productDetails.is_active !== true ||
      String(productDetails.category_id) !==
        String(activeCategory.id)
    ) {
      const productError = new Error(
        "Product not found"
      );

      productError.code =
        "PRODUCT_NOT_FOUND";

      throw productError;
    }

    const [imagesResult, variantsResult] =
      await Promise.allSettled([
        getProductImages(productDetails.id),
        getProductVariants(),
      ]);

    const images =
      imagesResult.status === "fulfilled" &&
      Array.isArray(imagesResult.value)
        ? [...imagesResult.value].sort(
            (first, second) => {
              const primaryOrder =
                Number(second.is_primary) -
                Number(first.is_primary);

              return (
                primaryOrder ||
                first.display_order -
                  second.display_order
              );
            }
          )
        : [];

    const variants =
      variantsResult.status === "fulfilled" &&
      Array.isArray(variantsResult.value)
        ? variantsResult.value.filter(
            (variant) =>
              String(variant.product_id) ===
                String(productDetails.id) &&
              variant.is_active === true
          )
        : [];

    return {
      product: normalizeProduct(
        productDetails,
        activeCategory,
        images,
        variants
      ),

      imagesError:
        imagesResult.status === "rejected"
          ? "Product images are currently unavailable."
          : "",

      variantsError:
        variantsResult.status === "rejected"
          ? "Product options are currently unavailable."
          : "",
    };
  })();

  productPageRequests.set(
    requestKey,
    request
  );

  request.then(
    () => {
      if (
        productPageRequests.get(requestKey) ===
        request
      ) {
        productPageRequests.delete(requestKey);
      }
    },
    () => {
      if (
        productPageRequests.get(requestKey) ===
        request
      ) {
        productPageRequests.delete(requestKey);
      }
    }
  );

  return request;
}

export default function ProductPage() {
  const params = useParams();

  const categoryId = params?.category;
  const productId = params?.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagesError, setImagesError] =
    useState("");
  const [variantsError, setVariantsError] =
    useState("");
  const [allProducts, setAllProducts] =
    useState([]);

  const addRecentlyViewed =
    useRecentlyViewedStore(
      (state) => state.addRecentlyViewed
    );

  useEffect(() => {
    if (!product) return;

    addRecentlyViewed({
      id: product.id,
      name: product.name,
      category: product.category,
      image: product.image,
      sellingPrice: product.sellingPrice,
      mrp: product.mrp,
      badge: product.badge,
    });
  }, [product, addRecentlyViewed]);

  useEffect(() => {
    if (!categoryId || !productId) {
      setError(
        "This product link is invalid."
      );
      setLoading(false);
      return;
    }

    let isCurrent = true;

    setLoading(true);
    setError("");
    setImagesError("");
    setVariantsError("");

    loadProductPageData(
      categoryId,
      productId
    )
      .then((result) => {
        if (!isCurrent) return;

        setProduct(result.product);
        setImagesError(result.imagesError);
        setVariantsError(result.variantsError);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            getProductPageError(requestError)
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [categoryId, productId]);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const products = await getProducts();

        setAllProducts(
          Array.isArray(products)
            ? products
            : []
        );
      } catch {
        setAllProducts([]);
      }
    }

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-nera-ivory">
        <div className="nera-container flex min-h-[70vh] items-center justify-center py-16">
          <p
            className="font-serif text-2xl text-nera-wine"
            role="status"
          >
            Loading saree details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-[70vh] bg-nera-ivory">
        <div className="nera-container flex min-h-[70vh] items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-nera-gold">
              {error ===
              "Collection not found."
                ? "Collection not found"
                : "Product unavailable"}
            </p>

            <h1 className="mt-3 font-serif text-4xl text-nera-wine">
              {error ||
                "Product not found."}
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nera-espresso/55">
              The product may have been moved
              or is no longer available.
            </p>

            <Link
              href="/collections"
              className="mt-7 inline-flex min-h-11 items-center justify-center bg-nera-wine px-6 text-xs font-medium uppercase tracking-[0.14em] text-nera-white transition hover:bg-nera-espresso"
            >
              Back to Collection
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const productForCart = {
    id: product.id,
    name: product.name,
    category: product.category,
    image: product.image,
    sellingPrice: product.sellingPrice,
    mrp: product.mrp,
    badge: product.badge,
    color: product.color,
    occasion: product.occasion,
    fabric: product.fabric,
    fabricWeight: product.fabric_weight,
    borderStyle: product.border_style,
    description: product.description,
    details: product.details,
    price: product.sellingPrice,
  };

  return (
    <main className="bg-nera-ivory">

      {/* Breadcrumb */}
      <div className="border-b border-nera-gold/15 bg-nera-white">
        <div className="nera-container flex min-h-12 items-center gap-2 overflow-x-auto whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-nera-espresso/45">

          <Link
            href="/"
            className="transition hover:text-nera-wine"
          >
            Home
          </Link>

          <ChevronRight size={13} />

          <Link
            href="/collections"
            className="transition hover:text-nera-wine"
          >
            Collections
          </Link>

          <ChevronRight size={13} />

          <Link
            href={`/collections/${product.categoryId || categoryId}`}
            className="transition hover:text-nera-wine"
          >
            {product.category}
          </Link>

          <ChevronRight size={13} />

          <span className="text-nera-espresso/70">
            {product.name}
          </span>

        </div>
      </div>

      {/* Product */}
      <section className="nera-container py-10 sm:py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">

          {/* Gallery */}
          <ProductGallery
            product={product}
            images={product.images}
          />

          {/* Details */}
          <div>

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nera-gold">
              {product.category}
            </p>

            <h1 className="mt-3 font-serif text-3xl leading-tight text-nera-wine sm:text-4xl">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <span className="text-xl font-medium text-nera-espresso">
                ₹
                {product.sellingPrice.toLocaleString(
                  "en-IN"
                )}
              </span>

              {product.mrp !== null && (
                <span className="text-sm text-nera-espresso/35 line-through">
                  ₹
                  {product.mrp.toLocaleString(
                    "en-IN"
                  )}
                </span>
              )}

              {product.discount !== null &&
                product.discount > 0 && (
                  <span className="border border-nera-gold/25 bg-nera-sand px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-nera-wine">
                    Save {product.discount}%
                  </span>
                )}

            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-6 text-sm leading-7 text-nera-espresso/60">
                {product.description}
              </p>
            )}

            {/* Product details */}
            {product.details.length > 0 && (
              <div className="mt-8 border-y border-nera-gold/20">

                {product.details.map(
                  (detail) => (
                    <div
                      key={detail.label}
                      className="grid grid-cols-2 border-b border-nera-gold/10 py-3 last:border-b-0"
                    >
                      <span className="text-[10px] uppercase tracking-[0.12em] text-nera-espresso/40">
                        {detail.label}
                      </span>

                      <span className="text-right text-xs text-nera-espresso/75">
                        {detail.value}
                      </span>
                    </div>
                  )
                )}

              </div>
            )}

            {imagesError && (
              <p
                role="alert"
                className="mt-4 text-xs text-nera-espresso/55"
              >
                {imagesError}
              </p>
            )}

            {variantsError && (
              <p
                role="status"
                className="mt-3 text-xs text-nera-espresso/55"
              >
                {variantsError}
              </p>
            )}

            {/* Cart / Wishlist */}
            <div className="mt-8">

              <ProductOptions
                product={productForCart}
              />

              <div className="mt-3">
                <ProductWhatsAppButton
                  product={product}
                />
              </div>

              <div className="mt-3">
                <ProductShare
                  product={product}
                />
              </div>

            </div>

            {/* Expert help */}
            <div className="mt-7 border border-nera-gold/20 bg-nera-white p-5">

              <div className="flex gap-3">

                <MessageCircle
                  size={19}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-nera-gold"
                />

                <div>

                  <p className="text-xs font-medium text-nera-wine">
                    Need help choosing?
                  </p>

                  <p className="mt-1 text-xs leading-6 text-nera-espresso/50">
                    Speak with our saree expert
                    for colour, occasion, drape,
                    and styling guidance.
                  </p>

                  <Link
                    href="/contact"
                    className="mt-3 inline-block text-[10px] font-medium uppercase tracking-[0.14em] text-nera-wine underline underline-offset-4"
                  >
                    Talk to an expert
                  </Link>

                </div>

              </div>

            </div>

            {/* Trust */}
            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="border border-nera-gold/15 bg-nera-white p-4">

                <ShieldCheck
                  size={18}
                  strokeWidth={1.4}
                  className="text-nera-gold"
                />

                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-nera-espresso/50">
                  Authentic Craft
                </p>

              </div>

              <div className="border border-nera-gold/15 bg-nera-white p-4">

                <ShieldCheck
                  size={18}
                  strokeWidth={1.4}
                  className="text-nera-gold"
                />

                <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-nera-espresso/50">
                  Quality Assured
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="nera-container pb-16 sm:pb-20">
        <ProductReviews
          productId={product.id}
        />
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed
        currentProductId={product.id}
      />

      {/* Recommended */}
      <RecommendedProducts
        products={allProducts}
        currentProduct={product}
      />

    </main>
  );
}