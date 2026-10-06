export default function BlogsHero() {
  return (
    <section className="bg-nera-espresso">
      <div className="nera-container">
        <div className="py-14 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
              <span className="h-px w-8 bg-nera-gold" />
              The Journal
            </p>

            <h1 className="mt-5 font-serif text-4xl font-normal leading-[1.08] text-nera-white sm:text-5xl lg:text-6xl">
              Stories woven
              <span className="block text-nera-rose">
                beyond the saree.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-nera-white/55 sm:text-base">
              Discover the stories, traditions, craftsmanship, and thoughtful
              details behind the world of Indian silk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}