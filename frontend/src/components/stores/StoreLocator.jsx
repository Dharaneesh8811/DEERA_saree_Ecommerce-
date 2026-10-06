import { MapPin, Clock3, Phone, Navigation } from "lucide-react";

const store = {
  city: "Coimbatore",
  name: "Deera Silk",
  address: "Eachanari, Coimbatore, Tamil Nadu 641002",
  hours: "Monday – Saturday · 10:00 AM – 8:00 PM",
  phone: "+91 98765 43210",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Eachanari+Coimbatore+Tamil+Nadu",
};

export default function StoreLocator() {
  return (
    <section className="bg-nera-ivory py-16 sm:py-20 lg:py-24">
      <div className="nera-container">
        {/* Heading */}
        <div className="max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-nera-gold">
            Our Store
          </p>

          <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-espresso sm:text-4xl lg:text-5xl">
            Come experience
            <span className="block text-nera-wine">silk in person.</span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-nera-espresso/55 sm:text-base">
            Visit us to explore our collections up close and speak with our team
            about finding the right silk for your occasion.
          </p>
        </div>

        {/* Store + Map */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* Store Details */}
          <div className="border border-nera-gold/25 bg-nera-white p-7 sm:p-9">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-nera-gold">
              Visit us
            </p>

            <h3 className="mt-3 font-serif text-2xl text-nera-espresso sm:text-3xl">
              {store.name}
            </h3>

            <div className="mt-8 space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-nera-gold/30 text-nera-wine">
                  <MapPin size={16} strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-nera-espresso/40">
                    Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-nera-espresso/60">
                    {store.address}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-nera-gold/30 text-nera-wine">
                  <Clock3 size={16} strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-nera-espresso/40">
                    Opening Hours
                  </p>

                  <p className="mt-2 text-sm leading-6 text-nera-espresso/60">
                    {store.hours}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-nera-gold/30 text-nera-wine">
                  <Phone size={16} strokeWidth={1.5} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-nera-espresso/40">
                    Phone
                  </p>

                  <a
                    href={`tel:${store.phone}`}
                    className="mt-2 block text-sm text-nera-espresso/60 transition hover:text-nera-wine"
                  >
                    {store.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Directions */}
            <a
              href={store.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex min-h-12 items-center gap-3 bg-nera-wine px-6 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition hover:bg-nera-espresso"
            >
              <Navigation size={15} strokeWidth={1.5} />
              Get Directions
            </a>
          </div>

          {/* Map */}
          <div className="relative min-h-[380px] overflow-hidden border border-nera-gold/20 bg-nera-sand lg:min-h-[480px]">
            <iframe
              title="Deera Silk Eachanari location"
              src="https://www.google.com/maps?q=Eachanari%2C%20Coimbatore%2C%20Tamil%20Nadu&output=embed"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
