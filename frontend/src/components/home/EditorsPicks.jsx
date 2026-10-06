"use client";

import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";

import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";
import { useWishlistStore } from "@/store/wishlistStore";

export default function EditorsPicks() {
  const { products, loading } =
    useStorefrontCatalog();

  const wishlistItems = useWishlistStore(
    (state) => state.wishlistItems
  );

  const toggleWishlist = useWishlistStore(
    (state) => state.toggleWishlist
  );

  const selectedProducts = products
    .filter(
      (product) =>
        product.is_editor_pick === true
    )
    .slice(0, 4);

  const isWishlisted = (productId) =>
    wishlistItems.some(
      (item) => item.id === productId
    );

  if (loading) {
    return null;
  }

  return (
    <section className="bg-nera-white py-20 md:py-28">
      <div className="nera-container">

        {/* Heading */}
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-nera-gold">
              Curated for you
            </p>

            <h2 className="font-serif text-4xl font-normal text-nera-espresso md:text-5xl">
              Editor's Picks
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-nera-espresso/60">
              A considered selection of silk sarees chosen for their craftsmanship, character, and timeless appeal.
            </p>
          </div>

          <Link
            href="/collections/editors-picks"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:text-nera-gold"
          >
            View all
            <ArrowUpRight
              size={15}
              strokeWidth={1.5}
            />
          </Link>

        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">

          {selectedProducts.map((product) => {
            const wishlisted =
              isWishlisted(product.id);

            const productHref =
              product.categoryId && product.id
                ? `/collections/${product.categoryId}/${product.id}`
                : "/collections";

            return (
              <div
                key={product.id}
                className="group"
              >

                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-nera-sand">

                  <Link
                    href={productHref}
                    className="block h-full w-full"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-nera-espresso/40">
                        Image unavailable
                      </div>
                    )}
                  </Link>

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute left-3 top-3 bg-nera-white px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-nera-wine">
                      {product.badge}
                    </span>
                  )}

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleWishlist(product)
                    }
                    aria-label={
                      wishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    className={`group/wishlist absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${
                      wishlisted
                        ? "bg-nera-wine text-nera-white"
                        : "bg-nera-white/90 text-nera-espresso hover:bg-nera-wine hover:text-nera-white"
                    }`}
                  >
                    <Heart
                      size={17}
                      strokeWidth={1.5}
                      fill={
                        wishlisted
                          ? "currentColor"
                          : "none"
                      }
                      className="transition-transform duration-300 group-hover/wishlist:scale-110"
                    />
                  </button>

                  {/* View Details */}
                  <Link
                    href={productHref}
                    className="absolute inset-x-0 bottom-0 translate-y-full bg-nera-wine px-4 py-3 text-center transition-transform duration-300 group-hover:translate-y-0"
                  >
                    <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-nera-white">
                      View Details
                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.5}
                      />
                    </span>
                  </Link>

                </div>

                {/* Product Info */}
                <Link
                  href={productHref}
                  className="block pt-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-nera-gold">
                    {product.category}
                  </p>

                  <h3 className="mt-2 font-serif text-lg font-normal text-nera-espresso">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">

                    {product.sellingPrice != null && (
                      <span className="text-sm font-medium text-nera-wine">
                        ₹
                        {Number(
                          product.sellingPrice
                        ).toLocaleString("en-IN")}
                      </span>
                    )}

                    {product.mrp != null &&
                      Number(product.mrp) >
                        Number(
                          product.sellingPrice
                        ) && (
                        <span className="text-xs text-nera-espresso/40 line-through">
                          ₹
                          {Number(
                            product.mrp
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      )}

                  </div>
                </Link>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}