"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-12 bg-white dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl p-8 sm:p-12 md:py-16 md:px-20 text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Join the Aura Community
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Subscribe to receive updates on new arrivals, exclusive collections, and early access to sales.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex w-full max-w-md flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="grow rounded-full border-0 bg-white px-5 py-3 text-sm text-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-950 dark:text-white dark:ring-zinc-800"
              />
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-300 shrink-0"
              >
                Join
              </button>
            </form>
          ) : (
            <div className="mt-8 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-950/20 px-6 py-3 rounded-full">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
              <span>Thank you! You are now subscribed.</span>
            </div>
          )}

          <p className="mt-4 text-[10px] text-zinc-400 dark:text-zinc-500">
            By subscribing, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-400">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
