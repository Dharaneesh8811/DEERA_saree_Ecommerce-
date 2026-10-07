"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

const initialForm = {
  customer_name: "",
  company_name: "",
  email: "",
  phone: "",
  product_category: "",
  quantity: "",
  required_date: "",
  budget: "",
  message: "",
};

const categories = [
  "Silk Sarees",
  "Kanchipuram Silk",
  "Wedding Collection",
  "Festive Collection",
  "Boutique Collection",
  "Other",
];

export default function BulkOrderPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bulk-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: form.customer_name,
            company_name: form.company_name || null,
            email: form.email,
            phone: form.phone,
            product_category: form.product_category || null,
            quantity: Number(form.quantity),
            required_date: form.required_date || null,
            budget: form.budget || null,
            message: form.message || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Unable to submit your bulk order request."
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-nera-white">

      {/* Hero */}
      <section className="bg-nera-sand">
        <div className="nera-container py-20 sm:py-24 lg:py-32">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
              Bulk orders
            </p>

            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.08] text-nera-wine sm:text-5xl lg:text-6xl">
              A little more silk,
              <span className="block text-nera-espresso">
                for bigger moments.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-nera-espresso/60 sm:text-base">
              Whether you're planning a wedding, sourcing for a boutique,
              or preparing for a special event, tell us what you're looking
              for and we'll help you find the right collection.
            </p>

          </div>

        </div>
      </section>

      {/* Form section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="nera-container">

          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">

            {/* Intro */}
            <div>

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                Tell us what you need
              </p>

              <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-nera-wine sm:text-4xl">
                Let's curate
                <span className="block text-nera-espresso">
                  something together.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-nera-espresso/60">
                Share a few details about your requirement. Our team will
                review your request and get in touch with you directly.
              </p>

              <div className="mt-10 border-t border-nera-gold/20 pt-6">

                <div className="mb-5 flex items-start gap-4">
                  <span className="font-serif text-xl text-nera-gold">
                    01
                  </span>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-nera-wine">
                      Share your requirement
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-nera-espresso/50">
                      Tell us about your quantity, collection and timeline.
                    </p>
                  </div>
                </div>

                <div className="mb-5 flex items-start gap-4">
                  <span className="font-serif text-xl text-nera-gold">
                    02
                  </span>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-nera-wine">
                      We review
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-nera-espresso/50">
                      Our team will look through your requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="font-serif text-xl text-nera-gold">
                    03
                  </span>

                  <div>
                    <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-nera-wine">
                      We get in touch
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-nera-espresso/50">
                      We'll contact you to discuss availability and pricing.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Form */}
            <div className="border border-nera-gold/20 bg-nera-sand/40 p-6 sm:p-8 lg:p-10">

              {success ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

                  <CheckCircle2
                    size={42}
                    strokeWidth={1.2}
                    className="text-nera-gold"
                  />

                  <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-nera-gold">
                    Request received
                  </p>

                  <h2 className="mt-3 font-serif text-3xl text-nera-wine">
                    Thank you.
                  </h2>

                  <p className="mt-4 max-w-md text-sm leading-7 text-nera-espresso/60">
                    We've received your bulk order request. Our team will
                    review your requirements and contact you shortly.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="mt-8 inline-flex items-center gap-3 bg-nera-wine px-6 py-3.5 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition-colors duration-300 hover:bg-nera-gold hover:text-nera-espresso"
                  >
                    Submit another request
                    <ArrowUpRight size={14} strokeWidth={1.4} />
                  </button>

                </div>
              ) : (
                <form onSubmit={handleSubmit}>

                  <div className="grid gap-6 sm:grid-cols-2">

                    {/* Name */}
                    <Field
                      label="Name"
                      name="customer_name"
                      value={form.customer_name}
                      onChange={handleChange}
                      required
                    />

                    {/* Company */}
                    <Field
                      label="Company / Organization"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                    />

                    {/* Email */}
                    <Field
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                    {/* Phone */}
                    <Field
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />

                    {/* Category */}
                    <div>
                      <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.16em] text-nera-espresso/60">
                        Product / Category
                      </label>

                      <select
                        name="product_category"
                        value={form.product_category}
                        onChange={handleChange}
                        className="h-12 w-full border-b border-nera-gold/30 bg-transparent px-0 text-sm text-nera-espresso outline-none transition-colors focus:border-nera-gold"
                      >
                        <option value="">Select a category</option>

                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <Field
                      label="Quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                    />

                    {/* Required date */}
                    <Field
                      label="Required Date"
                      name="required_date"
                      type="date"
                      value={form.required_date}
                      onChange={handleChange}
                    />

                    {/* Budget */}
                    <Field
                      label="Budget"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="e.g. ₹50,000 - ₹1,00,000"
                    />

                    {/* Message */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.16em] text-nera-espresso/60">
                        Message
                      </label>

                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us about your requirement..."
                        className="w-full resize-none border border-nera-gold/25 bg-nera-white/50 px-4 py-3 text-sm text-nera-espresso outline-none placeholder:text-nera-espresso/30 focus:border-nera-gold"
                      />
                    </div>

                  </div>

                  {error && (
                    <div className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="max-w-xs text-[10px] leading-5 text-nera-espresso/40">
                      By submitting this form, you are requesting a bulk
                      order consultation. Our team will contact you directly.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex min-h-14 items-center justify-center gap-3 bg-nera-wine px-7 text-[9px] font-medium uppercase tracking-[0.18em] text-nera-white transition-all duration-300 hover:bg-nera-gold hover:text-nera-espresso disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Request"}

                      {!loading && (
                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.4}
                          className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      )}
                    </button>

                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-medium uppercase tracking-[0.16em] text-nera-espresso/60">
        {label}
        {required && <span className="ml-1 text-nera-gold">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        placeholder={placeholder}
        className="h-12 w-full border-b border-nera-gold/30 bg-transparent px-0 text-sm text-nera-espresso outline-none placeholder:text-nera-espresso/30 transition-colors focus:border-nera-gold"
      />
    </div>
  );
}