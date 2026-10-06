const journey = [
  {
    number: "01",
    title: "The Craft",
    description:
      "Every silk begins with skilled hands, traditional techniques, and a story shaped on the loom.",
  },
  {
    number: "02",
    title: "The Curation",
    description:
      "We look beyond trends to discover colours, textures, weaves, and details worth bringing together.",
  },
  {
    number: "03",
    title: "The Discovery",
    description:
      "We make it easier to explore silk collections and find something that feels naturally yours.",
  },
  {
    number: "04",
    title: "Your Moment",
    description:
      "A wedding, celebration, gift, or everyday ritual — the final chapter belongs to you.",
  },
];

export default function SilkJourney() {
  return (
    <section className="bg-nera-wine py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        {/* Heading */}
        <div className="max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
            The Silk Journey
          </p>

          <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-white sm:text-4xl lg:text-5xl">
            From the loom
            <span className="block text-nera-rose">
              to your moment.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-nera-white/55 sm:text-base">
            Every saree travels through a story of craftsmanship, thoughtful
            selection, and discovery before becoming part of yours.
          </p>
        </div>

        {/* Journey */}
        <div className="mt-12 border-t border-nera-gold/25 lg:mt-16">
          <div className="grid lg:grid-cols-4">
            {journey.map((item, index) => (
              <div
                key={item.number}
                className={`relative border-b border-nera-gold/20 px-1 py-8 sm:px-4 lg:border-b-0 lg:px-7 lg:py-10 ${
                  index !== journey.length - 1
                    ? "lg:border-r lg:border-nera-gold/20"
                    : ""
                }`}
              >
                <span className="text-[10px] tracking-[0.2em] text-nera-gold">
                  {item.number}
                </span>

                <h3 className="mt-5 font-serif text-2xl font-normal text-nera-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-nera-white/50">
                  {item.description}
                </p>

                {/* Progress line */}
                <div className="mt-7 h-px w-10 bg-nera-gold/60" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}