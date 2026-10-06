import Link from "next/link";

export default function SilkStory() {
  return (
    <section className="bg-nera-sand py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src="/images/home/main-image.png"
                alt="Traditional silk saree craftsmanship"
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-4 border border-nera-gold/50" />
            </div>

            {/* Small label */}
            <div className="absolute -bottom-5 right-5 bg-nera-wine px-5 py-4 sm:right-8">
              <p className="text-[9px] uppercase tracking-[0.18em] text-nera-gold">
                The Deera Team
              </p>

              <p className="mt-1 font-serif text-lg text-nera-white">
                People behind the craft.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-xl lg:pl-4">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
              The silk story
            </p>

            <h2 className="font-serif text-3xl font-normal leading-[1.1] text-nera-wine sm:text-4xl lg:text-5xl">
              Some things are not
              <span className="block text-nera-espresso">
                meant to be rushed.
              </span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-nera-espresso/65 sm:text-base">
              Every silk saree carries more than colour and pattern. It carries
              the hands, traditions, techniques, and stories that have shaped
              it.
            </p>

            <p className="mt-4 text-sm leading-7 text-nera-espresso/65 sm:text-base">
              Deera Silk brings these traditions into a modern shopping
              experience — thoughtfully curated for celebrations, milestones,
              and the moments that become memories.
            </p>

            {/* Divider */}
            <div className="my-7 h-px w-16 bg-nera-gold" />

            {/* Values */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <p className="font-serif text-lg text-nera-wine">Craft</p>
                <p className="mt-1 text-xs leading-5 text-nera-espresso/55">
                  Rooted in traditional weaving
                </p>
              </div>

              <div>
                <p className="font-serif text-lg text-nera-wine">Character</p>
                <p className="mt-1 text-xs leading-5 text-nera-espresso/55">
                  Chosen for individuality
                </p>
              </div>

              <div>
                <p className="font-serif text-lg text-nera-wine">Quality</p>
                <p className="mt-1 text-xs leading-5 text-nera-espresso/55">
                  Considered beyond the surface
                </p>
              </div>

              <div>
                <p className="font-serif text-lg text-nera-wine">Care</p>
                <p className="mt-1 text-xs leading-5 text-nera-espresso/55">
                  Guidance when you need it
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-4 border-b border-nera-gold/60 pb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-nera-wine transition-all duration-300 hover:border-nera-wine"
            >
              <span>Discover our team</span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-nera-gold/60 text-nera-gold transition-all duration-300 group-hover:translate-x-1 group-hover:bg-nera-wine group-hover:text-nera-white">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
