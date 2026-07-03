/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForgotPasswordMutation } from "@/lib/features/auth/authApi";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await forgotPassword({ email }).unwrap();
      if (result.success) {
        // Store email for verification page
        sessionStorage.setItem("resetEmail", email);
        router.push("/forgot-password/verify");
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setErrorMessage(err?.data?.message || "User not found with this email.");
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Back link */}
      <Link
        href="/sign-in"
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mb-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span>Back to login</span>
      </Link>

      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        Forgot Password?
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
      </p>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 w-full rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/30">
          {errorMessage}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
            Email Address
          </label>
          <div className="relative mt-2 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="block w-full rounded-xl border-0 bg-zinc-50/50 py-3 pl-11 pr-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {/* Footer Support link */}
      <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Having trouble?{" "}
        <a href="/support" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
          Contact Support
        </a>
      </p>
    </div>
  );
}
