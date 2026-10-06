import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="bg-nera-sand py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          {/* Small Image */}
          <div className="mx-auto w-full max-w-[380px]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/about/about-hero.png"
                alt="Silk saree craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 380px"
              />

              <div className="pointer-events-none absolute inset-4 border border-nera-gold/50" />
            </div>
          </div>

          {/* Story */}
          <div className="max-w-2xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              The Deera Story
            </p>

            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-espresso sm:text-4xl lg:text-5xl">
              A love for silk,
              <span className="block text-nera-wine">
                woven into every detail.
              </span>
            </h2>

            <div className="mt-6 h-px w-14 bg-nera-gold" />

            <div className="mt-7 space-y-5 text-sm leading-7 text-nera-espresso/60 sm:text-base">
              <p>
                Deera Silk was created with a simple thought — discovering a
                beautiful saree should feel as meaningful as wearing one.
              </p>

              <p>
                Indian silk carries generations of craftsmanship, regional
                traditions, and stories passed from one loom to another. We
                wanted to bring that richness into a modern shopping experience
                without losing the character behind the craft.
              </p>

              <p>
                From timeless Kanchipuram silks to elegant Banarasi weaves and
                contemporary everyday pieces, we carefully curate collections
                for different moments, styles, and celebrations.
              </p>

              <p>
                Every saree has its own character. Our role is to help you
                discover the one that feels right for your moment.
              </p>
            </div>

            {/* Closing statement */}
            <div className="mt-8 border-l border-nera-gold pl-5">
              <p className="font-serif text-lg italic leading-7 text-nera-wine sm:text-xl">
                “Tradition gives us the story. We bring it closer to you.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
