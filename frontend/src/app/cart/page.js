"use client";

import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalMrp = cartItems.reduce(
    (total, item) => total + (item.mrp || item.price) * item.quantity,
    0
  );

  const savings = totalMrp - subtotal;

  /* ---------------- EMPTY CART ---------------- */

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[75vh] bg-nera-ivory">
        <div className="nera-container flex min-h-[75vh] items-center justify-center py-16">
          <div className="w-full max-w-xl text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-nera-gold/30 bg-nera-white">
              <span className="font-serif text-3xl text-nera-wine">
                D
              </span>
            </div>

            <p className="mt-7 text-[10px] uppercase tracking-[0.22em] text-nera-gold">
              Your shopping bag
            </p>

            <h1 className="mt-3 font-serif text-4xl text-nera-wine sm:text-5xl">
              Nothing here yet.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-nera-espresso/55">
              Your favourite silks are waiting to be discovered.
              Explore our curated collection and find something
              made for your next special moment.
            </p>

            <Link
              href="/collections"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 bg-nera-wine px-8 text-xs font-medium uppercase tracking-[0.14em] text-nera-white transition hover:bg-nera-espresso"
            >
              Explore Collection
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nera-ivory">

      <div className="nera-container py-10 sm:py-14 lg:py-16">

        {/* ================= HEADER ================= */}

        <div className="mb-10 border-b border-nera-gold/20 pb-7 sm:mb-12">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                Your selection
              </p>

              <h1 className="mt-3 font-serif text-4xl font-normal text-nera-wine sm:text-5xl">
                Your Shopping Bag
              </h1>

              <p className="mt-3 text-sm text-nera-espresso/50">
                {cartItems.reduce(
                  (total, item) => total + item.quantity,
                  0
                )}{" "}
                items selected for you
              </p>
            </div>

            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-nera-wine transition hover:text-nera-espresso"
            >
              Continue Shopping
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>

          </div>
        </div>

        {/* ================= MAIN GRID ================= */}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">

          {/* ================= PRODUCTS ================= */}

          <div className="space-y-5">

            {cartItems.map((item) => {

              const itemMrp = item.mrp || item.price;
              const itemSaving = itemMrp - item.price;

              return (
                <article
                  key={item.id}
                  className="group border border-nera-gold/20 bg-nera-white p-3 sm:p-4"
                >

                  <div className="flex gap-4 sm:gap-6">

                    {/* IMAGE */}

                    <Link
                      href={`/collections/kanchipuram-silk/${item.slug}`}
                      className="relative block w-[120px] shrink-0 overflow-hidden bg-nera-sand sm:w-[180px]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-[4/5] h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      {item.badge && (
                        <span className="absolute left-2 top-2 bg-nera-wine px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>

                    {/* DETAILS */}

                    <div className="flex min-w-0 flex-1 flex-col">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-nera-gold">
                            {item.category}
                          </p>

                          <h2 className="mt-2 font-serif text-xl leading-tight text-nera-wine sm:text-2xl">
                            {item.name}
                          </h2>

                          <p className="mt-2 hidden text-xs leading-5 text-nera-espresso/45 sm:block">
                            Handpicked silk chosen for its timeless
                            craftsmanship and elegant character.
                          </p>

                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 text-nera-espresso/35 transition hover:text-nera-wine"
                        >
                          <Trash2 size={17} strokeWidth={1.4} />
                        </button>

                      </div>

                      {/* PRICE */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">

                        <span className="text-sm font-medium text-nera-espresso">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>

                        {itemMrp > item.price && (
                          <>
                            <span className="text-xs text-nera-espresso/35 line-through">
                              ₹{itemMrp.toLocaleString("en-IN")}
                            </span>

                            <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-nera-gold">
                              Save ₹{itemSaving.toLocaleString("en-IN")}
                            </span>
                          </>
                        )}

                      </div>

                      {/* BOTTOM */}

                      <div className="mt-auto flex items-end justify-between gap-3 pt-6">

                        {/* QUANTITY */}

                        <div>
                          <p className="mb-2 text-[8px] uppercase tracking-[0.16em] text-nera-espresso/40">
                            Quantity
                          </p>

                          <div className="flex h-9 items-center border border-nera-gold/25">

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-full w-9 items-center justify-center text-nera-espresso/55 transition hover:bg-nera-sand hover:text-nera-wine"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="flex h-full w-9 items-center justify-center border-x border-nera-gold/25 text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-full w-9 items-center justify-center text-nera-espresso/55 transition hover:bg-nera-sand hover:text-nera-wine"
                            >
                              <Plus size={13} />
                            </button>

                          </div>
                        </div>

                        {/* ITEM TOTAL */}

                        <div className="text-right">

                          <p className="text-[8px] uppercase tracking-[0.16em] text-nera-espresso/40">
                            Item total
                          </p>

                          <p className="mt-1 text-sm font-medium text-nera-wine">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}

            {/* TRUST STRIP */}

            <div className="grid grid-cols-3 border border-nera-gold/15 bg-nera-white">

              <div className="flex flex-col items-center gap-2 border-r border-nera-gold/15 px-2 py-5 text-center">
                <ShieldCheck
                  size={19}
                  strokeWidth={1.3}
                  className="text-nera-gold"
                />

                <p className="text-[8px] uppercase tracking-[0.12em] text-nera-espresso/50 sm:text-[9px]">
                  Trusted Quality
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 border-r border-nera-gold/15 px-2 py-5 text-center">
                <Truck
                  size={19}
                  strokeWidth={1.3}
                  className="text-nera-gold"
                />

                <p className="text-[8px] uppercase tracking-[0.12em] text-nera-espresso/50 sm:text-[9px]">
                  Careful Delivery
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 px-2 py-5 text-center">
                <MessageCircle
                  size={19}
                  strokeWidth={1.3}
                  className="text-nera-gold"
                />

                <p className="text-[8px] uppercase tracking-[0.12em] text-nera-espresso/50 sm:text-[9px]">
                  Expert Support
                </p>
              </div>

            </div>

          </div>

          {/* ================= SUMMARY ================= */}

          <aside className="lg:sticky lg:top-28">

            <div className="border border-nera-gold/20 bg-nera-white">

              {/* Summary Header */}

              <div className="border-b border-nera-gold/15 px-6 py-5 sm:px-7">

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-nera-gold">
                  Order summary
                </p>

                <h2 className="mt-2 font-serif text-2xl text-nera-wine">
                  Your order
                </h2>

              </div>

              {/* Summary Content */}

              <div className="px-6 py-6 sm:px-7">

                <div className="space-y-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-nera-espresso/50">
                      Subtotal
                    </span>

                    <span className="font-medium text-nera-espresso">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-nera-espresso/50">
                        You save
                      </span>

                      <span className="font-medium text-nera-gold">
                        − ₹{savings.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-nera-gold/15 pb-5 text-sm">
                    <span className="text-nera-espresso/50">
                      Delivery
                    </span>

                    <span className="text-xs text-nera-espresso/45">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-1">

                    <div>
                      <p className="font-serif text-xl text-nera-wine">
                        Total
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-nera-espresso/35">
                        Inclusive of applicable taxes
                      </p>
                    </div>

                    <p className="text-xl font-medium text-nera-espresso">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

                {/* Checkout */}

                <Link
                  href="/checkout"
                  className="flex w-full items-center my-5 justify-center gap-3 bg-nera-wine px-5 py-4 text-xs font-medium uppercase tracking-[0.16em] text-nera-white transition hover:bg-nera-espresso"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} strokeWidth={1.5} />
                </Link>

                <p className="mt-4 text-center text-[9px] leading-5 text-nera-espresso/40">
                  No online payment required. Our team will
                  confirm your order personally.
                </p>

              </div>

            </div>

            {/* HELP CARD */}

            <div className="mt-4 border border-nera-gold/20 bg-nera-sand/50 p-5">

              <p className="text-[9px] uppercase tracking-[0.18em] text-nera-gold">
                Need help choosing?
              </p>

              <p className="mt-2 font-serif text-lg text-nera-wine">
                Speak with a Saree Expert
              </p>

              <p className="mt-2 text-xs leading-5 text-nera-espresso/50">
                Need help with colour, weave, occasion or styling?
                We are happy to guide you.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.14em] text-nera-wine"
              >
                Talk to us
                <ArrowRight size={13} />
              </Link>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}