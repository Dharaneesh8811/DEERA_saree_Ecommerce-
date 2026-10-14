const trustItems = [
  {
    number: "01",
    title: "Curated Silks",
    description:
      "Every saree is selected with attention to craft, character, and timeless appeal.",
  },
  {
    number: "02",
    title: "Craftsmanship",
    description:
      "Discover traditional weaving techniques and details that give every silk its identity.",
  },
  {
    number: "03",
    title: "Personal Guidance",
    description:
      "Need help choosing? Our saree experts are here to guide you through your selection.",
  },
  {
    number: "04",
    title: "Thoughtful Service",
    description:
      "From discovery to order confirmation, we keep your shopping experience simple and personal.",
  },
];

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-[#F5F0E8] py-20 sm:py-24 lg:py-32">
      
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-nera-gold/10" />

      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full border border-nera-gold/10" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-nera-wine/[0.025]" />

      <div className="nera-container relative">

        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16 lg:mb-20">

          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-nera-gold/50" />

            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-nera-gold">
              The Deera Promise
            </p>

            <span className="h-px w-12 bg-nera-gold/50" />
          </div>

          <h2 className="font-serif text-3xl font-normal leading-[1.08] text-nera-wine sm:text-4xl lg:text-5xl">
            Chosen with care.
            <span className="mt-2 block text-nera-espresso/75">
              Made to be remembered.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-nera-espresso/55 sm:text-[15px]">
            We believe buying a silk saree should feel as meaningful as
            wearing one. Every detail of the Deera experience is designed
            with that thought.
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-2 gap-px overflow-hidden border border-nera-gold/20 bg-nera-gold/20 sm:grid-cols-2 lg:grid-cols-4">

          {trustItems.map((item) => (
            <article
              key={item.number}
              className="group relative min-h-[280px] bg-[#F8F4ED] px-7 py-9 transition-all duration-500 hover:bg-[#EFE7DA] sm:px-8 sm:py-10 lg:min-h-[320px] lg:px-9 lg:py-11"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-nera-gold/[0.07] via-transparent to-nera-wine/[0.025] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative flex h-full flex-col">

                {/* Number + Arrow */}
                <div className="flex items-start justify-between">

                  <span className="font-serif text-3xl font-normal leading-none text-nera-gold/40 transition-colors duration-500 group-hover:text-nera-gold">
                    {item.number}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-nera-gold/20 text-sm text-nera-gold/60 transition-all duration-500 group-hover:translate-x-1 group-hover:border-nera-gold/60 group-hover:text-nera-gold">
                    →
                  </span>
                </div>

                {/* Content */}
                <div className="mt-auto">

                  <div className="mb-5 h-px w-8 bg-nera-gold/50 transition-all duration-500 group-hover:w-16 group-hover:bg-nera-gold" />

                  <h3 className="font-serif text-xl font-normal text-nera-wine sm:text-[22px]">
                    {item.title}
                  </h3>

                  <p className="mt-4 max-w-xs text-xs leading-6 text-nera-espresso/55 sm:text-[13px]">
                    {item.description}
                  </p>

                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom statement */}
        <div className="mt-12 flex flex-col items-center justify-center sm:mt-14">

          <div className="mb-5 h-px w-16 bg-nera-gold/40" />

          <p className="font-serif text-sm italic text-nera-wine/70 sm:text-base">
            Tradition woven into every experience.
          </p>

          <p className="mt-2 text-[9px] uppercase tracking-[0.24em] text-nera-espresso/35">
            Deera Silks
          </p>

        </div>
      </div>
    </section>
  );
}