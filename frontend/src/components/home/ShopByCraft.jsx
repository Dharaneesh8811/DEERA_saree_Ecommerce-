"use client";

import Link from "next/link";
import useStorefrontCatalog from "@/hooks/useStorefrontCatalog";

const defaultCraftImage = "/images/crafts/default.jpg";

export default function ShopByCraft() {
  const { categories } = useStorefrontCatalog();

  const crafts = categories
    .filter((category) => category.is_active)
    .slice(0, 7)
    .map((category) => ({
      id: category.id,
      name: category.name,
      productType: category.product_type,
      saree: category.saree,
      subtitle:
        category.description ||
        `${category.product_type} · ${category.saree}`,
      image: category.image_url || defaultCraftImage,
      href: `/collections/${category.id}`,
    }));

  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">

        {/* Heading */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-nera-gold">
            Explore the craft
          </p>

          <h2 className="font-serif text-3xl font-normal leading-[1.1] text-nera-wine sm:text-4xl lg:text-5xl">
            Women traditions,
            <span className="block text-nera-espresso">
              each with its own story.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-6 text-nera-espresso/60">
            Discover beautiful sarees shaped by traditional craftsmanship
            and timeless weaving traditions.
          </p>
        </div>

        {/* Horizontal Cards */}
        <div className="craft-scroll flex gap-3 overflow-x-auto sm:gap-5">
          {crafts.map((craft, index) => (
            <Link
              key={craft.id}
              href={craft.href}
              className="group w-[46%] shrink-0 sm:w-[42%] lg:w-[28%]"
            >
              <article className="relative overflow-hidden bg-nera-sand">

                {/* Image */}
                <div className="relative aspect-[4/4.8] overflow-hidden">
                  <img
                    src={craft.image}
                    alt={craft.name}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = defaultCraftImage;
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Gold border */}
                  <div className="pointer-events-none absolute inset-3 border border-nera-gold/50 transition-all duration-500 group-hover:inset-4 group-hover:border-nera-gold/80" />

                  {/* Number */}
                  <span className="absolute left-6 top-6 text-[10px] font-medium tracking-[0.2em] text-white/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-gold">
                      {craft.productType}
                    </p>

                    <h3 className="font-serif text-2xl font-normal leading-tight text-white">
                      {craft.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/75">
                      {craft.saree}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/80 transition-colors group-hover:text-white">
                      Discover
                      <span className="text-nera-gold transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom gold line */}
                <div className="h-[2px] w-0 bg-nera-gold transition-all duration-500 group-hover:w-full" />
              </article>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

