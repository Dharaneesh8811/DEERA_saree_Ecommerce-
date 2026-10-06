"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const handleWhatsApp = () => {
    if (!phoneNumber) {
      alert("WhatsApp number is not configured yet.");
      return;
    }

    const message = encodeURIComponent(
      "Hi Deera Silk, I would like to know more about your silk sarees.",
    );

    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <button
      type="button"
      onClick={handleWhatsApp}
      aria-label="Chat with Deera Silk on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-nera-wine text-nera-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-nera-espresso hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <MessageCircle size={24} strokeWidth={1.7} />
    </button>
  );
}
