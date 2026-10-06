const principles = [
  {
    number: "01",
    title: "Respect the Craft",
    description:
      "We value the skill, patience, and traditions behind every weave and every detail.",
  },
  {
    number: "02",
    title: "Choose with Care",
    description:
      "Our collections are thoughtfully curated so every saree has a reason to be here.",
  },
  {
    number: "03",
    title: "Keep It Personal",
    description:
      "Finding the right saree is personal. We believe guidance should feel warm, simple, and human.",
  },
  {
    number: "04",
    title: "Make Tradition Relevant",
    description:
      "We bring the beauty of traditional silk into a modern and effortless shopping experience.",
  },
];

export default function PhilosophySection() {
  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
            What We Believe
          </p>

          <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-espresso sm:text-4xl lg:text-5xl">
            Tradition is not meant
            <span className="block text-nera-wine">
              to stand still.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-nera-espresso/55 sm:text-base">
            We believe heritage becomes meaningful when it continues to evolve,
            while keeping the craft and stories behind it alive.
          </p>
        </div>

        {/* Principles */}
        <div className="mt-12 grid border-t border-nera-gold/20 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {principles.map((item) => (
            <div
              key={item.number}
              className="group border-b border-nera-gold/20 px-5 py-8 sm:px-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-9 lg:last:border-r-0"
            >
              <span className="text-[10px] tracking-[0.18em] text-nera-gold">
                {item.number}
              </span>

              <h3 className="mt-5 font-serif text-xl text-nera-espresso transition-colors duration-300 group-hover:text-nera-wine">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-nera-espresso/50">
                {item.description}
              </p>

              <div className="mt-6 h-px w-8 bg-nera-gold/50 transition-all duration-300 group-hover:w-14" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}