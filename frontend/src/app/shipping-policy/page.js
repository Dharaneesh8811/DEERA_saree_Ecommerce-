import Link from "next/link";

const shippingSections = [
  {
    number: "01",
    title: "Order Confirmation",
    content: (
      <p>
        After you place an order, the order is submitted for review. Our team
        will review the order details and contact you to confirm the order
        before it moves forward.
      </p>
    ),
  },
  {
    number: "02",
    title: "Delivery Process",
    content: (
      <p>
        Once your order has been confirmed, it moves through the order
        workflow towards shipping. You can check the current status of your
        order through the Order Status page.
      </p>
    ),
  },
  {
    number: "03",
    title: "Delivery Details",
    content: (
      <>
        <p>
          Please provide accurate delivery information during checkout.
          Delivery is handled using the information provided with your order.
        </p>

        <p className="mt-4">
          If any delivery information needs to be corrected, please contact
          our team as soon as possible with your order details.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Order Status",
    content: (
      <>
        <p>
          Orders move through the following stages:
        </p>

        <div className="mt-6 space-y-3">
          {[
            ["Placed", "Your order has been submitted."],
            ["Under Review", "The order is being reviewed by our team."],
            ["Confirmed", "The order has been confirmed."],
            ["Shipped", "The order has moved to the shipping stage."],
          ].map(([status, description]) => (
            <div
              key={status}
              className="border border-[#651B2E]/10 bg-[#FFFDF8] px-5 py-4"
            >
              <p className="font-serif text-base text-[#651B2E]">
                {status}
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
    title: "Shipping Questions",
    content: (
      <p>
        If you have a question about the shipping or delivery of your order,
        please contact the DEERA Silk team with your order details so we can
        assist you.
      </p>
    ),
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAF6EE]">

      {/* Hero */}
      <section className="border-b border-[#651B2E]/10 bg-[#FFFDF8]">
        <div className="mx-auto max-w-nera px-6 py-16 text-center sm:py-20 lg:px-12 lg:py-24">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Delivery Information
          </p>

          <h1 className="font-serif text-4xl font-normal text-[#651B2E] sm:text-5xl lg:text-6xl">
            Shipping & Delivery
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#241A18]/60">
            Everything you need to know about how your DEERA Silk order moves
            from confirmation to shipping.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20 lg:py-24">
        <div className="border-b border-[#651B2E]/10 pb-12 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-8 text-[#241A18]/65">
            At DEERA Silk, every order is reviewed before it moves forward.
            After placing your order, our team confirms the order details and
            then progresses it through the shipping workflow.
          </p>
        </div>

        {/* Shipping Sections */}
        <div className="mt-14 space-y-14">
          {shippingSections.map((section) => (
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
            Track your order
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
            Have a question about your delivery?
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