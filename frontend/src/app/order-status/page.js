
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  MessageCircle,
  Package,
  Search,
  Truck,
} from "lucide-react";

import {
  getOrderByNumber,
  getOrdersByPhone,
  trackOrder,
} from "@/services/orderService";
import { getProductImages } from "@/services/productImageService";

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

const isFriendlyOrderNumber = (value) =>
  /^DEERA ORDER-\d+$/i.test(value);

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const urlOrderNumber = searchParams.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productImages, setProductImages] = useState({});

  const currentStatus = order?.status?.toUpperCase() || "";

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus
  );

  useEffect(() => {
    if (!order?.items?.length) {
      setProductImages({});
      return;
    }

    let cancelled = false;

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

              imageMap[item.product_id] =
                primaryImage?.image_url || null;
            }
          } catch (imageError) {
            console.error(
              `Failed to load image for product ${item.product_id}`,
              imageError
            );
          }
        })
      );

      if (!cancelled) {
        setProductImages(imageMap);
      }
    }

    loadProductImages();

    return () => {
      cancelled = true;
    };
  }, [order]);

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setOrder(null);
    setOrders([]);
    setSearched(false);
    setProductImages({});

    const reference = orderNumber.trim();
    const registeredPhone = phone.trim();

    const friendlyReference = isFriendlyOrderNumber(reference);
    const uuidReference = isUuid(reference);

    if (!reference && !registeredPhone) {
      setError("Enter your order reference or mobile number.");
      return;
    }

    if (reference && !friendlyReference && !uuidReference) {
      setError("Enter DEERA ORDER-10 or a valid order UUID.");
      return;
    }

    if (
      registeredPhone &&
      !/^[6-9]\d{9}$/.test(registeredPhone)
    ) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      // Both fields: verify the friendly order reference and phone.
      if (reference && registeredPhone && friendlyReference) {
        const result = await trackOrder(
          reference,
          registeredPhone
        );

        if (!result?.id) {
          throw new Error("Order details were not returned.");
        }

        setOrder(result);
        setSearched(true);
        return;
      }

      // UUID and phone: verify against a phone field returned by the API.
      if (reference && registeredPhone && uuidReference) {
        const result = await getOrderByNumber(reference);

        if (!result?.id) {
          throw new Error("Order details were not returned.");
        }

        const returnedPhone =
          result?.phone ??
          result?.customer_phone ??
          result?.shipping_phone ??
          result?.phone_number;

        if (
          !returnedPhone ||
          String(returnedPhone).replace(/\D/g, "").slice(-10) !==
            registeredPhone
        ) {
          setError(
            "The order UUID and mobile number could not be verified together. Try the DEERA ORDER number with your mobile number, or search using either field alone."
          );
          return;
        }

        setOrder(result);
        setSearched(true);
        return;
      }

      // Reference only: friendly order number or UUID.
      if (reference) {
        const result = await getOrderByNumber(reference);

        if (!result?.id) {
          throw new Error("Order details were not returned.");
        }

        setOrder(result);
        setSearched(true);
        return;
      }

      // Phone only: retrieve all matching orders.
      const result = await getOrdersByPhone(registeredPhone);

      if (!Array.isArray(result) || result.length === 0) {
        setError("No orders found for this mobile number.");
        return;
      }

      setOrders(result);

      if (result.length === 1) {
        setOrder(result[0]);
        setSearched(true);
      }
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setError(
          "No matching order was found. Please check your details."
        );
      } else if (requestError.response?.status === 422) {
        setError(
          "Please check your order reference or mobile number."
        );
      } else if (
        requestError.request &&
        !requestError.response
      ) {
        setError(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setError(
          requestError.response?.data?.detail ||
            requestError.message ||
            "Unable to find your order."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const selectOrder = (selectedOrder) => {
    setOrder(selectedOrder);
    setSearched(true);
    setError("");
    setProductImages({});
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
            Enter your order reference, order UUID, or registered
            mobile number to check your Deera Silks order.
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
                Enter your order reference or mobile number.
                You can enter both to verify your order.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-7">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                  Order Reference / UUID
                </label>

                <input
                  type="text"
                  value={orderNumber}
                  onChange={(event) =>
                    setOrderNumber(event.target.value)
                  }
                  placeholder="DEERA ORDER-XXX or Order UUID"
                  autoComplete="off"
                  className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
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
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="Registered mobile number"
                  className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 text-xs leading-5 text-nera-wine"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-nera-wine px-7 text-xs font-medium uppercase tracking-[0.14em] text-nera-white transition hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Finding Order..." : "Track Order"}
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </form>
        </section>

        {orders.length > 1 && !order && (
          <section className="mt-10 border border-nera-gold/20 bg-nera-white p-5 sm:p-7">
            <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
              Your orders
            </p>

            <h2 className="mt-2 font-serif text-2xl text-nera-wine">
              Select an order to track
            </h2>

            <p className="mt-2 text-xs leading-6 text-nera-espresso/50">
              We found multiple orders associated with this mobile number.
            </p>

            <div className="mt-6 space-y-3">
              {orders.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectOrder(item)}
                  className="flex w-full items-center justify-between gap-4 border border-nera-gold/20 p-4 text-left transition hover:border-nera-wine hover:bg-nera-sand/30"
                >
                  <div className="min-w-0">
                    <p className="break-words font-serif text-lg text-nera-wine">
                      {item.order_number || "Order"}
                    </p>

                    <p className="mt-2 text-xs text-nera-espresso/50">
                      Status:{" "}
                      {item.status
                        ? item.status.replaceAll("_", " ").toUpperCase()
                        : "UNKNOWN"}
                    </p>

                    {item.created_at && (
                      <p className="mt-1 text-xs text-nera-espresso/40">
                        Date:{" "}
                        {new Date(item.created_at).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-serif text-lg text-nera-wine">
                      ₹
                      {Number(
                        item.final_amount ?? item.total_amount ?? 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-nera-wine">
                      Track <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {searched && order && (
          <section className="mt-10">
            <div className="border border-nera-gold/20 bg-nera-white">
              <div className="flex flex-col gap-5 border-b border-nera-gold/15 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
                    Order details
                  </p>

                  <h2 className="mt-2 break-words font-serif text-2xl text-nera-wine">
                    {order.order_number || orderNumber || "Your order"}
                  </h2>

                  {order.id && (
                    <p className="mt-2 break-all font-mono text-[10px] leading-5 text-nera-espresso/45">
                      UUID: {order.id}
                    </p>
                  )}
                </div>

                <div className="inline-flex w-fit items-center gap-2 border border-nera-gold/25 bg-nera-sand/50 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-nera-gold" />

                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-nera-wine">
                    {order.status
                      ? order.status.replaceAll("_", " ").toUpperCase()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-8 sm:px-7 sm:py-10">
                <p className="text-[10px] uppercase tracking-[0.18em] text-nera-gold">
                  Order progress
                </p>

                {currentStatusIndex === -1 && (
                  <p className="mt-4 text-xs leading-6 text-nera-espresso/50">
                    Your order has been found. Its current status is shown
                    above; progress steps update when the status matches
                    one of the stages below.
                  </p>
                )}

                <div className="mt-8">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted =
                      currentStatusIndex >= 0 &&
                      index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isLast = index === statusSteps.length - 1;

                    return (
                      <div key={step.key} className="relative flex gap-5">
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
                          } ${isCurrent ? "ring-4 ring-nera-wine/10" : ""}`}
                        >
                          <Icon size={17} strokeWidth={1.5} />
                        </div>

                        <div className={isLast ? "" : "pb-9"}>
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
                  {order.items?.map((item, index) => (
                    <div
                      key={item.id || `${item.product_id}-${index}`}
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

                  {(!order.items || order.items.length === 0) && (
                    <p className="text-xs leading-6 text-nera-espresso/50">
                      Order items are not available in the tracking response.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-nera-gold/15 pt-5">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-nera-espresso/50">
                    Order total
                  </span>

                  <span className="font-serif text-xl text-nera-wine">
                    ₹
                    {Number(
                      order.final_amount ?? order.total_amount ?? 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
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
