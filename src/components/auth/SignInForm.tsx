/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoginMutation, useGoogleLoginMutation } from "@/lib/features/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { setCartItems } from "@/lib/features/cart/cartSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { loadGoogleGIS } from "@/lib/googleOAuth";
import { toast } from "sonner";
import { useAddToWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useSyncDbCartMutation } from "@/lib/features/api/cartApi";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [syncDbCart] = useSyncDbCartMutation();
  const cartItems = useAppSelector((state) => state.cart.items);

  const syncLocalCartToBackend = async () => {
    if (cartItems.length > 0) {
      try {
        const payload = {
          items: cartItems.map((item) => ({
            productId: String(item.id),
            quantity: item.quantity,
            specsText: item.specsText,
          })),
        };
        const syncResult = await syncDbCart(payload).unwrap();
        if (syncResult.success && syncResult.data) {
          const mapped = syncResult.data.map((item: any) => ({
            id: item.productId,
            productId: String(item.productId),
            name: item.product.name,
            brand: item.product.brand || "LUXE",
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            specsText: item.specsText || "",
          }));
          dispatch(setCartItems(mapped));
        }
      } catch (err) {
        console.error("Failed to sync guest cart items on login:", err);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    try {
      const google = await loadGoogleGIS();
      const client = google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const result = await googleLogin({ accessToken: tokenResponse.access_token }).unwrap();
              if (result.success) {
                dispatch(
                  setCredentials({
                    user: result.data,
                    accessToken: result.accessToken,
                  })
                );
                toast.success("Signed in successfully with Google!");
                await syncLocalCartToBackend();
                
                const pendingWishlistId = localStorage.getItem("pendingWishlistAdd");
                if (pendingWishlistId) {
                  try {
                    await addToWishlist({ productId: pendingWishlistId }).unwrap();
                    localStorage.removeItem("pendingWishlistAdd");
                    toast.success("Product successfully added to your wishlist!");
                    router.push("/dashboard/wishlist");
                    return;
                  } catch (wishlistErr) {
                    console.error("Failed to auto-add pending wishlist item:", wishlistErr);
                  }
                }
                
                if (redirect) {
                  router.push(redirect);
                } else {
                  router.push("/");
                }
              }
            } catch (err: any) {
              console.error("Google verification error:", err);
              const errorMsg = err?.data?.message || "Google authentication failed on server.";
              setErrorMessage(errorMsg);
              toast.error(errorMsg);
            }
          } else {
            setErrorMessage("Did not receive access token from Google.");
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error("Google SDK loading error:", error);
      setErrorMessage("Failed to load Google login SDK.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const result = await login({ email, password }).unwrap();
      if (result.success) {
        // Dispatch setCredentials to save user details and tokens
        dispatch(
          setCredentials({
            user: result.data,
            accessToken: result.accessToken,
          })
        );
        toast.success("Signed in successfully!");
        await syncLocalCartToBackend();
        
        const pendingWishlistId = localStorage.getItem("pendingWishlistAdd");
        if (pendingWishlistId && result.data.role !== "admin" && email !== "admin@gmail.com") {
          try {
            await addToWishlist({ productId: pendingWishlistId }).unwrap();
            localStorage.removeItem("pendingWishlistAdd");
            toast.success("Product successfully added to your wishlist!");
            router.push("/dashboard/wishlist");
            return;
          } catch (wishlistErr) {
            console.error("Failed to auto-add pending wishlist item:", wishlistErr);
          }
        }

        if (redirect) {
          router.push(redirect);
        } else if (result.data.role === "admin" || email === "admin@gmail.com") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.data?.message || "";
      if (err?.status === 403 && msg.toLowerCase().includes("verify")) {
        // Email verification required, save email and route to verify-account
        sessionStorage.setItem("verifyEmail", email);
        router.push("/verify-account");
      } else {
        const errorMsg = msg || "Invalid email or password.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
        Sign In
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
        Enter your credentials to access your account
      </p>

      {/* Quick Test Login Credentials */}
      <div className="mt-6 w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick Test Login
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic">Click to autofill</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setEmail("dakokno230@gmail.com");
              setPassword("Hamim@742");
            }}
            className="flex flex-col items-start gap-1 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-left transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer shadow-sm group"
          >
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-zinc-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Demo User
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate w-full">dakokno230@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail("admin@gmail.com");
              setPassword("Hamim@742");
            }}
            className="flex flex-col items-start gap-1 p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-left transition-all duration-200 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer shadow-sm group"
          >
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-zinc-400 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              Demo Admin
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate w-full">admin@gmail.com</span>
          </button>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mt-4 w-full rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-950/30">
          {errorMessage}
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="mt-8 w-full">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-250 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {/* Branded Google Logo */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>
        <span className="relative bg-zinc-50 dark:bg-zinc-950 md:bg-white dark:md:bg-zinc-900 px-3 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
          Or continue with email
        </span>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
            Email Address
          </label>
          <div className="relative mt-2 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              {/* Mail Icon */}
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
              placeholder="you@example.com"
              className="block w-full rounded-xl border-0 bg-zinc-50/50 py-3 pl-11 pr-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800 dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold tracking-wide text-zinc-700 dark:text-zinc-300 uppercase">
            Password
          </label>
          <div className="relative mt-2 rounded-xl shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              {/* Lock Icon */}
              <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full rounded-xl border-0 bg-zinc-50/50 py-3 pl-11 pr-11 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900/50 dark:text-white dark:ring-zinc-800 dark:focus:bg-zinc-900"
            />
            {/* Password Visibility Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? (
                /* Eye Slash Icon */
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.24 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                /* Eye Icon */
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
            />
            <label htmlFor="remember-me" className="ml-2 block text-zinc-600 dark:text-zinc-400">
              Remember me
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          <span>{isLoading ? "Signing In..." : "Sign In"}</span>
          {!isLoading && (
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          )}
        </button>
      </form>

      {/* Redirect footer link */}
      <p className="mt-8 text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
