"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function ProductGallery({ product, images = [] }) {
  const galleryImages = Array.isArray(images)
    ? [...images]
        .sort((first, second) => {
          const primaryOrder =
            Number(second.is_primary) - Number(first.is_primary);

          return (
            primaryOrder ||
            Number(first.display_order || 0) -
              Number(second.display_order || 0)
          );
        })
        .slice(0, 3)
    : [];

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImageIndex = Math.min(
    activeIndex,
    Math.max(0, galleryImages.length - 1)
  );

  const previousImage = () => {
    setActiveIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1
    );
  };

  const nextImage = () => {
    setActiveIndex((current) =>
      current === galleryImages.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div>
      {/* Main image */}
      <div className="group relative aspect-[4/5] overflow-hidden bg-nera-sand">
        {galleryImages.length > 0 ? (
          <img
            src={galleryImages[activeImageIndex].image_url}
            alt={
              galleryImages[activeImageIndex].alt_text ||
              product.name
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            role="img"
            aria-label={`No image available for ${product.name}`}
            className="flex h-full w-full items-center justify-center text-sm text-nera-espresso/40"
          >
            Image unavailable
          </div>
        )}

        {/* Previous */}
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={previousImage}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-nera-white/50 bg-nera-white/80 text-nera-wine backdrop-blur-sm transition hover:bg-nera-white"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
        )}

        {/* Next */}
        {galleryImages.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-nera-white/50 bg-nera-white/80 text-nera-wine backdrop-blur-sm transition hover:bg-nera-white"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        )}

        {/* Zoom visual */}
        {galleryImages.length > 0 && (
          <button
            type="button"
            aria-label="View larger"
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center border border-nera-white/50 bg-nera-white/80 text-nera-wine backdrop-blur-sm transition hover:bg-nera-white"
          >
            <Maximize2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Only 3 thumbnails */}
      {galleryImages.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/5] overflow-hidden border ${
                activeImageIndex === index
                  ? "border-nera-wine"
                  : "border-nera-gold/20"
              }`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || product.name}
                className="h-full w-full object-cover"
              />

              {activeImageIndex === index && (
                <span className="absolute inset-0 border-2 border-nera-wine/30" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}