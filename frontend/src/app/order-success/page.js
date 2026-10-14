"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";


function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("orderNumber");
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

          {/* Premium Order Reference Card */}
          <div className="mx-auto mt-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#D8C29A]/50 bg-white shadow-[0_12px_40px_rgba(67,42,31,0.08)]">

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-[#E9DFD0] bg-[#FBF8F2] px-6 py-4">
              <div className="text-left">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#92764C]">
                  Deera Silks
                </p>
                <h2 className="mt-1 font-serif text-lg text-[#38251F]">
                  Order Confirmation
                </h2>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C29A]/60 bg-white text-[#92764C]">
                <Check size={19} strokeWidth={1.5} />
              </div>
            </div>

            {/* Order Number */}
            <div className="px-6 pb-6 pt-7 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8B8178]">
                Your Order Reference
              </p>

              <p className="mt-3 break-words font-serif text-2xl font-medium tracking-wide text-[#722F3E] sm:text-3xl">
                {orderNumber || "Order Received"}
              </p>

              <div className="mx-auto mt-4 h-px w-12 bg-[#C7A66A]" />

              {/* Status */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D9E7D8] bg-[#F3F8F1] px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-[#56845B]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#466B49]">
                  Awaiting Confirmation
                </span>
              </div>
            </div>

            {/* UUID Section */}
            {orderId && (
              <div className="mx-4 mb-4 rounded-xl border border-[#E9DFD0] bg-[#FBF9F5] p-4 sm:mx-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#8B8178]">
                    Internal Order UUID
                  </p>

                  <span className="shrink-0 rounded bg-[#EDE4D5] px-2 py-1 text-[9px] uppercase tracking-wider text-[#725D43]">
                    Reference
                  </span>
                </div>

                <p className="mt-3 break-all font-mono text-xs leading-6 text-[#51443C]">
                  {orderId}
                </p>
              </div>
            )}

            {/* Footer Note */}
            <div className="border-t border-[#E9DFD0] px-6 py-4 text-center">
              <p className="text-xs leading-6 text-[#8B8178]">
                Please keep your order reference for future enquiries.
              </p>
            </div>
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