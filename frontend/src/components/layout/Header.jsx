"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag } from "lucide-react";
import MobileMenu from "@/components/navigation/MobileMenu";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function Header() {
  const cartItems = useCartStore((state) => state.cartItems);

  const wishlistItems = useWishlistStore((state) => state.wishlistItems);

  const wishlistCount = wishlistItems.length;

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-nera-gold/20 bg-nera-white">
      <div className="nera-container flex h-[76px] items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <p className="font-serif text-2xl tracking-[0.08em] text-nera-wine">
            DEERA SILK
          </p>

          <p className="mt-0.5 text-[8px] uppercase tracking-[0.22em] text-nera-espresso/50">
            Heritage · Reimagined
          </p>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Home
          </Link>

          <Link
            href="/collections"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Collections
          </Link>

          <Link
            href="/bulk-order"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Bulk Orders
          </Link>

          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            About
          </Link>

          <Link
            href="/blogs"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Journal
          </Link>

          <Link
            href="/stores"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Store
          </Link>

          <Link
            href="/contact"
            className="text-xs uppercase tracking-[0.12em] text-nera-espresso/70 transition hover:text-nera-wine"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-1 lg:flex">
          {/* Search */}
          <Link
            href="/search"
            aria-label="Search"
            className="relative flex h-10 w-10 items-center justify-center text-nera-espresso/70 transition hover:text-nera-wine"
          >
            <Search size={19} strokeWidth={1.5} />
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="relative flex h-10 w-10 items-center justify-center text-nera-espresso transition hover:text-nera-wine"
          >
            <Heart size={19} strokeWidth={1.5} />

            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nera-wine px-1 text-[9px] font-medium leading-none text-nera-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center text-nera-espresso/70 transition hover:text-nera-wine"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />

            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-nera-wine px-1 text-[9px] font-medium leading-none text-nera-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
