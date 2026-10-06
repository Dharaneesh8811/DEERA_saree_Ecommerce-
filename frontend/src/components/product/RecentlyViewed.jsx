"use client";

import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import ProductCard from "@/components/product/ProductCard";

export default function RecentlyViewed({ currentProductId }) {
  const recentlyViewed = useRecentlyViewedStore(
    (state) => state.recentlyViewed
  );

  const products = recentlyViewed.filter(
    (product) => product.id !== currentProductId
  );

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-nera-gold/15 py-14 sm:py-16">
      <div className="nera-container">
        <div className="mb-8">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            Continue browsing
          </p>

          <h2 className="mt-2 font-serif text-3xl text-nera-wine sm:text-4xl">
            Recently Viewed
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
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