"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email.");
      return;
    }

    // Store subscribed email locally for now.
    const existingEmails = JSON.parse(
      localStorage.getItem("dera-newsletter") || "[]"
    );

    if (!existingEmails.includes(trimmedEmail)) {
      existingEmails.push(trimmedEmail);

      localStorage.setItem(
        "dera-newsletter",
        JSON.stringify(existingEmails)
      );
    }

    setEmail("");
    setMessage("Thank you for subscribing!");
  }

  return (
    <div className="mt-5">
      <form
        className="flex border-b border-[#C6A15B]/40"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
            setMessage("");
          }}
          placeholder="Your email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#FFFDF8] outline-none placeholder:text-[#FFFDF8]/40"
        />

        <button
          type="submit"
          aria-label="Subscribe"
          className="px-2 text-[#C6A15B] transition hover:text-[#FFFDF8]"
        >
          →
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-2 text-xs text-[#C6A15B]">
          {message}
        </p>
      )}
    </div>
  );
}