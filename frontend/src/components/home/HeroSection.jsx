
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { getHeroImage } from "@/services/heroService";

const FALLBACK_DESCRIPTION =
  "Discover timeless silk sarees rooted in craftsmanship, reimagined for the way you celebrate today.";

function HeroLink({ href, children, className }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function HeroSection() {
  const [hero, setHero] = useState(null);
  const [loaded, setLoaded] = useState(false);      

  useEffect(() => {
    let mounted = true;

    getHeroImage()
      .then((data) => {
        if (mounted) setHero(data);
      })
      .catch((error) => {
        console.error("Failed to load homepage hero:", error);
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const imageUrl = hero?.image_url || null;

  return (
    <section
      className="relative overflow-hidden bg-[#241A18]"
      aria-label="Featured collection"
    >
      <div className="relative min-h-[620px] w-full md:min-h-[680px] lg:min-h-[720px]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={
              hero?.heading ||
              "Silk saree showcasing traditional South Indian craftsmanship"
            }
            fill
            priority
            sizes="100vw"
            unoptimized
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#241A18]/90 via-[#241A18]/55 to-[#241A18]/25 md:bg-gradient-to-r md:from-[#241A18]/80 md:via-[#241A18]/45 md:to-[#241A18]/5" />

        <div className="pointer-events-none absolute inset-4 border border-[#C6A15B]/50 md:inset-6" />

        <div className="nera-container relative z-10 flex min-h-[620px] items-center md:min-h-[680px] lg:min-h-[720px]">
          <div className="max-w-xl py-16 text-[#FFFDF8] sm:py-20">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#C6A15B]">
              South Indian Silk · Curated with Care
            </p>

            <h1 className="font-serif text-4xl font-normal leading-[1.08] sm:text-6xl lg:text-7xl">
              {hero?.heading ? (
                hero.heading
              ) : (
                <>
                  Women with heritage.
                  <span className="mt-2 block">
                    Chosen for your moment.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#FFFDF8]/85 sm:text-base">
              {hero?.description || FALLBACK_DESCRIPTION}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <HeroLink
                href={hero?.cta_url || "/collections"}
                className="inline-flex min-h-12 items-center justify-center bg-[#651B2E] px-7 text-xs font-medium uppercase tracking-[0.12em] text-[#FFFDF8] transition duration-300 hover:bg-[#241A18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
              >
                {hero?.cta_text || "Explore Collections"}
              </HeroLink>

              <Link
                href="/collections"
                className="inline-flex min-h-12 items-center justify-center border border-[#FFFDF8]/50 bg-[#FFFDF8]/10 px-7 text-xs font-medium uppercase tracking-[0.12em] text-[#FFFDF8] backdrop-blur-md transition duration-300 hover:border-[#FFFDF8]/80 hover:bg-[#FFFDF8]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
              >
                Explore Collections
              </Link>
            </div>

            {!hero && loaded && (
              <p className="mt-5 text-xs text-[#FFFDF8]/60">
                Upload a hero image from the admin panel to display your
                featured collection here.
              </p>
            )}

            {!hero && !loaded && (
              <p className="mt-5 text-xs text-[#FFFDF8]/60">
                Loading featured collection...
              </p>
            )}

            {!hero && (
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#FFFDF8]/20 pt-5">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                  Handpicked Silks
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                  Authentic Craft
                </span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#FFFDF8]/70">
                  Saree Expert Support
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
