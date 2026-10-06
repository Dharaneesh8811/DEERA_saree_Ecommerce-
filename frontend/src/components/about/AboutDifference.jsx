const differences = [
  {
    number: "01",
    title: "Thoughtfully Curated",
    description:
      "We focus on bringing together sarees with distinctive colours, weaves, textures, and character rather than simply filling a catalogue.",
  },
  {
    number: "02",
    title: "Craft Comes First",
    description:
      "The story behind the silk matters. We celebrate the traditional techniques and details that give every saree its identity.",
  },
  {
    number: "03",
    title: "Guidance When You Need It",
    description:
      "Not sure what to choose? Our saree experts can help you explore options based on your occasion, style, colour, and budget.",
  },
  {
    number: "04",
    title: "A Modern Experience",
    description:
      "From discovering a collection to getting personal assistance, we keep the experience simple, thoughtful, and easy to navigate.",
  },
];

export default function AboutDifference() {
  return (
    <section className="bg-nera-sand py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        {/* Intro */}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              The Deera Difference
            </p>

            <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-espresso sm:text-4xl lg:text-5xl">
              More than a
              <span className="block text-nera-wine">saree collection.</span>
            </h2>
          </div>

          <div className="max-w-xl lg:pt-8">
            <p className="text-sm leading-7 text-nera-espresso/60 sm:text-base">
              We believe choosing a saree should be about more than scrolling
              through products. It should be about discovering craftsmanship,
              finding something that feels right, and having someone to guide
              you when you need it.
            </p>
          </div>
        </div>

        {/* Difference list */}
        <div className="mt-12 border-t border-nera-gold/25 lg:mt-16">
          {differences.map((item) => (
            <div
              key={item.number}
              className="grid gap-4 border-b border-nera-gold/25 py-7 sm:grid-cols-[70px_220px_1fr] sm:items-start sm:gap-6 sm:py-8"
            >
              <span className="text-[10px] tracking-[0.2em] text-nera-gold">
                {item.number}
              </span>

              <h3 className="font-serif text-xl text-nera-espresso">
                {item.title}
              </h3>

              <p className="max-w-2xl text-sm leading-6 text-nera-espresso/50">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
