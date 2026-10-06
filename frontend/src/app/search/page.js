"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";

export default function SearchPage() {
  const { products, loading, error } = useStorefrontCatalog();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.categorySlug,
        product.slug,
        product.description,
        product.fabric,
        product.color,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [products, searchQuery]);

  return (
    <main className="min-h-screen bg-nera-ivory">

      {/* Header */}
      <section className="border-b border-nera-gold/20 bg-nera-white">
        <div className="nera-container py-12 md:py-16">

          <Link
            href="/collections"
            className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-nera-espresso/60 transition hover:text-nera-wine"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            Back to Collection
          </Link>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-nera-gold">
            Discover your silk
          </p>

          <h1 className="mt-3 font-serif text-4xl font-normal text-nera-espresso md:text-5xl">
            Search
          </h1>

          {/* Search box */}
          <div className="w-full max-w-3xl my-4">
            <div className="group flex items-center rounded-full border border-nera-gold/30 bg-nera-white px-4 shadow-[0_8px_30px_rgba(36,26,24,0.05)] transition-all duration-300 focus-within:border-nera-wine/50 focus-within:shadow-[0_10px_35px_rgba(36,26,24,0.08)] sm:px-5">

              <Search
                size={19}
                strokeWidth={1.5}
                className="mr-3 mx-5 shrink-0 text-nera-gold transition-colors duration-300 group-focus-within:text-nera-wine"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sarees, silk, collections..."
                className="h-12 min-w-0 flex-1 appearance-none bg-transparent text-sm text-nera-espresso outline-none placeholder:text-nera-espresso/35 sm:h-14 sm:text-[15px]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nera-sand text-xs text-nera-espresso/60 transition-all duration-200 hover:bg-nera-wine hover:text-nera-white"
                >
                  ×
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between px-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-nera-espresso/35">
                Search our curated collection
              </p>

              {searchQuery.trim() && !loading && !error && (
                <p className="text-xs text-nera-wine">
                  {searchResults.length}{" "}
                  {searchResults.length === 1 ? "piece" : "pieces"} found
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Results */}
      <section className="nera-container py-12 md:py-16">

        {loading ? (
          <div className="py-16 text-center" role="status">
            <h2 className="font-serif text-2xl text-nera-espresso">Loading products...</h2>
          </div>
        ) : error ? (
          <div className="py-16 text-center" role="alert">
            <h2 className="font-serif text-2xl text-nera-espresso">Unable to load products</h2>
            <p className="mt-3 text-sm text-nera-espresso/55">{error}</p>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="py-16 text-center">
            <SearchIcon
              size={30}
              strokeWidth={1.2}
              className="mx-auto text-nera-gold"
            />

            <h2 className="mt-5 font-serif text-2xl text-nera-espresso">
              What are you looking for?
            </h2>

            <p className="mt-3 text-sm text-nera-espresso/55">
              Try searching for Kanjivaram, Banarasi, Soft Silk or a
              saree name.
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="font-serif text-2xl text-nera-espresso">
              No pieces found
            </h2>

            <p className="mt-3 text-sm text-nera-espresso/55">
              We couldn't find anything matching "{searchQuery}".
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between border-b border-nera-gold/20 pb-5">
              <p className="text-sm text-nera-espresso/60">
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "piece" : "pieces"} found
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={
                    product.categoryId && product.id
                      ? `/collections/${product.categoryId}/${product.id}`
                      : "/collections"
                  }
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-nera-sand">

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`No image available for ${product.name}`}
                        className="flex h-full w-full items-center justify-center text-xs text-nera-espresso/40"
                      >
                        Image unavailable
                      </div>
                    )}

                    {product.badge && (
                      <span className="absolute left-3 top-3 bg-nera-white px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-nera-wine">
                        {product.badge}
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-nera-wine px-4 py-3 text-center transition-transform duration-300 group-hover:translate-y-0">
                      <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-nera-white">
                        View Details
                        <ArrowUpRight size={13} strokeWidth={1.5} />
                      </span>
                    </div>

                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-nera-gold">
                      {product.category}
                    </p>

                    <h3 className="mt-2 font-serif text-lg text-nera-espresso">
                      {product.name}
                    </h3>

                    {product.sellingPrice != null &&
                      Number.isFinite(Number(product.sellingPrice)) && (
                      <p className="mt-2 text-sm font-medium text-nera-wine">
                        ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}

            </div>
          </>
        )}

      </section>

    </main>
  );
}