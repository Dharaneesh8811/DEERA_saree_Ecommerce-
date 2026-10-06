"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Heart, ShoppingBag } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistPage() {
  const wishlistItems = useWishlistStore(
    (state) => state.wishlistItems
  );

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );

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
            Continue Shopping
          </Link>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-nera-gold">
            Your Collection
          </p>

          <h1 className="mt-3 font-serif text-4xl font-normal text-nera-espresso md:text-5xl">
            Wishlist
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-nera-espresso/60">
            Keep the pieces you love close and come back to them whenever
            you're ready.
          </p>

        </div>
      </section>

      {/* Wishlist */}
      <section className="nera-container py-12 md:py-16">

        {wishlistItems.length === 0 ? (
          /* Empty state */
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-nera-gold/30 text-nera-wine">
              <Heart size={25} strokeWidth={1.3} />
            </div>

            <h2 className="mt-6 font-serif text-2xl text-nera-espresso">
              Your wishlist is waiting
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-nera-espresso/55">
              Save the sarees that catch your eye and they'll stay here
              for your next visit.
            </p>

            <Link
              href="/collections"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-nera-wine px-7 text-xs font-medium uppercase tracking-[0.12em] text-nera-white transition hover:bg-nera-espresso"
            >
              Explore Collection
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>

          </div>
        ) : (
          <>
            {/* Count */}
            <div className="mb-8 flex items-center justify-between border-b border-nera-gold/20 pb-5">
              <p className="text-sm text-nera-espresso/60">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "piece" : "pieces"} saved
              </p>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

              {wishlistItems.map((product) => (
                <div key={product.id} className="group">

                  {/* Image */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-nera-sand">

                    <Link
                      href={product.categorySlug
                        ? `/collections/${product.categorySlug}/${product.slug}`
                        : "/collections"}
                      className="block h-full w-full"
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
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
                    </Link>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="group/wishlist absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-nera-wine text-nera-white backdrop-blur-sm transition-all duration-300 hover:bg-nera-espresso"
                    >
                      <Heart
                        size={17}
                        strokeWidth={1.5}
                        fill="currentColor"
                        className="transition-transform duration-300 group-hover/wishlist:scale-110"
                      />
                    </button>

                    {/* Details */}
                    <Link
                      href={product.categorySlug
                        ? `/collections/${product.categorySlug}/${product.slug}`
                        : "/collections"}
                      className="absolute inset-x-0 bottom-0 translate-y-full bg-nera-wine px-4 py-3 text-center transition-transform duration-300 group-hover:translate-y-0"
                    >
                      <span className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-nera-white">
                        View Details
                        <ArrowUpRight size={13} strokeWidth={1.5} />
                      </span>
                    </Link>

                  </div>

                  {/* Product Info */}
                  <Link
                    href={product.categorySlug
                      ? `/collections/${product.categorySlug}/${product.slug}`
                      : "/collections"}
                    className="block pt-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.12em] text-nera-gold">
                      {product.category}
                    </p>

                    <h3 className="mt-2 font-serif text-lg text-nera-espresso">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-nera-wine">
                        ₹{product.sellingPrice.toLocaleString("en-IN")}
                      </span>

                      {product.mrp > product.sellingPrice && (
                        <span className="text-xs text-nera-espresso/40 line-through">
                          ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </Link>

                </div>
              ))}

            </div>
          </>
        )}

      </section>

      {/* Bottom CTA */}
      {wishlistItems.length > 0 && (
        <section className="border-t border-nera-gold/20 bg-nera-sand">
          <div className="nera-container py-12 text-center">

            <ShoppingBag
              size={24}
              strokeWidth={1.3}
              className="mx-auto text-nera-wine"
            />

            <h2 className="mt-4 font-serif text-2xl text-nera-espresso">
              Looking for something more?
            </h2>

            <Link
              href="/collections"
              className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:text-nera-gold"
            >
              Explore all silks
              <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>

          </div>
        </section>
      )}

    </main>
  );
}