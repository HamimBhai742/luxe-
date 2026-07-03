/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResetPasswordMutation } from "@/lib/features/auth/authApi";
import { toast } from "sonner";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    const email = typeof window !== "undefined" ? sessionStorage.getItem("resetEmail") || "" : "";
    const token = typeof window !== "undefined" ? sessionStorage.getItem("resetToken") || "" : "";
    const otp = typeof window !== "undefined" ? sessionStorage.getItem("resetOtp") || "" : "";

    if (!email) {
      setErrorMessage("Session expired. Please request a new OTP link.");
      return;
    }

    try {
      const response = await resetPassword({
        email,
        token,
        otp,
        password,
      }).unwrap();

      if (response.success) {
        setSuccess(true);
        // Clean up
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("resetOtp");
        toast.success("Password reset successfully! Redirecting to login...");

        setTimeout(() => {
          router.push("/sign-in");
        }, 2500);
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      setErrorMessage(err?.data?.message || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        Set New Password
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        Your new password must be different from previously used passwords.
      </p>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 w-full rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/30">
          {errorMessage}
        </div>
      )}

      {/* Form */}
      {!success ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
              New Password
            </label>
            <div className="relative mt-2 rounded-xl shadow-sm">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border-0 bg-zinc-50/50 py-3 pl-4 pr-11 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800 dark:focus:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.24 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
              Confirm Password
            </label>
            <div className="relative mt-2 rounded-xl shadow-sm">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-xl border-0 bg-zinc-50/50 py-3 pl-4 pr-11 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800 dark:focus:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.24 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-center">
          <svg className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
            Password Reset Successfully!
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Redirecting you back to login screen...
          </span>
        </div>
      )}
    </div>
  );
}
