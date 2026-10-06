"use client";

import { useState } from "react";
import Link from "next/link";

const faqSections = [
  {
    title: "Orders & Shopping",
    items: [
      {
        question: "How can I place an order?",
        answer:
          "Browse our collections, select your saree, add it to your cart, and continue to checkout. Enter your contact and delivery details and submit the order. Our team will contact you to confirm the order.",
      },
      {
        question: "Do I need to create an account to place an order?",
        answer:
          "No. You can place an order without creating a customer account. We only need your contact and delivery details to process your order.",
      },
      {
        question: "Can I order more than one saree?",
        answer:
          "Yes. You can add multiple sarees to your cart and place them together in a single order.",
      },
      {
        question: "Can I cancel my order?",
        answer:
          "If you need to cancel an order, please contact our team as soon as possible with your order details. Cancellation depends on the current status of your order.",
      },
    ],
  },

  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "Do you provide delivery across India?",
        answer:
          "Yes. DEERA Silk provides delivery services across India. Delivery availability and timing may depend on your location.",
      },
      {
        question: "How can I check my order status?",
        answer:
          "You can use the Order Status page with your order details to check the current status of your order.",
      },
      {
        question: "Will I receive confirmation after placing an order?",
        answer:
          "Yes. After you place an order, our team will review it and contact you to confirm the order and delivery details.",
      },
    ],
  },

  {
    title: "Returns & Exchange",
    items: [
      {
        question: "Can I return or exchange a saree?",
        answer:
          "Returns and exchanges are handled according to our Returns & Exchange policy. Please review the policy or contact our team before sending an item back.",
      },
      {
        question: "How do I request a return or exchange?",
        answer:
          "Please contact our team with your order details and explain the reason for the return or exchange. Our team will guide you through the next steps.",
      },
    ],
  },

  {
    title: "Sarees & Products",
    items: [
      {
        question: "Are the sarees shown on the website available for purchase?",
        answer:
          "Products shown as active in our collections are available for ordering. Availability can change, so our team will confirm the product when processing your order.",
      },
      {
        question: "Will the saree look exactly like the images?",
        answer:
          "We make every effort to show the saree accurately. However, slight variations in colour may occur depending on lighting, photography, and your display screen.",
      },
      {
        question: "Can I get help choosing a saree?",
        answer:
          "Yes. If you need help choosing a saree for a wedding, festive occasion, everyday wear, or gifting, you can contact our team for assistance.",
      },
    ],
  },

  {
    title: "Payments & Confirmation",
    items: [
      {
        question: "Can I pay online through the website?",
        answer:
          "The website does not process online payments. After you place an order, our team will contact you to confirm the order and payment arrangements.",
      },
      {
        question: "What happens after I place an order?",
        answer:
          "Your order is first placed for review. Our team checks the order details, contacts you for confirmation, and then moves the order forward for shipping.",
      },
    ],
  },
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="border-b border-[#651B2E]/10">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <span className="font-serif text-lg font-normal text-[#651B2E] sm:text-xl">
          {question}
        </span>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center border border-[#C6A15B]/40 text-[#C6A15B] transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          <span className="text-xl font-light leading-none">+</span>
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          isOpen
            ? "grid-rows-[1fr] pb-6 opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl text-sm leading-7 text-[#241A18]/65">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openItem, setOpenItem] = useState(null);

  function handleToggle(sectionIndex, itemIndex) {
    const key = `${sectionIndex}-${itemIndex}`;

    setOpenItem((current) => (current === key ? null : key));
  }

  return (
    <main className="min-h-screen bg-[#FAF6EE]">

      {/* Hero */}
      <section className="border-b border-[#651B2E]/10 bg-[#FFFDF8]">
        <div className="mx-auto max-w-nera px-6 py-16 text-center sm:py-20 lg:px-12 lg:py-24">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Help & Information
          </p>

          <h1 className="font-serif text-4xl font-normal text-[#651B2E] sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#241A18]/60">
            Everything you need to know about shopping with DEERA Silk,
            orders, delivery, returns and our sarees.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24">

        {faqSections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className="mb-14 last:mb-0"
          >
            <div className="mb-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
                {section.title}
              </p>
            </div>

            <div className="border-t border-[#651B2E]/10">
              {section.items.map((item, itemIndex) => {
                const key = `${sectionIndex}-${itemIndex}`;

                return (
                  <FAQItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openItem === key}
                    onClick={() =>
                      handleToggle(sectionIndex, itemIndex)
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-20 border border-[#C6A15B]/30 bg-[#FFFDF8] px-6 py-10 text-center sm:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Still have questions?
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal text-[#651B2E]">
            We&apos;re here to help.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#241A18]/60">
            Our team can help you find the right silk saree or answer
            questions about your order.
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-flex border border-[#651B2E] bg-[#651B2E] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#FFFDF8] transition hover:bg-[#241A18]"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}