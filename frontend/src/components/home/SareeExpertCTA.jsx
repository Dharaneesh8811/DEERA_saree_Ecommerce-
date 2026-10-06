import Link from "next/link";
import { MessageCircle, ArrowUpRight } from "lucide-react";

export default function SareeExpertCTA() {
  return (
    <section className="bg-nera-sand py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        <div className="relative overflow-hidden bg-nera-wine">

          {/* Decorative border */}
          <div className="pointer-events-none absolute inset-4 border border-nera-gold/25 sm:inset-6" />

          <div className="relative grid items-center gap-10 px-7 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-16 lg:py-20">

            {/* Content */}
            <div className="max-w-2xl">

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                Personal guidance
              </p>

              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-white sm:text-4xl lg:text-5xl">
                Tell us what you
                <span className="block text-nera-rose">
                  have in mind.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-nera-white/60 sm:text-base">
                Whether you're shopping for a wedding, festive celebration,
                everyday elegance, or a meaningful gift, we're happy to help
                you explore the possibilities.
              </p>

            </div>

            {/* CTA */}
            <div className="lg:min-w-[250px]">

              <Link
                href="/contact"
                className="group flex min-h-14 items-center justify-center gap-3 bg-nera-white px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso"
              >
                {/* <MessageCircle
                  size={17}
                  strokeWidth={1.4}
                /> */}

                Talk to a Saree Expert

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.16em] text-nera-white/35">
                We're here to help
              </p>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}