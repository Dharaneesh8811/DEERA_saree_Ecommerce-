import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function BulkOrderCTA() {
  return (
    <section className="bg-nera-sand py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        <div className="relative overflow-hidden border border-nera-gold/25 bg-nera-white">

          {/* Decorative inner border */}
          <div className="pointer-events-none absolute inset-4 border border-nera-gold/15 sm:inset-6" />

          <div className="relative grid items-center gap-10 px-7 py-14 sm:px-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-16 lg:py-20">

            {/* Content */}
            <div className="max-w-2xl">

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                Bulk orders
              </p>

              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-wine sm:text-4xl lg:text-5xl">
                Silk for
                <span className="block text-nera-espresso">
                  every gathering.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-nera-espresso/60 sm:text-base">
                Planning a wedding, sourcing for a boutique, or preparing for
                a special celebration? Tell us what you need and our team will
                help you explore the right collection.
              </p>

              {/* Use cases */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Weddings",
                  "Boutiques",
                  "Events",
                  "Celebrations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.16em] text-nera-espresso/55"
                  >
                    <span className="h-px w-4 bg-nera-gold/70" />
                    {item}
                  </div>
                ))}
              </div>

            </div>

            {/* CTA */}
            <div className="lg:min-w-[230px]">

              <Link
                href="/bulk-order"
                className="group flex min-h-14 items-center justify-center gap-3 bg-nera-wine px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso"
              >
                Request a Bulk Order

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <p className="mt-4 text-center text-[9px] uppercase tracking-[0.16em] text-nera-espresso/35">
                Tell us what you have in mind
              </p>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}