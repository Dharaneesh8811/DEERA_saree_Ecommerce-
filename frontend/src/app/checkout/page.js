"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { applyCoupon } from "@/services/couponServices";

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.cartItems);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Order state
  const [placingOrder, setPlacingOrder] = useState(false);

  const discountAmount = Number(
    appliedCoupon?.discount_amount ||
      appliedCoupon?.discount ||
      appliedCoupon?.discount_value_applied ||
      0
  );

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Please enter your name";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!form.address.trim()) {
      newErrors.address = "Delivery address is required";
    }

    if (!form.city.trim()) {
      newErrors.city = "Please enter your city";
    }

    if (!form.state.trim()) {
      newErrors.state = "Please enter your state";
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* --------------------------------
     APPLY COUPON
  -------------------------------- */

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Your order amount is not valid.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const response = await applyCoupon(code, subtotal);

      const couponData = response?.data || response;

      if (!couponData) {
        throw new Error("Invalid coupon response.");
      }

      setAppliedCoupon({
        ...couponData,
        code: couponData.code || code,
      });

      setCouponCode("");
    } catch (error) {
      console.error("Coupon apply error:", error);

      setAppliedCoupon(null);

      setCouponError(
        error?.response?.data?.detail ||
          error?.userMessage ||
          error?.message ||
          "Invalid or unavailable coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  /* --------------------------------
     REMOVE COUPON
  -------------------------------- */

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponCode("");
  };

  /* --------------------------------
     ORDER SUBMIT
  -------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setPlacingOrder(true);

      const orderData = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,

        shipping_address_line1: form.address,
        shipping_address_line2: null,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_postal_code: form.pincode,
        shipping_country: "India",

        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
      };

      console.log("Sending order:", orderData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      console.log("Order response:", data);

      if (!response.ok) {
        console.error("Order creation failed:", data);

        alert(
          data.detail ||
            "Unable to place order. Please try again."
        );

        return;
      }

      const orderId =
        data.order_number ||
        data.order_id ||
        data.id;

      if (!orderId) {
        console.error(
          "Backend did not return an order ID:",
          data
        );

        alert(
          "Order was created, but the order ID was not returned."
        );

        return;
      }

      window.location.href =
        `/order-success?orderId=${orderId}`;
    } catch (error) {
      console.error("Order submission error:", error);

      alert(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* --------------------------------
     EMPTY CART
  -------------------------------- */

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] bg-nera-ivory">
        <div className="nera-container flex min-h-[70vh] items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-nera-gold">
              Checkout
            </p>

            <h1 className="mt-3 font-serif text-4xl text-nera-wine">
              Your cart is empty
            </h1>

            <Link
              href="/collections"
              className="mt-7 inline-flex min-h-12 items-center gap-2 bg-nera-wine px-7 text-xs uppercase tracking-[0.14em] text-white"
            >
              Explore Collection
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-nera-ivory">
      <div className="nera-container py-10 sm:py-14 lg:py-16">

        {/* Header */}
        <div className="mb-10 border-b border-nera-gold/20 pb-7">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-nera-espresso/50 hover:text-nera-wine"
          >
            <ArrowLeft size={13} />
            Back to Shopping Bag
          </Link>

          <p className="mt-7 text-[10px] uppercase tracking-[0.22em] text-nera-gold">
            Secure order request
          </p>

          <h1 className="mt-3 font-serif text-4xl text-nera-wine sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-nera-espresso/50">
            Share your details and our team will personally confirm
            your saree availability and order.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Contact */}
            <section className="border border-nera-gold/20 bg-nera-white p-5 sm:p-7">

              <p className="text-[10px] uppercase tracking-[0.2em] text-nera-gold">
                01 · Contact details
              </p>

              <h2 className="mt-2 font-serif text-2xl text-nera-wine">
                How can we reach you?
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                    Full Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
                  />

                  {errors.name && (
                    <p className="mt-1 text-[10px] text-nera-wine">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                    Phone Number *
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-[10px] text-nera-wine">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                    Email Address
                    <span className="ml-1 normal-case tracking-normal text-nera-espresso/30">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none transition focus:border-nera-wine"
                  />
                </div>

              </div>
            </section>

            {/* Address */}
            <section className="border border-nera-gold/20 bg-nera-white p-5 sm:p-7">

              <p className="text-[10px] uppercase tracking-[0.2em] text-nera-gold">
                02 · Delivery address
              </p>

              <h2 className="mt-2 font-serif text-2xl text-nera-wine">
                Where should we deliver?
              </h2>

              <div className="mt-6 space-y-5">

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                    Address *
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={4}
                    placeholder="House / Flat number, street, area"
                    className="w-full resize-none border border-nera-gold/25 bg-nera-ivory px-4 py-3 text-sm outline-none transition focus:border-nera-wine"
                  />

                  {errors.address && (
                    <p className="mt-1 text-[10px] text-nera-wine">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                      City *
                    </label>

                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Chennai"
                      className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none focus:border-nera-wine"
                    />

                    {errors.city && (
                      <p className="mt-1 text-[10px] text-nera-wine">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                      State *
                    </label>

                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Tamil Nadu"
                      className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none focus:border-nera-wine"
                    />

                    {errors.state && (
                      <p className="mt-1 text-[10px] text-nera-wine">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-nera-espresso/55">
                      Pincode *
                    </label>

                    <input
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="600001"
                      className="h-12 w-full border border-nera-gold/25 bg-nera-ivory px-4 text-sm outline-none focus:border-nera-wine"
                    />

                    {errors.pincode && (
                      <p className="mt-1 text-[10px] text-nera-wine">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                </div>
              </div>
            </section>

            {/* Order confirmation */}
            <section className="border border-nera-gold/20 bg-nera-sand/40 p-5 sm:p-7">

              <div className="flex gap-4">

                <div className="shrink-0">
                  <MessageCircle
                    size={22}
                    strokeWidth={1.4}
                    className="text-nera-gold"
                  />
                </div>

                <div>
                  <h3 className="font-serif text-xl text-nera-wine">
                    Personal order confirmation
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-nera-espresso/55">
                    No online payment is required. Once you place the
                    order request, our team will contact you by phone
                    or WhatsApp to confirm availability, delivery
                    details and the final order.
                  </p>
                </div>

              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={placingOrder}
              className="flex w-full items-center justify-center gap-3 bg-nera-wine px-5 py-4 text-xs font-medium uppercase tracking-[0.16em] text-nera-white transition hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? "Placing Order..."
                : "Place Order Request"}

              {!placingOrder && (
                <ArrowRight size={17} strokeWidth={1.5} />
              )}
            </button>

          </form>

          {/* SUMMARY */}
          <aside className="h-fit lg:sticky lg:top-28">

            <div className="border border-nera-gold/20 bg-nera-white">

              <div className="border-b border-nera-gold/15 px-6 py-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-nera-gold">
                  Your selection
                </p>

                <h2 className="mt-2 font-serif text-2xl text-nera-wine">
                  Order Summary
                </h2>
              </div>

              {/* Products */}
              <div className="max-h-[380px] overflow-y-auto px-6 py-5">

                <div className="space-y-5">

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-nera-sand">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />

                        <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-nera-wine px-1 text-[8px] text-white">
                          {item.quantity}
                        </span>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-[9px] uppercase tracking-[0.12em] text-nera-gold">
                          {item.category}
                        </p>

                        <h3 className="mt-1 font-serif text-base text-nera-wine">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-nera-espresso/55">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>

                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {/* Coupon */}
              <div className="border-t border-nera-gold/15 px-6 py-5">

                <div className="flex items-center gap-2">
                  <Tag
                    size={15}
                    strokeWidth={1.5}
                    className="text-nera-gold"
                  />

                  <p className="text-[10px] uppercase tracking-[0.18em] text-nera-wine">
                    Have a coupon?
                  </p>
                </div>

                {!appliedCoupon ? (
                  <>
                    <div className="mt-4 flex gap-2">

                      <input
                        value={couponCode}
                        onChange={(event) => {
                          setCouponCode(
                            event.target.value.toUpperCase()
                          );
                          setCouponError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        disabled={couponLoading}
                        className="h-11 min-w-0 flex-1 border border-nera-gold/25 bg-nera-ivory px-3 text-xs uppercase tracking-[0.08em] outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-nera-wine disabled:opacity-60"
                      />

                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={
                          couponLoading ||
                          !couponCode.trim()
                        }
                        className="h-11 shrink-0 bg-nera-wine px-4 text-[9px] uppercase tracking-[0.12em] text-white transition hover:bg-nera-espresso disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {couponLoading
                          ? "..."
                          : "Apply"}
                      </button>

                    </div>

                    {couponError && (
                      <p className="mt-2 text-[10px] leading-5 text-nera-wine">
                        {couponError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-4 border border-nera-gold/20 bg-nera-sand/40 p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-nera-espresso/45">
                          Applied coupon
                        </p>

                        <p className="mt-1 text-sm font-medium uppercase tracking-[0.08em] text-nera-wine">
                          {appliedCoupon.code}
                        </p>

                        <p className="mt-1 text-[10px] text-nera-espresso/50">
                          You saved ₹
                          {discountAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        aria-label="Remove coupon"
                        className="flex h-7 w-7 shrink-0 items-center justify-center border border-nera-gold/20 text-nera-espresso/50 transition hover:border-nera-wine hover:text-nera-wine"
                      >
                        <X size={13} />
                      </button>

                    </div>

                  </div>
                )}

              </div>

              {/* Price Summary */}
              <div className="border-t border-nera-gold/15 px-6 py-6">

                <div className="flex justify-between text-sm">

                  <span className="text-nera-espresso/50">
                    Subtotal
                  </span>

                  <span>
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>

                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="mt-4 flex justify-between text-sm">

                    <span className="text-nera-espresso/50">
                      Discount
                    </span>

                    <span className="text-green-700">
                      -₹
                      {discountAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>
                )}

                <div className="mt-4 flex justify-between border-b border-nera-gold/15 pb-5 text-sm">

                  <span className="text-nera-espresso/50">
                    Delivery
                  </span>

                  <span className="text-xs text-nera-espresso/40">
                    Confirmed later
                  </span>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <span className="font-serif text-xl text-nera-wine">
                    Total
                  </span>

                  <span className="text-xl font-medium">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

            </div>

            <div className="mt-4 flex items-center gap-3 border border-nera-gold/15 bg-nera-white p-4">

              <ShieldCheck
                size={19}
                strokeWidth={1.3}
                className="shrink-0 text-nera-gold"
              />

              <p className="text-[9px] leading-5 text-nera-espresso/45">
                Your details are used only to process and confirm
                your order.
              </p>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}