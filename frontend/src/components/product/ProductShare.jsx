"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

export default function ProductShare({ product }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!product) return;

    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this saree from Deera Silk: ${product.name}`,
          url,
        });
      } catch (error) {
        // User cancelled the share sheet.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      alert("Unable to copy the product link.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={!product}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-nera-gold/30 bg-nera-white px-5 text-xs font-medium uppercase tracking-[0.12em] text-nera-wine transition hover:border-nera-wine hover:bg-nera-sand disabled:cursor-not-allowed disabled:opacity-50"
    >
      {copied ? (
        <>
          <Check size={17} strokeWidth={1.5} />
          Link Copied
        </>
      ) : navigator.share ? (
        <>
          <Share2 size={17} strokeWidth={1.5} />
          Share This Saree
        </>
      ) : (
        <>
          <Copy size={17} strokeWidth={1.5} />
          Copy Product Link
        </>
      )}
    </button>
  );
}
