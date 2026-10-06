"use client";

import { MessageCircle } from "lucide-react";

export default function ProductWhatsAppButton({ product }) {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const handleWhatsApp = () => {
    if (!phoneNumber || !product) {
      alert("WhatsApp is not configured yet.");
      return;
    }

    const productUrl =
      typeof window !== "undefined" ? window.location.href : "";

    const message = [
      `Hi Deera Silk, I'm interested in this saree:`,
      ``,
      `${product.name}`,
      `Price: ₹${Number(product.sellingPrice).toLocaleString("en-IN")}`,
      ``,
      `Product: ${productUrl}`,
      ``,
      `Could you please help me with this product?`,
    ].join("\n");

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      disabled={!product}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-nera-gold/30 bg-nera-white px-5 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:border-nera-wine hover:bg-nera-sand disabled:cursor-not-allowed disabled:opacity-50"
    >
      <MessageCircle size={17} strokeWidth={1.5} />
      Ask About This Saree
    </button>
  );
}
