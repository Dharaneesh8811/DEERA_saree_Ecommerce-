"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Journal",
    href: "/blogs",
  },
  {
    label: "Stores",
    href: "/stores",
  },
  {
    label: "FAQs",
    href: "/faqs",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  function openMenu() {
    setIsOpen(true);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  // Prevent background page from scrolling while menu is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu with Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* ========================================
          MOBILE MENU BUTTON
      ======================================== */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-nera-espresso
          transition
          duration-200
          hover:bg-nera-sand
          hover:text-nera-wine
        "
      >
        <Menu size={23} strokeWidth={1.6} />
      </button>

      {/* ========================================
          OVERLAY
      ======================================== */}
      <div
        className={`
          fixed
          inset-0
          z-[60]
          bg-[#241A18]/50
          transition-opacity
          duration-300
          ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ========================================
          MOBILE DRAWER
      ======================================== */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        className={`
          fixed
          inset-y-0
          right-0
          z-[70]
          flex
          h-screen
          w-full
          flex-col
          overflow-y-auto
          bg-[#FFFDF8]
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          sm:w-[88%]
          sm:max-w-[420px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* ========================================
            DRAWER HEADER
        ======================================== */}
        <div
          className="
            flex
            min-h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-[#C6A15B]/20
            bg-[#FFFDF8]
            px-6
          "
        >
          <Link
            href="/"
            onClick={closeMenu}
            className="
              font-serif
              text-xl
              tracking-wide
              text-nera-wine
            "
          >
            DEERA SILK
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-nera-espresso
              transition
              duration-200
              hover:bg-nera-sand
              hover:text-nera-wine
            "
          >
            <X size={23} strokeWidth={1.6} />
          </button>
        </div>

        {/* ========================================
            NAVIGATION
        ======================================== */}
        <nav
          className="
            shrink-0
            bg-[#FFFDF8]
            px-6
            py-5
          "
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="
                block
                border-b
                border-[#C6A15B]/15
                bg-[#FFFDF8]
                py-[15px]
                font-serif
                text-[18px]
                leading-6
                text-nera-espresso
                transition-all
                duration-200
                hover:pl-2
                hover:text-nera-wine
              "
            >
              {item.label}
            </Link>
          ))}

          {/* ========================================
              QUICK ACTIONS
          ======================================== */}
          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-2
            "
          >
            {/* Search */}
            <Link
              href="/search"
              onClick={closeMenu}
              className="
                flex
                min-h-[88px]
                flex-col
                items-center
                justify-center
                gap-2
                border
                border-[#C6A15B]/25
                bg-[#FFFDF8]
                px-2
                text-nera-espresso
                transition
                duration-200
                hover:bg-nera-sand
                hover:text-nera-wine
              "
            >
              <Search size={20} strokeWidth={1.5} />

              <span className="text-[11px] font-medium uppercase tracking-wide">
                Search
              </span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              onClick={closeMenu}
              className="
                flex
                min-h-[88px]
                flex-col
                items-center
                justify-center
                gap-2
                border
                border-[#C6A15B]/25
                bg-[#FFFDF8]
                px-2
                text-nera-espresso
                transition
                duration-200
                hover:bg-nera-sand
                hover:text-nera-wine
              "
            >
              <Heart size={20} strokeWidth={1.5} />

              <span className="text-[11px] font-medium uppercase tracking-wide">
                Wishlist
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              onClick={closeMenu}
              className="
                flex
                min-h-[88px]
                flex-col
                items-center
                justify-center
                gap-2
                border
                border-[#C6A15B]/25
                bg-[#FFFDF8]
                px-2
                text-nera-espresso
                transition
                duration-200
                hover:bg-nera-sand
                hover:text-nera-wine
              "
            >
              <ShoppingBag size={20} strokeWidth={1.5} />

              <span className="text-[11px] font-medium uppercase tracking-wide">
                Cart
              </span>
            </Link>
          </div>

          {/* ========================================
              SAREE EXPERT CTA
          ======================================== */}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="
              mt-4
              flex
              min-h-[58px]
              items-center
              justify-center
              gap-2
              bg-nera-wine
              px-5
              text-center
              text-sm
              font-medium
              uppercase
              tracking-wide
              text-nera-white
              transition
              duration-200
              hover:bg-nera-espresso
            "
          >
            <MessageCircle size={19} strokeWidth={1.6} />

            <span>Talk to a Saree Expert</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
