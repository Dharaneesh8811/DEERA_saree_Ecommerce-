"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder, getOrdersByPhone } from "@/services/orderService";
import { getProductImages } from "@/services/productImageService";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Package,
  Search,
  Truck,
  MessageCircle,
} from "lucide-react";
import { Suspense, useState } from "react";

const statusSteps = [
  {
    key: "PLACED",
    label: "Order Placed",
    description: "Your order request has been received.",
    icon: Package,
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review",
    description: "Our team is reviewing your order details.",
    icon: Clock3,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Your order has been confirmed by our team.",
    icon: Check,
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "Your saree has been handed over for delivery.",
    icon: Truck,
  },
];

function OrderStatusContent() {
  const searchParams = useSearchParams();

  const urlOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(urlOrderId);
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productImages, setProductImages] = useState({});

  const currentStatus = order?.status?.toUpperCase() || "";

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );

   useEffect(() => {
    if (!order?.items?.length) return;

    async function loadProductImages() {
      const imageMap = {};

      await Promise.all(
        order.items.map(async (item) => {
          if (!item.product_id) return;

          try {
            const images = await getProductImages(item.product_id);

            if (Array.isArray(images) && images.length > 0) {
              const primaryImage =
                images.find((image) => image.is_primary) || images[0];

              imageMap[item.product_id] = primaryImage?.image_url || null;
            }
          } catch (error) {
            console.error(
              `Failed to load image for product ${item.product_id}`,
              error
            );
          }
        })
      );

      setProductImages(imageMap);
    }

    loadProductImages();
  }, [order]);


  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setOrder(null);

    if (!orderId.trim() && !phone.trim()) {
      setError("Please enter your order ID or phone number.");
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      let data;

      if (orderId.trim()) {
        data = await getOrder(orderId.trim());
      } else {
        const orders = await getOrdersByPhone(phone.trim());

        if (!Array.isArray(orders) || orders.length === 0) {
          setError("No orders found for this phone number.");
          return;
        }

        data = orders[0];
      }

      setOrder(data);
      setSearched(true);
    } catch (requestError) {
      const status = requestError.response?.status;

      if (status === 404) {
        setError(
          "Order not found. Please check your order ID or phone number."
        );
      } else if (status === 422) {
        setError("Please enter valid order details.");
      } else if (requestError.request && !requestError.response) {
        setError("Unable to connect to the server. Please try again.");
      } else {
        setError("Unable to find your order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-nera-ivory">
      <div className="nera-container py-10 sm:py-14 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-nera-espresso/50 transition hover:text-nera-wine"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Back to Home
        </Link>

        <div className="mt-8 max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
            Order tracking
          </p>

          <h1 className="mt-3 font-serif text-4xl font-normal text-nera-wine sm:text-5xl">
            Track your order
          </h1>

          <p className="mt-4 text-sm leading-7 text-nera-espresso/55">
            Enter your order ID or phone number to check the current status of
            your Deera Silk order.
          </p>
        </div>

        <section className="mt-10 border border-nera-gold/20 bg-nera-white p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-nera-sand text-nera-wine">
              <Search size={18} strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="font-serif text-xl text-nera-wine">
                Find your order
              </h2>

              <p className="mt-1 text-xs text-nera-espresso/45">
                Use either your order ID or registered phone number.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                  Order ID
                </label>

                <input
                  type="text"
                  value={orderId}
                  onChange={(event) => setOrderId(event.target.value)}
                  placeholder="Example: NERA-943424"
                  className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm uppercase outline-none transition focus:border-nera-wine"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                  Phone Number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="10-digit mobile number"
                  className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-nera-wine">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-nera-wine px-7 text-xs font-medium uppercase tracking-[0.14em] text-nera-white transition hover:bg-nera-espresso"
            >
              {loading ? "Finding Order..." : "Track Order"}
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </form>
        </section>

        {searched && (
          <section className="mt-10">
            <div className="border border-nera-gold/20 bg-nera-white">
              <div className="flex flex-col gap-5 border-b border-nera-gold/15 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
                    Order details
                  </p>

                  <h2 className="mt-2 font-serif text-2xl text-nera-wine">
                    {order?.id || orderId || "DEERA-ORDER"}
                  </h2>
                </div>

                <div className="inline-flex w-fit items-center gap-2 border border-nera-gold/25 bg-nera-sand/50 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-nera-gold" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-nera-wine">
                    {order?.status
                      ? order.status.replaceAll("_", " ").toUpperCase()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-8 sm:px-7 sm:py-10">
                <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
                  Order progress
                </p>

                <div className="mt-8">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isLast = index === statusSteps.length - 1;

                    return (
                      <div
                        key={step.key}
                        className="relative flex gap-5"
                      >
                        {!isLast && (
                          <div
                            className={`absolute left-[19px] top-10 h-[calc(100%-10px)] w-px ${
                              index < currentStatusIndex
                                ? "bg-nera-wine"
                                : "bg-nera-gold/20"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border ${
                            isCompleted
                              ? "border-nera-wine bg-nera-wine text-nera-white"
                              : "border-nera-gold/25 bg-nera-white text-nera-espresso/30"
                          } ${
                            isCurrent ? "ring-4 ring-nera-wine/10" : ""
                          }`}
                        >
                          <Icon size={17} strokeWidth={1.5} />
                        </div>

                        <div className={`${isLast ? "" : "pb-9"}`}>
                          <p
                            className={`text-sm font-medium ${
                              isCompleted
                                ? "text-nera-wine"
                                : "text-nera-espresso/35"
                            }`}
                          >
                            {step.label}
                          </p>

                          <p
                            className={`mt-1 text-xs leading-6 ${
                              isCompleted
                                ? "text-nera-espresso/55"
                                : "text-nera-espresso/30"
                            }`}
                          >
                            {step.description}
                          </p>

                          {isCurrent && (
                            <span className="mt-2 inline-block text-[9px] uppercase tracking-[0.12em] text-nera-gold">
                              Current status
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="border border-nera-gold/20 bg-nera-white p-5 sm:p-7">
                <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
                  Your order
                </p>

                <h3 className="mt-2 font-serif text-xl text-nera-wine">
                  Order summary
                </h3>

                <div className="mt-6 space-y-5">
                  {order?.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-nera-gold/10 pb-5 last:border-b-0 last:pb-0"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden bg-nera-sand">
                        <img
                          src={
                            productImages[item.product_id] ||
                            "/images/products/ruby-kanjivaram.jpg"
                          }
                          alt={item.product_name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-lg text-nera-wine">
                          {item.product_name || "Product"}
                        </h4>

                        <p className="mt-2 text-xs text-nera-espresso/50">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-1 text-sm font-medium text-nera-espresso">
                          ₹
                          {Number(item.unit_price || 0).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-[10px] text-nera-espresso/40">
                          Subtotal: ₹
                          {Number(item.subtotal || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order && (
                  <div className="mt-6 flex items-center justify-between border-t border-nera-gold/15 pt-5">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-nera-espresso/50">
                      Order total
                    </span>

                    <span className="font-serif text-xl text-nera-wine">
                      ₹
                      {Number(
                        order.final_amount || order.total_amount || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              <div className="border border-nera-gold/20 bg-nera-sand/40 p-5 sm:p-7">
                <MessageCircle
                  size={22}
                  strokeWidth={1.4}
                  className="text-nera-gold"
                />

                <h3 className="mt-4 font-serif text-xl text-nera-wine">
                  Need help?
                </h3>

                <p className="mt-2 text-xs leading-6 text-nera-espresso/55">
                  Our team is available to help with your order, delivery
                  details, or any questions about your saree.
                </p>

                <Link
                  href="/contact"
                  className="mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.13em] text-nera-wine"
                >
                  Contact us
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="mt-10 border-t border-nera-gold/15 pt-7 text-center">
          <p className="text-xs text-nera-espresso/40">
            Order information is updated from our live order system.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-nera-ivory">
          <div className="nera-container py-16 text-center">
            <p className="text-sm text-nera-espresso/50">
              Loading order tracking...
            </p>
          </div>
        </main>
      }
    >
      <OrderStatusContent />
    </Suspense>
  );
}