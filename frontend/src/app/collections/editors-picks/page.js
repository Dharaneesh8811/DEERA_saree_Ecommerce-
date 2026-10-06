"use client";

import Link from "next/link";
import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";
import ProductCard from "@/components/product/ProductCard";

export default function EditorsPicksPage() {
  const {
    products,
    loading,
    error,
  } = useStorefrontCatalog();

  const editorPicks = products.filter(
    (product) => product.is_editor_pick === true
  );

  return (
    <main className="min-h-screen bg-nera-ivory">

      {/* HERO */}

      <section className="border-b border-nera-gold/20 bg-nera-sand">
        <div className="nera-container py-14 sm:py-16 lg:py-20">

          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            Curated by DEERA
          </p>

          <h1 className="font-serif text-4xl font-normal leading-tight text-nera-wine sm:text-5xl lg:text-6xl">
            Editor's Picks
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-nera-espresso/60 sm:text-base">
            A considered selection of silk sarees chosen for their
            craftsmanship, character and timeless elegance.
          </p>

        </div>
      </section>

      {/* PRODUCTS */}

      <section className="nera-container py-12 sm:py-16 lg:py-20">

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm text-nera-espresso/60">
              Curating your selection...
            </p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">

            <h2 className="font-serif text-2xl text-nera-wine">
              Unable to load Editor&apos;s Picks
            </h2>

            <p className="mt-3 text-sm text-nera-espresso/60">
              Please try again in a moment.
            </p>

          </div>
        ) : editorPicks.length === 0 ? (
          <div className="py-20 text-center">

            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-nera-gold">
              DEERA Collection
            </p>

            <h2 className="font-serif text-2xl text-nera-wine">
              No Editor&apos;s Picks yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-nera-espresso/60">
              Products selected by our editors will appear here.
            </p>

            <Link
              href="/collections"
              className="mt-6 inline-flex border-b border-nera-wine pb-1 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine"
            >
              Explore all collections
            </Link>

          </div>
        ) : (
          <>
            {/* COUNT */}

            <div className="mb-8 flex items-center justify-between border-b border-nera-wine/10 pb-5">

              <p className="text-xs text-nera-espresso/50">
                {editorPicks.length}{" "}
                {editorPicks.length === 1
                  ? "selected piece"
                  : "selected pieces"}
              </p>

              <p className="hidden text-[10px] uppercase tracking-[0.16em] text-nera-gold sm:block">
                Handpicked by DEERA
              </p>

            </div>

            {/* GRID */}

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
              {editorPicks.map((product) => (
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