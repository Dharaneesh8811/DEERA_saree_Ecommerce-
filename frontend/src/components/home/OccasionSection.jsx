import Link from "next/link";

const occasions = [
  {
    title: "Weddings",
    subtitle: "For the moments that stay with you",
    image: "/images/occasions/weddings.jpg",
    occasion: "Wedding",
  },
  {
    title: "Festive",
    subtitle: "Celebrate in colour and silk",
    image: "/images/occasions/festive.jpg",
    occasion: "Festive",
  },
  {
    title: "Everyday",
    subtitle: "Elegance without the occasion",
    image: "/images/occasions/everyday.jpg",
    occasion: "Everyday",
  },
  {
    title: "Gifting",
    subtitle: "Something meaningful to give",
    image: "/images/occasions/gifting.jpg",
    occasion: "Gifting",
  },
];

export default function OccasionSection() {
  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        {/* Heading */}

        <div className="mb-10 text-center sm:mb-12">

          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-nera-gold">
            Find your moment
          </p>

          <h2 className="font-serif text-4xl font-normal text-nera-wine sm:text-5xl lg:text-6xl">
            Made for the moments that matter.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-nera-espresso/60">
            Whether it is a wedding, a celebration, a quiet everyday moment,
            or a thoughtful gift, find a silk made for it.
          </p>

        </div>

        {/* Occasion Cards */}

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {occasions.map((occasion) => (
            <Link
              key={occasion.title}
              href={`/collections/occasion?type=${encodeURIComponent(
                occasion.occasion
              )}`}
              className="group"
            >
              <article className="relative overflow-hidden">

                <div className="relative aspect-[3/4] overflow-hidden bg-nera-sand">

                  <img
                    src={occasion.image}
                    alt={occasion.title}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-nera-espresso/75 via-nera-espresso/15 to-transparent" />

                  <div className="pointer-events-none absolute inset-3 border border-nera-gold/40 transition-all duration-500 group-hover:inset-4 group-hover:border-nera-gold/70" />

                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">

                    <h3 className="font-serif text-xl text-nera-white sm:text-2xl">
                      {occasion.title}
                    </h3>

                    <p className="mt-2 max-w-[190px] text-[10px] leading-5 text-nera-white/70 sm:text-xs">
                      {occasion.subtitle}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-nera-white/80">
                      Explore

                      <span className="text-nera-gold transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>

                  </div>
                </div>

                <div className="h-[2px] w-0 bg-nera-gold transition-all duration-500 group-hover:w-full" />

              </article>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}