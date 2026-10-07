import Link from "next/link";
import {
  MessageCircle,
  Phone,
  Video,
  MapPin,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

const contactOptions = [
  {
    number: "01",
    icon: MessageCircle,
    title: "WhatsApp Shopping",
    description:
      "Share your occasion, preferred colour, style, or budget and speak directly with our saree expert.",
    action: "Chat on WhatsApp",
    href: "#",
  },
  {
    number: "02",
    icon: Phone,
    title: "Speak to an Expert",
    description:
      "Have a question about a saree? Call our team and let us help you make the right choice.",
    action: "Call Us",
    href: "tel:+910000000000",
  },
  {
    number: "03",
    icon: Video,
    title: "Video Consultation",
    description:
      "Want a closer look before deciding? Arrange a personal video consultation with our team.",
    action: "Request a Video Call",
    href: "#",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-nera-ivory">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-nera-espresso">

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-nera-gold/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-nera-gold/10" />

        <div className="nera-container">
          <div className="grid min-h-[520px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">

            {/* Hero content */}
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
                Choosing a saree can be personal. Tell us about the occasion,
                colour, style, or budget you have in mind, and our saree
                experts will help you discover a piece that feels right.
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
                  Video consultation
                </span>
              </div>

            </div>

            {/* Decorative consultation card */}
            <div className="relative hidden lg:block">

              <div className="absolute -right-8 -top-8 h-64 w-64 border border-nera-gold/20" />

              <div className="relative ml-auto max-w-sm border border-nera-gold/30 bg-nera-white/[0.03] p-8 backdrop-blur-sm">

                <div className="flex items-center justify-between">
                  <span className="font-serif text-5xl text-nera-gold/50">
                    “
                  </span>

                  <span className="text-[9px] uppercase tracking-[0.2em] text-nera-gold">
                    Deera Silk
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


      {/* =========================================================
          CONTACT OPTIONS
      ========================================================= */}
      <section className="bg-nera-white py-20 sm:py-24 lg:py-28">
        <div className="nera-container">

          <div className="mb-12 max-w-2xl sm:mb-16">

            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
              How can we help?
            </p>

            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-wine sm:text-4xl lg:text-5xl">
              Choose how you'd like
              <span className="block text-nera-espresso">
                to connect.
              </span>
            </h2>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            {contactOptions.map((option) => {
              const Icon = option.icon;

              return (
                <article
                  key={option.number}
                  className="group relative overflow-hidden border border-nera-gold/20 bg-nera-ivory p-7 transition-all duration-500 hover:-translate-y-1 hover:border-nera-gold/50 hover:shadow-luxury sm:p-8 lg:p-9"
                >

                  {/* Number */}
                  <div className="flex items-start justify-between">

                    <span className="font-serif text-4xl text-nera-gold/40">
                      {option.number}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center border border-nera-gold/30 text-nera-wine transition-all duration-300 group-hover:border-nera-wine group-hover:bg-nera-wine group-hover:text-nera-white">
                      <Icon size={19} strokeWidth={1.4} />
                    </div>

                  </div>


                  <div className="mt-14">

                    <h3 className="font-serif text-2xl text-nera-wine">
                      {option.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-nera-espresso/55">
                      {option.description}
                    </p>

                  </div>


                  <Link
                    href={option.href}
                    className="mt-8 inline-flex items-center gap-3 border-b border-nera-gold/50 pb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:border-nera-wine"
                  >
                    {option.action}

                    <ArrowUpRight
                      size={14}
                      strokeWidth={1.4}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </Link>


                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-nera-gold transition-all duration-500 group-hover:w-full" />

                </article>
              );
            })}

          </div>

        </div>
      </section>


      {/* =========================================================
          PERSONAL & BULK ORDERS
      ========================================================= */}
      <section className="bg-nera-sand py-20 sm:py-24 lg:py-28">
        <div className="nera-container">

          <div className="relative overflow-hidden bg-nera-wine">

            {/* Decorative border */}
            <div className="pointer-events-none absolute inset-4 border border-nera-gold/25 sm:inset-6" />

            <div className="relative grid gap-10 px-7 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16 lg:px-16 lg:py-20">

              {/* Content */}
              <div className="max-w-2xl">

                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                  Personal & bulk orders
                </p>

                <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-white sm:text-4xl lg:text-5xl">
                  Shopping for yourself
                  <span className="block text-nera-rose">
                    or for many?
                  </span>
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-nera-white/60 sm:text-base">
                  Whether you're choosing a saree for a special occasion or
                  sourcing silk sarees for a wedding, boutique, event, or
                  celebration, our team is here to help.
                </p>

                {/* Order types */}
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

              {/* Actions */}
              <div className="flex flex-col gap-4 lg:min-w-[250px]">


                {/* Bulk order */}
                <Link
                  href="/bulk-order"
                  className="group flex min-h-14 items-center justify-center gap-3 bg-nera-white px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso"
                >
                  Request a Bulk Order

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.4}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

                {/* Personal consultation */}
                <Link
                  href="#"
                  className="group flex min-h-14 items-center justify-center gap-3 border border-nera-gold/40 px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition-all duration-300 hover:border-nera-gold hover:bg-nera-gold hover:text-nera-espresso"
                >
                  <MessageCircle
                    size={17}
                    strokeWidth={1.4}
                  />

                  Chat with an Expert

                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.4}
                    className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </Link>

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