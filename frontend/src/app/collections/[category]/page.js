"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import FilterSidebar from "@/components/product/FilterSidebar";
import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";

export default function CategoryPage({ params }) {
  const { category } = params;

  const {
    products,
    categories,
    loading,
    error,
    categoryError,
  } = useStorefrontCatalog();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortOption, setSortOption] = useState("default");

  const PRODUCTS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilters, sortOption]);

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);


  /*
   * Current category
   * URL now contains category ID
   */
  const currentCategory = useMemo(() => {
    return categories.find(
      (item) => String(item.id) === String(category)
    );
  }, [categories, category]);

  /*
   * Category products
   * Match product.category_id with category ID
   */
  const categoryProducts = useMemo(() => {
    if (!category) return [];

    return products.filter(
      (product) =>
        String(product.categoryId) === String(category)
    );
  }, [products, category]);

  /*
   * Search + filters + sorting
   */
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    /*
     * Search
     */
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );
      });
    }

    /*
     * Price
     */
    const priceFilters = selectedFilters.price || [];

    if (priceFilters.length > 0) {
      result = result.filter((product) => {
        return priceFilters.some((filter) => {
          const price = product.sellingPrice;

          if (filter === "Under ₹10,000") {
            return price < 10000;
          }

          if (filter === "₹10,000 – ₹15,000") {
            return price >= 10000 && price <= 15000;
          }

          if (filter === "₹15,000 – ₹25,000") {
            return price > 15000 && price <= 25000;
          }

          if (filter === "Above ₹25,000") {
            return price > 25000;
          }

          return true;
        });
      });
    }

    /*
     * Colour
     */
    const colorFilters = selectedFilters.color || [];

    if (colorFilters.length > 0) {
      result = result.filter((product) =>
        colorFilters.includes(product.color)
      );
    }

    /*
     * Occasion
     */
    const occasionFilters = selectedFilters.occasion || [];

    if (occasionFilters.length > 0) {
      result = result.filter((product) =>
        occasionFilters.some((occasion) =>
          product.occasion?.includes(occasion)
        )
      );
    }

    /*
     * Fabric
     */
    const fabricFilters = selectedFilters.fabric || [];

    if (fabricFilters.length > 0) {
      result = result.filter((product) =>
        fabricFilters.includes(product.fabric)
      );
    }

    /*
     * Fabric Weight
     */
    const weightFilters = selectedFilters.fabricWeight || [];

    if (weightFilters.length > 0) {
      result = result.filter((product) =>
        weightFilters.includes(product.fabricWeight)
      );
    }

    /*
     * Border Style
     */
    const borderFilters = selectedFilters.border || [];

    if (borderFilters.length > 0) {
      result = result.filter((product) =>
        borderFilters.includes(product.borderStyle)
      );
    }

    /*
     * Sorting
     */
    if (sortOption === "price-low") {
      result.sort(
        (a, b) => a.sellingPrice - b.sellingPrice
      );
    }

    if (sortOption === "price-high") {
      result.sort(
        (a, b) => b.sellingPrice - a.sellingPrice
      );
    }

    return result;
  }, [
    categoryProducts,
    searchQuery,
    selectedFilters,
    sortOption,
  ]);

  /*
   * Category name
   */
  const categoryName =
    currentCategory?.name || "Collection";

  /*
   * Active filter count
   */
  const selectedFilterCount = Object.values(
    selectedFilters
  ).reduce(
    (total, options) => total + options.length,
    0
  );

  /*
   * Clear filters
   */
  function clearAllFilters() {
    setSelectedFilters({});
  }

  return (
    <main className="min-h-screen bg-nera-ivory">

      {/* Page Header */}
      <section className="border-b border-nera-gold/20 bg-nera-sand">
        <div className="nera-container py-14 sm:py-16 lg:py-20">

          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            The Collection
          </p>

          <h1 className="font-serif text-4xl font-normal leading-tight text-nera-wine sm:text-5xl lg:text-6xl">
            {categoryName}
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-nera-espresso/60 sm:text-base">
            Explore our curated selection of{" "}
            {categoryName.toLowerCase()} sarees, chosen for
            craftsmanship, elegance and timeless style.
          </p>

        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b border-nera-gold/20 bg-nera-white">
        <div className="nera-container">

          <div className="flex gap-7 overflow-x-auto py-5">

            {categories.map((item) => {
              const href = `/collections/${item.id}`;

              const isActive =
                String(item.id) === String(category);

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`shrink-0 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors ${
                    isActive
                      ? "border-b border-nera-wine text-nera-wine"
                      : "text-nera-espresso/55 hover:text-nera-wine"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

          </div>

          {categoryError && (
            <p
              role="alert"
              className="pb-3 text-xs text-nera-espresso/55"
            >
              {categoryError}
            </p>
          )}

        </div>
      </section>

      {/* Product Area */}
      <section className="bg-nera-ivory py-10 sm:py-12 lg:py-16">

        <div className="nera-container">

          {/* Toolbar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p
                className="text-xs text-nera-espresso/55"
                role={loading ? "status" : undefined}
              >
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} ${
                      filteredProducts.length === 1
                        ? "piece"
                        : "pieces"
                    } available`}
              </p>

              {selectedFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-2 text-[9px] uppercase tracking-[0.12em] text-nera-wine underline underline-offset-4"
                >
                  Clear {selectedFilterCount} filters
                </button>
              )}
            </div>

            <div className="flex gap-3">

              {/* Filter */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center gap-2 border border-nera-gold/30 bg-nera-white px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:border-nera-wine"
              >
                <SlidersHorizontal
                  size={14}
                  strokeWidth={1.5}
                />

                Filter

                {selectedFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-nera-wine px-1 text-[8px] text-nera-white">
                    {selectedFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value)
                }
                className="border border-nera-gold/30 bg-nera-white px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-nera-wine outline-none"
              >
                <option value="default">
                  Sort
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

            </div>

          </div>

          {/* Search */}
          <div className="mb-8 flex w-full justify-center">

            <div className="group flex w-full max-w-2xl items-center rounded-full border border-nera-gold/30 bg-nera-white px-5 shadow-[0_6px_25px_rgba(36,26,24,0.05)] transition-all duration-300 focus-within:border-nera-wine/50 focus-within:shadow-[0_8px_30px_rgba(36,26,24,0.08)]">

              <Search
                size={19}
                strokeWidth={1.5}
                className="mr-3 shrink-0 text-nera-gold transition-colors duration-300 group-focus-within:text-nera-wine"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search in this collection..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-nera-espresso outline-none placeholder:text-nera-espresso/35 md:h-14 md:text-[15px]"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nera-sand text-sm text-nera-espresso/60 transition-all duration-200 hover:bg-nera-wine hover:text-nera-white"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* Search Result */}
          {searchQuery.trim() && (
            <p className="mb-6 text-sm text-nera-espresso/60">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "piece"
                : "pieces"}{" "}
              found for "{searchQuery}"
            </p>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="py-20 text-center" role="status">
              <p className="font-serif text-2xl text-nera-wine">
                Loading sarees...
              </p>
            </div>
          ) : error ? (
            <div className="py-20 text-center" role="alert">
              <p className="font-serif text-2xl text-nera-wine">
                Unable to load this collection
              </p>

              <p className="mt-3 text-sm text-nera-espresso/55">
                {error}
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl text-nera-wine">
                No sarees available
              </p>

              <p className="mt-3 text-sm text-nera-espresso/55">
                New pieces will appear here when they are available.
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-6">

              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>
          ) : (
            <div className="py-20 text-center">

              <p className="font-serif text-2xl text-nera-wine">
                No sarees found
              </p>

              <p className="mt-3 text-sm text-nera-espresso/55">
                Try changing your filters or search.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilters({});
                }}
                className="mt-6 border border-nera-wine bg-nera-wine px-6 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-nera-white transition hover:bg-nera-espresso"
              >
                Clear All
              </button>

            </div>
          )}

        </div>

      </section>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[80]">

          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowFilters(false)}
            className="absolute inset-0 bg-nera-espresso/50"
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-[400px] overflow-y-auto bg-nera-white shadow-2xl">

            <FilterSidebar
              selectedFilters={selectedFilters}
              onApply={setSelectedFilters}
              onClose={() => setShowFilters(false)}
            />

          </div>

        </div>
      )}

    </main>
  );
}