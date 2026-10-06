import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AboutCTA() {
  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        <div className="relative overflow-hidden bg-nera-wine">
          
          {/* Gold border */}
          <div className="pointer-events-none absolute inset-4 border border-nera-gold/25 sm:inset-6" />

          <div className="relative px-7 py-14 text-center sm:px-12 sm:py-16 lg:px-20 lg:py-20">
            
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              Continue the journey
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-normal leading-tight text-nera-white sm:text-4xl lg:text-5xl">
              Find a silk that feels
              <span className="block text-nera-rose">
                like yours.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-nera-white/55 sm:text-base">
              Explore our thoughtfully curated collections and discover
              timeless silks chosen for weddings, celebrations, gifting,
              and everyday elegance.
            </p>

            <Link
              href="/collections"
              className="group mx-auto mt-8 flex min-h-14 w-fit items-center gap-3 bg-nera-white px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso"
            >
              Explore the Collection

              <ArrowUpRight
                size={15}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}