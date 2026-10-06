"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";

import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";
import ProductCard from "@/components/product/ProductCard";

const occasionTitles = {
  Wedding: "Wedding Silks",
  Festive: "Festive Silks",
  Everyday: "Everyday Silks",
  Gifting: "Silks for Gifting",
};

const validOccasions = [
  "Wedding",
  "Festive",
  "Everyday",
  "Gifting",
];

export default function OccasionPage() {
  return (
    <Suspense fallback={null}>
      <OccasionPageContent />
    </Suspense>
  );
}

function OccasionPageContent() {
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "";

  const {
    products,
    loading,
    error,
  } = useStorefrontCatalog();

  const selectedOccasion = validOccasions.find(
    (occasion) =>
      occasion.toLowerCase() === type.toLowerCase()
  );

  const filteredProducts = useMemo(() => {
    if (!selectedOccasion) {
      return [];
    }

    return products.filter(
      (product) =>
        product.occasion?.toLowerCase() ===
        selectedOccasion.toLowerCase()
    );
  }, [products, selectedOccasion]);

  const pageTitle =
    occasionTitles[selectedOccasion] ||
    "Find Your Moment";

  return (
    <main className="min-h-screen bg-nera-ivory">

      {/* Header */}

            <section className="border-b border-nera-gold/20 bg-nera-sand">
        <div className="nera-container py-14 sm:py-16 lg:py-20">

          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            Find your moment
          </p>

          <h1 className="font-serif text-4xl font-normal leading-tight text-nera-wine sm:text-5xl lg:text-6xl">
            {pageTitle}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-nera-espresso/60 sm:text-base">
            Whether it is a wedding, a celebration, a quiet everyday moment,
            or a thoughtful gift, find a silk made for it.
          </p>

        </div>
      </section>

      {/* Occasion Navigation */}

      <section className="border-b border-nera-wine/10 bg-nera-white">
        <div className="nera-container">

          <div className="flex gap-6 overflow-x-auto py-4">

            {validOccasions.map((occasion) => {
              const active =
                selectedOccasion === occasion;

              return (
                <Link
                  key={occasion}
                  href={`/collections/occasion?type=${encodeURIComponent(
                    occasion
                  )}`}
                  className={`whitespace-nowrap border-b-2 pb-2 text-[11px] font-medium uppercase tracking-[0.15em] transition ${
                    active
                      ? "border-nera-wine text-nera-wine"
                      : "border-transparent text-nera-espresso/50 hover:text-nera-wine"
                  }`}
                >
                  {occasion}
                </Link>
              );
            })}

          </div>

        </div>
      </section>

      {/* Products */}

      <section className="nera-container py-12 sm:py-16">

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm text-nera-espresso/60">
              Finding the perfect silks...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <h2 className="font-serif text-2xl text-nera-wine">
              Unable to load the collection
            </h2>

            <p className="mt-3 text-sm text-nera-espresso/60">
              Please try again in a moment.
            </p>
          </div>
        ) : !selectedOccasion ? (
          <div className="py-20 text-center">

            <h2 className="font-serif text-2xl text-nera-wine">
              Choose an occasion
            </h2>

            <p className="mt-3 text-sm text-nera-espresso/60">
              Select a moment above to explore the collection.
            </p>

          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">

            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-nera-gold">
              {selectedOccasion}
            </p>

            <h2 className="font-serif text-2xl text-nera-wine">
              No silks found yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-nera-espresso/60">
              There are currently no products assigned to this
              occasion.
            </p>

            <Link
              href="/collections"
              className="mt-6 inline-flex items-center border-b border-nera-wine pb-1 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine"
            >
              Explore all collections
            </Link>

          </div>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between">

              <div>
                <p className="text-xs text-nera-espresso/50">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "piece"
                    : "pieces"}
                </p>
              </div>

            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}

      </section>

    </main>
  );
}