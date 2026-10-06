"use client";

import { useEffect, useState } from "react";

import ProductCard from "@/components/product/ProductCard";
import { getProductImages } from "@/services/productImageService";

export default function RecommendedProducts({
  products = [],
  currentProduct,
}) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendationImages() {
      if (!currentProduct || products.length === 0) {
        setRecommendations([]);
        return;
      }

      const selectedProducts = products
        .filter((product) => product.id !== currentProduct.id)
        .map((product) => {
          let score = 0;

          if (
            product.categorySlug &&
            product.categorySlug === currentProduct.categorySlug
          ) {
            score += 3;
          }

          if (
            product.category_id &&
            product.category_id === currentProduct.category_id
          ) {
            score += 3;
          }

          if (
            product.occasion &&
            currentProduct.occasion &&
            product.occasion.toLowerCase() ===
              currentProduct.occasion.toLowerCase()
          ) {
            score += 2;
          }

          if (
            product.fabric &&
            currentProduct.fabric &&
            product.fabric.toLowerCase() ===
              currentProduct.fabric.toLowerCase()
          ) {
            score += 1;
          }

          return {
            product,
            score,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(({ product }) => product);

      if (selectedProducts.length === 0) {
        setRecommendations([]);
        return;
      }

      try {
        const productsWithImages = await Promise.all(
          selectedProducts.map(async (product) => {
            try {
              const images = await getProductImages(product.id);

              const imageList = Array.isArray(images)
                ? images
                : [];

              const sortedImages = [...imageList].sort(
                (first, second) => {
                  const primaryOrder =
                    Number(second.is_primary) -
                    Number(first.is_primary);

                  return (
                    primaryOrder ||
                    Number(first.display_order || 0) -
                      Number(second.display_order || 0)
                  );
                }
              );

              const primaryImage = sortedImages[0];

              return {
                ...product,
                image: primaryImage?.image_url || null,
              };
            } catch {
              return {
                ...product,
                image: null,
              };
            }
          })
        );

        if (!cancelled) {
          setRecommendations(productsWithImages);
        }
      } catch {
        if (!cancelled) {
          setRecommendations([]);
        }
      }
    }

    loadRecommendationImages();

    return () => {
      cancelled = true;
    };
  }, [products, currentProduct]);

  if (!currentProduct || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-nera-gold/15 py-14 sm:py-16">
      <div className="nera-container">
        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            You may also like
          </p>

          <h2 className="mt-2 font-serif text-3xl text-nera-wine sm:text-4xl">
            Recommended for You
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}