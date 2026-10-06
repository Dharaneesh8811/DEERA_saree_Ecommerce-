"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductOptions({ product }) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const wishlisted = Boolean(
    product && wishlistItems.some((item) => item.id === product.id),
  );

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  // Buy Now
  const handleBuyNow = () => {
    if (!product) return;

    addToCart(product, quantity);
    router.push("/checkout");
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    toggleWishlist(product);
  };

  return (
    <div className="mt-8">
      {/* Quantity */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-nera-espresso/60">
          Quantity
        </p>

        <div className="flex h-12 w-32 items-center justify-between border border-nera-gold/30">
          <button
            type="button"
            onClick={decreaseQuantity}
            className="flex h-full w-10 items-center justify-center text-nera-wine transition hover:bg-nera-sand"
            aria-label="Decrease quantity"
          >
            <Minus size={15} strokeWidth={1.5} />
          </button>

          <span className="text-sm text-nera-espresso">
            {quantity}
          </span>

          <button
            type="button"
            onClick={increaseQuantity}
            className="flex h-full w-10 items-center justify-center text-nera-wine transition hover:bg-nera-sand"
            aria-label="Increase quantity"
          >
            <Plus size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        {/* Add to Cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 bg-nera-wine px-5 text-xs font-medium uppercase tracking-[0.12em] text-nera-white transition hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingBag size={17} strokeWidth={1.5} />

          {added ? "Added to Cart" : "Add to Cart"}
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!product}
          className="flex min-h-14 flex-1 items-center justify-center border border-nera-wine bg-nera-white px-5 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:bg-nera-wine hover:text-nera-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Buy Now
        </button>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={!product}
          aria-pressed={wishlisted}
          className={`flex h-14 w-14 shrink-0 items-center justify-center border border-nera-gold/30 transition hover:border-nera-wine hover:bg-nera-sand ${
            wishlisted
              ? "bg-nera-wine text-nera-white"
              : "text-nera-wine"
          }`}
          aria-label={
            wishlisted
              ? `Remove ${product?.name || "product"} from wishlist`
              : `Add ${product?.name || "product"} to wishlist`
          }
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}