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
    <section className="bg-nera-white py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            The Deera promise
          </p>

          <h2 className="font-serif text-3xl font-normal leading-[1.1] text-nera-wine sm:text-4xl lg:text-5xl">
            Chosen with care.
            <span className="block text-nera-espresso">
              Made to be remembered.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-nera-espresso/60">
            We believe buying a silk saree should be as meaningful as wearing
            one. Every part of the experience is designed with that thought.
          </p>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-1 border-t border-nera-gold/25 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <article
              key={item.number}
              className={`group border-b border-nera-gold/25 px-6 py-8 sm:py-10 lg:border-b-0 lg:px-7 ${
                index !== 3 ? "lg:border-r lg:border-nera-gold/25" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="font-serif text-2xl text-nera-gold/70">
                  {item.number}
                </span>

                <span className="text-sm text-nera-gold transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="mt-8 font-serif text-xl text-nera-wine">
                {item.title}
              </h3>

              <p className="mt-3 text-xs leading-6 text-nera-espresso/55">
                {item.description}
              </p>

              <div className="mt-6 h-px w-8 bg-nera-gold transition-all duration-500 group-hover:w-14" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
