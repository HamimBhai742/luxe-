"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyAccountForm() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(179); // 2 minutes 59 seconds (179 seconds)
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace back-focus
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Ensure exactly 6 digits

    const digits = pastedData.split("");
    setCode(digits);
    inputRefs.current[5]?.focus(); // Focus last box after pasting
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length < 6) return;

    console.log("Verifying OTP code:", verificationCode);
    // Successful verify mock logic.
    // Redirect to password reset.
    router.push("/forgot-password/reset");
  };

  const handleResend = () => {
    setTimeLeft(179); // Reset countdown timer
    setCode(Array(6).fill("")); // Reset inputs
    inputRefs.current[0]?.focus(); // Refocus first input
    console.log("Resending OTP Code...");
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Lock Badge */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 mb-5">
        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>

      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        Verify Account
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
        Enter the 6-digit code sent to <span className="font-semibold text-zinc-900 dark:text-white">j.doe@example.com</span>
      </p>

      {/* OTP Input Form */}
      <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2.5">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              required
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 text-center text-lg font-bold text-zinc-950 shadow-sm outline-none ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800"
            />
          ))}
        </div>

        {/* Timer / Resend Links Row */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {/* Expiration Timer */}
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Code expires in {formatTime(timeLeft)}</span>
          </div>

          {/* Resend button */}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
          >
            Resend Code
          </button>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all duration-300"
        >
          <span>Verify & Proceed</span>
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </form>

      {/* Footer link to login */}
      <Link
        href="/sign-in"
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors mt-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span>Return to Login</span>
      </Link>
    </div>
  );
}
