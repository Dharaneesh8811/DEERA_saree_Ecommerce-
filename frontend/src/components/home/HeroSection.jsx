import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative min-h-[620px] w-full md:min-h-[680px] lg:min-h-[720px]">

        <img
          src="/images/home/hero-saree.png"
          alt="Elegant silk saree showcasing traditional South Indian craftsmanship"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Dark / warm overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#241A18]/75 via-[#241A18]/35 to-transparent" />

        {/* Gold subtle frame */}
        <div className="pointer-events-none absolute inset-4 border border-[#C6A15B]/50 md:inset-6" />

        {/* Content */}
        <div className="nera-container relative z-10 flex min-h-[620px] items-center md:min-h-[680px] lg:min-h-[720px]">
          <div className="max-w-xl py-16 text-[#FFFDF8]">

            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#C6A15B]">
              South Indian Silk · Curated with Care
            </p>

            <h1 className="font-serif text-5xl font-normal leading-[1.05] sm:text-6xl lg:text-7xl">
              Women with heritage.
              <span className="mt-2 block text-[#FFFDF8]">
                Chosen for your moment.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#FFFDF8]/80 sm:text-base">
              Discover timeless silk sarees rooted in craftsmanship,
              reimagined for the way you celebrate today.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/collections"
                className="inline-flex min-h-12 items-center justify-center bg-[#651B2E] px-7 text-xs font-medium uppercase tracking-[0.12em] text-[#FFFDF8] transition hover:bg-[#241A18]"
              >
                Explore Collection
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center border border-[#FFFDF8]/60 bg-[#FFFDF8]/10 px-7 text-xs font-medium uppercase tracking-[0.12em] text-[#FFFDF8] backdrop-blur-sm transition hover:bg-[#FFFDF8] hover:text-[#651B2E]"
              >
                Talk to a Saree Expert
              </Link>

            </div>

            {/* Trust Details */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#FFFDF8]/20 pt-5">

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                Handpicked Silks
              </span>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                Authentic Craft
              </span>

              <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                Saree Expert Support
              </span>

            </div>
          </div>
        </div>

        {/* Bottom label
        <div className="absolute bottom-7 right-8 z-20 hidden text-right md:block">
          <p className="text-[9px] uppercase tracking-[0.22em] text-[#FFFDF8]/60">
            Nera Silk
          </p>

          <p className="mt-1 font-serif text-xl text-[#FFFDF8]">
            Heritage, Reimagined.
          </p>
        </div> */}

      </div>
    </section>
  );
}
