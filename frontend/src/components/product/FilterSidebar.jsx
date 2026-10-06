"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

const filterSections = [
  {
    key: "price",
    title: "Price",
    options: [
      "Under ₹10,000",
      "₹10,000 – ₹15,000",
      "₹15,000 – ₹25,000",
      "Above ₹25,000",
    ],
  },
  {
    key: "color",
    title: "Colour",
    options: [
      "Red",
      "Pink",
      "Green",
      "Blue",
      "Gold",
      "Maroon",
      "Black",
    ],
  },
  {
    key: "occasion",
    title: "Occasion",
    options: [
      "Wedding",
      "Festive",
      "Everyday",
      "Gifting",
    ],
  },
  {
    key: "fabric",
    title: "Fabric",
    options: [
      "Pure Silk",
      "Soft Silk",
      "Tussar Silk",
      "Banarasi Silk",
    ],
  },
  {
    key: "fabricWeight",
    title: "Fabric Weight",
    options: [
      "Lightweight",
      "Medium",
      "Heavy",
    ],
  },
  {
    key: "border",
    title: "Border Style",
    options: [
      "Temple Border",
      "Zari Border",
      "Contrast Border",
      "Traditional Border",
    ],
  },
];

export default function FilterSidebar({
  onClose,
  selectedFilters,
  onApply,
}) {
  const [openSection, setOpenSection] = useState("price");

  function toggleSection(sectionKey) {
    setOpenSection((current) =>
      current === sectionKey ? null : sectionKey
    );
  }

  function toggleFilter(sectionKey, option) {
    const currentOptions = selectedFilters[sectionKey] || [];

    const exists = currentOptions.includes(option);

    const updatedOptions = exists
      ? currentOptions.filter((item) => item !== option)
      : [...currentOptions, option];

    onApply({
      ...selectedFilters,
      [sectionKey]: updatedOptions,
    });
  }

  function clearFilters() {
    onApply({});
  }

  const selectedCount = Object.values(selectedFilters).reduce(
    (total, options) => total + options.length,
    0
  );

  return (
    <aside className="w-full bg-nera-white">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-nera-gold/20 px-5 py-5">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-nera-gold">
            Refine
          </p>

          <h2 className="mt-1 font-serif text-xl text-nera-wine">
            Filter Sarees
          </h2>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center text-nera-wine transition hover:bg-nera-sand"
          >
            <X size={19} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Active filters */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between border-b border-nera-gold/15 bg-nera-sand/40 px-5 py-3">
          <p className="text-[10px] uppercase tracking-[0.12em] text-nera-espresso/60">
            {selectedCount} selected
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="text-[9px] font-medium uppercase tracking-[0.12em] text-nera-wine underline underline-offset-4"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter sections */}
      <div className="px-5">
        {filterSections.map((section) => {
          const isOpen = openSection === section.key;
          const selected = selectedFilters[section.key] || [];

          return (
            <div
              key={section.key}
              className="border-b border-nera-gold/15"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-nera-espresso">
                  {section.title}
                </span>

                <div className="flex items-center gap-2">
                  {selected.length > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-nera-wine px-1 text-[8px] text-nera-white">
                      {selected.length}
                    </span>
                  )}

                  <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`text-nera-gold transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="space-y-3 pb-5">
                  {section.options.map((option) => {
                    const checked = selected.includes(option);

                    return (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            toggleFilter(section.key, option)
                          }
                          className="h-4 w-4 accent-[#651B2E]"
                        />

                        <span
                          className={`text-xs transition-colors ${
                            checked
                              ? "text-nera-wine"
                              : "text-nera-espresso/60"
                          }`}
                        >
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Apply button */}
      <div className="p-5">
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-12 w-full items-center justify-center bg-nera-wine text-[10px] font-medium uppercase tracking-[0.16em] text-nera-white transition hover:bg-nera-espresso"
        >
          Apply Filters
        </button>
      </div>

    </aside>
  );
}