"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";


function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const trackOrderHref = orderId
    ? `/order-status?orderId=${encodeURIComponent(orderId)}`
    : "/order-status";

  return (
    <main className="min-h-[70vh] bg-nera-ivory">
      <section className="nera-container flex min-h-[70vh] items-center justify-center py-20">
        <div className="w-full max-w-2xl text-center">

          {/* Success icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-nera-gold/40 bg-nera-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nera-wine text-nera-white">
              <Check size={25} strokeWidth={1.5} />
            </div>
          </div>

          {/* Label */}
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-nera-gold">
            Order Received
          </p>

          {/* Heading */}
          <h1 className="mt-4 font-serif text-4xl font-normal text-nera-espresso md:text-5xl">
            Thank you for choosing Deera Silk.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-nera-espresso/60">
            Your order request has been received successfully.
            Our team will review your order and contact you shortly
            through phone or WhatsApp to confirm the details.
          </p>

          {/* Order ID */}
          <div className="mx-auto mt-8 max-w-sm border border-nera-gold/25 bg-nera-white px-6 py-6">
            <p className="text-[10px] uppercase tracking-[0.18em] text-nera-espresso/50">
              Order ID
            </p>

            <p className="mt-2 font-serif text-2xl text-nera-wine">
              {orderId ? `#${orderId}` : "Order Received"}
            </p>

            <p className="mt-3 text-xs text-nera-espresso/50">
              Your order is currently under review.
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <Link
              href={trackOrderHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-nera-wine px-7 text-xs font-medium uppercase tracking-[0.12em] text-nera-white transition hover:bg-nera-espresso"
            >
              Track Order
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>

            <Link
              href="/collections"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-nera-gold/40 bg-nera-white px-7 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:bg-nera-sand"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              Continue Shopping
            </Link>

          </div>

          {/* Help */}
          <p className="mt-8 text-xs text-nera-espresso/45">
            Need help with your order?{" "}
            <Link
              href="/contact"
              className="text-nera-wine underline underline-offset-4"
            >
              Talk to us
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}
export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-nera-ivory">
          <div className="nera-container py-16 text-center">
            <p className="text-sm text-nera-espresso/50">
              Loading order confirmation...
            </p>
          </div>
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}