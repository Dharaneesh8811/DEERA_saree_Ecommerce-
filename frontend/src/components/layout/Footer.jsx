import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const footerLinks = {
  explore: [
    { label: "Collections", href: "/collections" },
    { label: "Bulk Orders", href: "/bulk-order" },
    { label: "Journal", href: "/blogs" },
    { label: "About Us", href: "/about" },
    { label: "Store", href: "/stores" },
  ],

  customer: [
    { label: "Order Status", href: "/order-status" },
    { label: "FAQs", href: "/faqs" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping-policy" },
    { label: "Returns & Exchange", href: "/return-exchange" },
  ],

  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
  ],
};

function InstagramIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.7.3-1 1-1Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.5 3.8-6.5 3.8Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#C6A15B]/20 bg-[#241A18] text-[#FFFDF8]">

      {/* =====================================================
          DESKTOP FOOTER
      ====================================================== */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-nera px-8 py-16 lg:px-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="lg:pr-8">
              <Link
                href="/"
                className="inline-block font-serif text-3xl tracking-wide text-[#FFFDF8]"
              >
                Deera SILK
              </Link>

              <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#C6A15B]">
                Heritage · Reimagined
              </p>

              <p className="mt-6 max-w-sm text-sm leading-7 text-[#FFFDF8]/65">
                Discover handpicked silk sarees rooted in South Indian
                craftsmanship and chosen for the moments that matter.
              </p>

              {/* Social Links */}
              <div className="mt-7 flex gap-3">

                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center border border-[#C6A15B]/25 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
                >
                  <InstagramIcon />
                </a>

                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center border border-[#C6A15B]/25 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
                >
                  <FacebookIcon />
                </a>

                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center border border-[#C6A15B]/25 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
                >
                  <YouTubeIcon />
                </a>

              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#C6A15B]">
                Explore
              </h3>

              <ul className="mt-6 space-y-4">
                {footerLinks.explore.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#FFFDF8]/70 transition hover:text-[#FFFDF8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#C6A15B]">
                Customer Care
              </h3>

              <ul className="mt-6 space-y-4">
                {footerLinks.customer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#FFFDF8]/70 transition hover:text-[#FFFDF8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#C6A15B]">
                Stay Connected
              </h3>

              <p className="mt-6 text-sm leading-6 text-[#FFFDF8]/65">
                Be the first to discover new collections, silk stories and
                special edits.
              </p>

              <NewsletterForm />
            </div>

          </div>
        </div>

        {/* Desktop Bottom */}
        <div className="border-t border-[#FFFDF8]/10">
          <div className="mx-auto flex max-w-Dera flex-col gap-4 px-8 py-5 text-xs text-[#FFFDF8]/45 lg:flex-row lg:items-center lg:justify-between lg:px-12">

            <p>
              © {new Date().getFullYear()} Deera Silk. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-5">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-[#FFFDF8]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>


      {/* =====================================================
          MOBILE FOOTER
      ====================================================== */}
      <div className="block md:hidden">

        <div className="px-5 py-9">

          {/* Brand */}
          <div className="text-center">

            <Link
              href="/"
              className="font-serif text-3xl tracking-wide text-[#FFFDF8]"
            >
              Deera SILK
            </Link>

            <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-[#C6A15B]">
              Heritage · Reimagined
            </p>

            <p className="mx-auto mt-4 max-w-xs text-xs leading-5 text-[#FFFDF8]/55">
              Authentic South Indian silk, chosen for your special moments.
            </p>

          </div>


          {/* Social */}
          <div className="mt-6 flex justify-center gap-3">

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center border border-[#C6A15B]/25 text-[#FFFDF8]/80 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center border border-[#C6A15B]/25 text-[#FFFDF8]/80 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
            >
              <FacebookIcon />
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center border border-[#C6A15B]/25 text-[#FFFDF8]/80 transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
            >
              <YouTubeIcon />
            </a>

          </div>


          {/* Divider */}
          <div className="my-7 h-px bg-[#FFFDF8]/10" />


          {/* Important Links */}
          <div className="grid grid-cols-2 gap-x-8">

            {/* Explore */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#C6A15B]">
                Explore
              </h3>

              <ul className="mt-4 space-y-3">
                {footerLinks.explore.slice(0, 4).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FFFDF8]/65 transition hover:text-[#FFFDF8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


            {/* Customer */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#C6A15B]">
                Help
              </h3>

              <ul className="mt-4 space-y-3">
                {footerLinks.customer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#FFFDF8]/65 transition hover:text-[#FFFDF8]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>


          {/* Mobile Contact */}
          <div className="mt-7 border-t border-[#FFFDF8]/10 pt-5 text-center">

            <p className="text-[9px] uppercase tracking-[0.18em] text-[#C6A15B]">
              Need Help?
            </p>

            <Link
              href="/contact"
              className="mt-2 inline-block text-xs text-[#FFFDF8]/70 transition hover:text-[#FFFDF8]"
            >
              Contact our saree experts →
            </Link>

          </div>

        </div>


        {/* Mobile Bottom */}
        <div className="border-t border-[#FFFDF8]/10 px-5 py-4">

          <div className="flex flex-col items-center gap-3 text-center">

            <p className="text-[10px] text-[#FFFDF8]/40">
              © {new Date().getFullYear()} Deera Silk
            </p>

            <div className="flex gap-4">

              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[10px] text-[#FFFDF8]/40 transition hover:text-[#FFFDF8]"
                >
                  {link.label}
                </Link>
              ))}

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}