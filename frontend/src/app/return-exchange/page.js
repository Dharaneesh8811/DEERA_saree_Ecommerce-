import Link from "next/link";

const returnSections = [
  {
    number: "01",
    title: "Return Eligibility",
    content: (
      <>
        <p>
          Items may be eligible for return if they are unused, unworn, and
          returned in their original condition with the original packaging and
          tags intact.
        </p>

        <p className="mt-4">
          Before sending an item back, please contact the DEERA Silk team with
          your order details so we can guide you through the return process.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "Return Request",
    content: (
      <>
        <p>
          To request a return or exchange, contact our team with your order
          number and the details of the product you wish to return.
        </p>

        <p className="mt-4">
          Our team will review the request and provide the next steps for the
          return or exchange.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "Exchange",
    content: (
      <>
        <p>
          If you would like to exchange an eligible product, please contact
          our team with your order details and the product you would like to
          exchange.
        </p>

        <p className="mt-4">
          Exchange requests are subject to product availability and our team
          will confirm the available options.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Damaged or Incorrect Items",
    content: (
      <>
        <p>
          If you receive a damaged, defective, or incorrect item, please
          contact the DEERA Silk team as soon as possible with your order
          details.
        </p>

        <div className="mt-6 space-y-3">
          {[
            [
              "Damaged Product",
              "Contact us with your order details and information about the damage.",
            ],
            [
              "Incorrect Product",
              "Let us know if the product received does not match your order.",
            ],
            [
              "Support Review",
              "Our team will review the issue and guide you through the next steps.",
            ],
          ].map(([title, description]) => (
            <div
              key={title}
              className="border border-[#651B2E]/10 bg-[#FFFDF8] px-5 py-4"
            >
              <p className="font-serif text-base text-[#651B2E]">
                {title}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#241A18]/60">
                {description}
              </p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    number: "05",
    title: "Refunds",
    content: (
      <p>
        If a refund is applicable to your order, our team will review the
        return and communicate the refund process and applicable details after
        the returned product has been reviewed.
      </p>
    ),
  },
  {
    number: "06",
    title: "Return Questions",
    content: (
      <p>
        If you have any questions about a return, exchange, damaged product,
        or refund, please contact the DEERA Silk team with your order details
        so we can assist you.
      </p>
    ),
  },
];

export default function ReturnExchangePage() {
  return (
    <main className="min-h-screen bg-[#FAF6EE]">

      {/* Hero */}
      <section className="border-b border-[#651B2E]/10 bg-[#FFFDF8]">
        <div className="mx-auto max-w-nera px-6 py-16 text-center sm:py-20 lg:px-12 lg:py-24">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Customer Care
          </p>

          <h1 className="font-serif text-4xl font-normal text-[#651B2E] sm:text-5xl lg:text-6xl">
            Returns & Exchanges
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#241A18]/60">
            Everything you need to know about returning or exchanging your
            DEERA Silk order.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="border-b border-[#651B2E]/10 pb-12 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-8 text-[#241A18]/65">
            At DEERA Silk, we want you to feel confident with every purchase.
            If you need to return or exchange an eligible product, please
            contact our team with your order details so we can assist you
            through the process.
          </p>
        </div>

        {/* Return Sections */}
        <div className="mt-14 space-y-14">
          {returnSections.map((section) => (
            <section key={section.number}>
              <div className="flex gap-5">
                <span className="pt-1 text-[10px] font-medium tracking-[0.18em] text-[#C6A15B]">
                  {section.number}
                </span>

                <div className="flex-1">
                  <h2 className="font-serif text-2xl font-normal text-[#651B2E] sm:text-3xl">
                    {section.title}
                  </h2>

                  <div className="mt-5 text-sm leading-8 text-[#241A18]/65">
                    {section.content}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Order Status CTA */}
        <div className="mt-20 border border-[#C6A15B]/30 bg-[#FFFDF8] px-6 py-10 text-center sm:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Need help with your order?
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal text-[#651B2E]">
            Check your order status.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#241A18]/60">
            Use our Order Status page to check the current stage of your
            order.
          </p>

          <Link
            href="/order-status"
            className="mt-7 inline-flex border border-[#651B2E] bg-[#651B2E] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#FFFDF8] transition hover:bg-[#241A18]"
          >
            Order Status
          </Link>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#241A18]/55">
            Need help with a return or exchange?
          </p>

          <Link
            href="/contact"
            className="mt-3 inline-block text-[11px] font-medium uppercase tracking-[0.16em] text-[#651B2E] underline decoration-[#C6A15B] underline-offset-4"
          >
            Contact DEERA Silk
          </Link>
        </div>
      </section>
    </main>
  );
}