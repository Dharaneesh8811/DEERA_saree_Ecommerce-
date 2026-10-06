import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="bg-nera-ivory">
      <div className="nera-container">
        <div className="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8 lg:py-20">
          {/* Left Content */}
          <div className="mx-auto w-full max-w-[520px] lg:mx-0">
            <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              <span className="h-px w-8 bg-nera-gold" />
              Our Story
            </p>

            <h1 className="mt-5 font-serif text-[2.5rem] font-normal leading-[1.05] tracking-[-0.02em] text-nera-espresso sm:text-5xl lg:text-[3.5rem]">
              Rooted in heritage.
              <span className="mt-1 block text-nera-wine">
                Reimagined for today.
              </span>
            </h1>

            <p className="mt-6 max-w-[460px] text-sm leading-7 text-nera-espresso/60 sm:text-base">
              Deera Silk brings together the timeless beauty of Indian
              craftsmanship with a thoughtful, modern way of discovering silk
              sarees.
            </p>

            <p className="mt-3 max-w-[460px] text-sm leading-7 text-nera-espresso/50">
              Every collection is chosen with care — celebrating the weaves,
              details, and traditions that make each saree feel distinctive.
            </p>

            {/* Small editorial detail */}
            <div className="mt-7 flex items-center gap-4">
              <span className="h-px w-12 bg-nera-gold/60" />

              <span className="text-[9px] uppercase tracking-[0.2em] text-nera-espresso/40">
                Heritage · Craft · Story
              </span>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-center">
            <div className="relative w-full max-w-[480px] sm:max-w-[520px]">
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/about/brand-story.png"
                  alt="Nera Silk saree craftsmanship"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 90vw, 420px"
                />

                {/* Gold frame */}
                <div className="pointer-events-none absolute inset-4 border border-nera-gold/50" />
              </div>

              {/* Floating label */}
              <div className="absolute -bottom-5 -left-5 bg-nera-wine px-6 py-4 sm:-left-7">
                <p className="text-[8px] uppercase tracking-[0.22em] text-nera-gold">
                  Deera Silk
                </p>

                <p className="mt-1 font-serif text-sm text-nera-white">
                  Heritage, Reimagined
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
