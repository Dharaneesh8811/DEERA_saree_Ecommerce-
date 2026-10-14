"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MessageCircle,
  Mail,
  ArrowUpRight,
  Send,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

export default function ContactPage() {
  const whatsappNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  ).replace(/\D/g, "");

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  const whatsappMessage = encodeURIComponent(
    "Hello Deera Silks! I'd like help choosing a silk saree."
  );

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : contactEmail
      ? `mailto:${contactEmail}`
      : "#contact-form";

  const contactOptions = [
    {
      number: "01",
      icon: MessageCircle,
      title: "WhatsApp Shopping",
      description:
        "Share your occasion, preferred colour, style, or budget and speak directly with our saree expert.",
      action: "Chat on WhatsApp",
      href: whatsappHref,
      external: Boolean(whatsappNumber),
    },
    {
      number: "02",
      icon: Mail,
      title: "Email Our Team",
      description:
        "Have a question about a saree, an order, or a special request? Send us an email and our team will assist you.",
      action: "Send an Email",
      href: contactEmail ? `mailto:${contactEmail}` : "#contact-form",
      external: false,
    },
  ];

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formStatus !== "idle") {
      setFormStatus("idle");
      setFeedback("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!apiUrl) {
      setFormStatus("error");
      setFeedback(
        "Contact form configuration is missing. Please contact us through WhatsApp or email."
      );
      return;
    }

    setFormStatus("submitting");
    setFeedback("");

    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          typeof result.detail === "string"
            ? result.detail
            : "Please check your details and try again.";

        throw new Error(detail);
      }

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setFormStatus("success");
      setFeedback(
        "Thank you for contacting Deera Silks. Your message has been submitted successfully."
      );
    } catch (error) {
      setFormStatus("error");
      setFeedback(
        error.message ||
          "We couldn't submit your message. Please try again or contact us through WhatsApp."
      );
    }
  }

  return (
    <main className="min-h-screen bg-nera-ivory">
      {/* HERO */}
      <section className="relative overflow-hidden bg-nera-espresso">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-nera-gold/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-nera-gold/10" />

        <div className="nera-container">
          <div className="grid min-h-[520px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div className="relative z-10 max-w-3xl">
              <div className="mb-6 flex items-center gap-4">
                <span className="h-px w-10 bg-nera-gold" />
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
                  Saree consultation
                </p>
              </div>

              <h1 className="font-serif text-5xl font-normal leading-[0.98] text-nera-white sm:text-6xl lg:text-7xl">
                Let us help you
                <span className="mt-2 block text-nera-rose">
                  find the right silk.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-7 text-nera-white/55 sm:text-base">
                Choosing a saree can be personal. Tell us about the
                occasion, colour, style, or budget you have in mind,
                and our saree experts will help you discover a piece
                that feels right.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                <span className="text-[9px] uppercase tracking-[0.18em] text-nera-white/45">
                  Personal guidance
                </span>
                <span className="h-1 w-1 rounded-full bg-nera-gold/70" />
                <span className="text-[9px] uppercase tracking-[0.18em] text-nera-white/45">
                  WhatsApp shopping
                </span>
                <span className="h-1 w-1 rounded-full bg-nera-gold/70" />
                <span className="text-[9px] uppercase tracking-[0.18em] text-nera-white/45">
                  Email support
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -right-8 -top-8 h-64 w-64 border border-nera-gold/20" />

              <div className="relative ml-auto max-w-sm border border-nera-gold/30 bg-nera-white/[0.03] p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-nera-gold/50">
                    “
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-nera-gold">
                    Deera Silks
                  </span>
                </div>

                <p className="mt-4 font-serif text-2xl leading-relaxed text-nera-white">
                  The right saree should feel like it was chosen just for you.
                </p>

                <div className="mt-8 h-px w-12 bg-nera-gold" />

                <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-nera-white/40">
                  Personal saree guidance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="bg-nera-white py-20 sm:py-24 lg:py-28">
        <div className="nera-container">
          <div className="mb-12 max-w-2xl sm:mb-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
              How can we help?
            </p>

            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-wine sm:text-4xl lg:text-5xl">
              Choose how you&apos;d like
              <span className="block text-nera-espresso">
                to connect.
              </span>
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {contactOptions.map((option) => {
              const Icon = option.icon;

              return (
                <article
                  key={option.number}
                  className="group relative flex h-full flex-col overflow-hidden border border-nera-gold/20 bg-nera-ivory p-7 transition-all duration-500 hover:-translate-y-1 hover:border-nera-gold/50 hover:shadow-luxury sm:p-8 lg:p-9"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-4xl text-nera-gold/40">
                      {option.number}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center border border-nera-gold/30 text-nera-wine transition-all duration-300 group-hover:border-nera-wine group-hover:bg-nera-wine group-hover:text-nera-white">
                      <Icon size={19} strokeWidth={1.4} />
                    </div>
                  </div>

                  <div className="mt-10 flex-1 sm:mt-14">
                    <h3 className="font-serif text-2xl text-nera-wine">
                      {option.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-nera-espresso/55">
                      {option.description}
                    </p>
                  </div>

                  <a
                    href={option.href}
                    target={option.external ? "_blank" : undefined}
                    rel={
                      option.external
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-8 inline-flex w-fit items-center gap-3 border-b border-nera-gold/50 pb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:border-nera-wine"
                  >
                    {option.action}
                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.4}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </a>

                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-nera-gold transition-all duration-500 group-hover:w-full" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        id="contact-form"
        className="bg-nera-ivory py-20 sm:py-24 lg:py-28"
      >
        <div className="nera-container">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                Write to us
              </p>

              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-wine sm:text-4xl lg:text-5xl">
                Every good conversation
                <span className="block text-nera-espresso">
                  starts somewhere.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-nera-espresso/60">
                Send us your question about our silk sarees, orders,
                delivery, or special requests. Our team will be able
                to review your enquiry.
              </p>

              <div className="mt-9 h-px w-16 bg-nera-gold" />

              <p className="mt-5 text-[10px] uppercase tracking-[0.18em] text-nera-espresso/45">
                Personal attention · Thoughtful service
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="border border-nera-gold/25 bg-nera-white p-6 shadow-luxury sm:p-9 lg:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-nera-wine"
                  >
                    Your name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    minLength={2}
                    maxLength={150}
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full border border-nera-gold/25 bg-nera-ivory px-4 py-3.5 text-sm text-nera-espresso outline-none transition-colors placeholder:text-nera-espresso/35 focus:border-nera-gold"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-nera-wine"
                  >
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-nera-gold/25 bg-nera-ivory px-4 py-3.5 text-sm text-nera-espresso outline-none transition-colors placeholder:text-nera-espresso/35 focus:border-nera-gold"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-nera-wine"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  minLength={2}
                  maxLength={200}
                  required
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What would you like to know?"
                  className="w-full border border-nera-gold/25 bg-nera-ivory px-4 py-3.5 text-sm text-nera-espresso outline-none transition-colors placeholder:text-nera-espresso/35 focus:border-nera-gold"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-nera-wine"
                >
                  Your message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  minLength={10}
                  maxLength={5000}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  className="w-full resize-y border border-nera-gold/25 bg-nera-ivory px-4 py-3.5 text-sm leading-7 text-nera-espresso outline-none transition-colors placeholder:text-nera-espresso/35 focus:border-nera-gold"
                />
                <p className="mt-2 text-right text-[10px] text-nera-espresso/40">
                  {form.message.length}/5000
                </p>
              </div>

              {feedback && (
                <div
                  role={formStatus === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={`mt-6 flex items-start gap-3 border p-4 text-sm leading-6 ${
                    formStatus === "success"
                      ? "border-green-700/20 bg-green-50 text-green-800"
                      : "border-red-700/20 bg-red-50 text-red-800"
                  }`}
                >
                  {formStatus === "success" && (
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0"
                    />
                  )}
                  <span>{feedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formStatus === "submitting"}
                className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 bg-nera-wine px-6 text-[10px] font-medium uppercase tracking-[0.2em] text-nera-white transition-colors duration-300 hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-60"
              >
                {formStatus === "submitting" ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending your message
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={1.5} />
                    Send your enquiry
                    <ArrowUpRight size={15} strokeWidth={1.5} />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-nera-espresso/45">
                Your details will be used to respond to your enquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* PERSONAL & BULK ORDERS */}
      <section className="bg-nera-sand py-20 sm:py-24 lg:py-28">
        <div className="nera-container">
          <div className="relative overflow-hidden bg-nera-wine">
            <div className="pointer-events-none absolute inset-4 border border-nera-gold/25 sm:inset-6" />

            <div className="relative grid gap-10 px-7 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:px-16 lg:py-20">
              <div className="max-w-2xl">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                  Personal bulk orders
                </p>

                <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-white sm:text-4xl lg:text-5xl">
                  Shopping for yourself
                  <span className="block text-nera-rose">
                    or for many?
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-nera-white/60 sm:text-base">
                  Whether you're choosing a saree for a special
                  occasion or sourcing silk sarees for a wedding,
                  boutique, event, or celebration, our team is here
                  to help.
                </p>

                <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                  {[
                    "Personal Shopping",
                    "Weddings",
                    "Boutiques",
                    "Events",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.16em] text-nera-white/45"
                    >
                      <span className="h-px w-4 bg-nera-gold/70" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:min-w-[250px]">
                <Link
                  href="/bulk-order"
                  className="group flex min-h-14 items-center justify-center gap-3 bg-nera-white px-7 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso"
                >
                  Request a Bulk Order
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.4}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                <a
                  href={whatsappHref}
                  target={whatsappNumber ? "_blank" : undefined}
                  rel={whatsappNumber ? "noopener noreferrer" : undefined}
                  className="group flex min-h-14 items-center justify-center gap-3 border border-nera-gold/40 px-7 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition-all duration-300 hover:border-nera-gold hover:bg-nera-gold hover:text-nera-espresso"
                >
                  <MessageCircle size={17} strokeWidth={1.4} />
                  Chat with an Expert
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.4}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </a>

                <p className="mt-1 text-center text-[9px] uppercase tracking-[0.16em] text-nera-white/35">
                  We're here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}