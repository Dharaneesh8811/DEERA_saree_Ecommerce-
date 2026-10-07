"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";

import { loginAdmin } from "@/services/authService";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginAdmin(
        email.trim(),
        password
      );

      localStorage.setItem(
        "dera_admin_token",
        data.access_token
      );

      localStorage.setItem(
        "dera_admin",
        JSON.stringify(data.admin)
      );

      router.push("/admin");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eee7dc] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-6xl overflow-hidden bg-[#fffdf9] shadow-[0_25px_80px_rgba(55,35,25,0.14)] sm:min-h-[calc(100vh-40px)]">

        {/* =====================================================
            LEFT BRAND PANEL
        ====================================================== */}
        <section className="relative hidden w-[46%] overflow-hidden bg-[#651a31] lg:flex">

          {/* Decorative circles */}
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#c9a35d]/20" />

          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#c9a35d]/20" />

          <div className="absolute left-10 top-1/2 h-px w-28 bg-[#c9a35d]/30" />

          <div className="absolute bottom-24 right-10 h-px w-28 bg-[#c9a35d]/30" />

          {/* Main content */}
          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Top */}
            <div>
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#c9a35d]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#e0bd78]">
                  DEERA SILKS
                </span>
              </div>
            </div>

            {/* Center */}
            <div className="my-auto">

              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a35d]/50 bg-[#7a263e]">
                <Sparkles
                  size={25}
                  strokeWidth={1.3}
                  className="text-[#dfbb72]"
                />
              </div>

              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.4em] text-[#d6ad63]">
                ADMINISTRATION
              </p>

              <h1 className="max-w-md font-serif text-5xl font-normal leading-[1.05] text-[#fff8ed] xl:text-6xl">
                Where
                <br />
                heritage
                <br />
                <span className="italic text-[#d7b46c]">
                  meets elegance.
                </span>
              </h1>

              <p className="mt-7 max-w-sm text-sm leading-7 text-[#eadbd0]/70">
                Manage your collections, products, orders
                and the world of Deera Silk from one
                elegant workspace.
              </p>
            </div>

            {/* Bottom */}
            <div>
              <div className="mb-5 h-px w-full bg-[#c9a35d]/20" />

              <div className="flex items-center justify-between">
                <p className="font-serif text-sm italic text-[#d8b678]">
                  Heritage, reimagined.
                </p>

                <p className="text-[9px] uppercase tracking-[0.2em] text-[#eadbd0]/40">
                  EST. DEERA
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}
        <section className="flex w-full items-center justify-center bg-[#fffdf9] px-6 py-12 sm:px-10 lg:w-[54%] lg:px-14 xl:px-20">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}
            <div className="mb-12 text-center lg:hidden">

              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[#c9a35d]" />

                <h1 className="font-serif text-3xl font-semibold tracking-[0.25em] text-[#651a31]">
                  DEERA
                </h1>

                <span className="h-px w-8 bg-[#c9a35d]" />
              </div>

              <p className="mt-3 text-[9px] uppercase tracking-[0.32em] text-[#9a7136]">
                SILK · HERITAGE · ELEGANCE
              </p>
            </div>

            {/* Header */}
            <div className="mb-10">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6eddf]">
                <LockKeyhole
                  size={20}
                  strokeWidth={1.5}
                  className="text-[#651a31]"
                />
              </div>

              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a47b3e]">
                Private Access
              </p>

              <h2 className="font-serif text-4xl font-normal text-[#2d211e] sm:text-5xl">
                Welcome back.
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#78645c]">
                Sign in to continue to your Deera
                administration workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#57453e]"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={loading}
                  className="h-14 w-full border-b border-[#d8cbbb] bg-transparent px-1 text-sm text-[#2d211e] outline-none transition placeholder:text-[#a89991] focus:border-[#651a31] disabled:opacity-50"
                />
              </div>

              {/* Password */}
              <div className="mt-7">
                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#57453e]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="h-14 w-full border-b border-[#d8cbbb] bg-transparent px-1 text-sm text-[#2d211e] outline-none transition placeholder:text-[#a89991] focus:border-[#651a31] disabled:opacity-50"
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="mt-6 border-l-2 border-[#8c273f] bg-[#faf0f1] px-4 py-3 text-sm text-[#8c273f]"
                >
                  {error}
                </div>
              )}

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-9 flex h-14 w-full items-center justify-between bg-[#651a31] px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#501326] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading
                    ? "Signing in..."
                    : "Enter Administration"}
                </span>

                {!loading && (
                  <ArrowRight
                    size={19}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="mt-9 flex items-start gap-3 border-t border-[#e5dbcf] pt-6">

              <LockKeyhole
                size={15}
                strokeWidth={1.4}
                className="mt-0.5 shrink-0 text-[#b48a45]"
              />

              <p className="text-[11px] leading-5 text-[#8a7770]">
                This area is restricted to authorized
                Deera Silk administrators.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="font-serif text-xs italic text-[#a78b7b]">
                Silk · Craft · Legacy
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}