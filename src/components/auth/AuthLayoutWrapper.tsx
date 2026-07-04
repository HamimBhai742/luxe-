import Image from "next/image";
import Link from "next/link";

interface AuthLayoutWrapperProps {
  children: React.ReactNode;
  type: "signin" | "signup" | "forgot" | "verify" | "reset";
}

export default function AuthLayoutWrapper({ children, type }: AuthLayoutWrapperProps) {
  const isSignIn = type === "signin";
  const isSignUp = type === "signup";
  const isForgot = type === "forgot";
  const isVerify = type === "verify";
  const isReset = type === "reset";

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white dark:bg-black">
      {/* ========================================================================= */}
      {/* MOBILE SPECIFIC VIEWPORT LAYOUT (< md) */}
      {/* ========================================================================= */}
      
      {/* Mobile Top Navbar */}
      <header className="flex h-14 w-full items-center justify-between border-b border-zinc-100 bg-white px-4 md:hidden dark:border-zinc-900 dark:bg-black">
        {/* Hamburger Menu */}
        <button className="text-zinc-700 dark:text-zinc-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Center: Brand Logo */}
        <Link href="/" className="text-xl font-bold tracking-[0.25em] text-blue-600 dark:text-blue-500 font-sans uppercase">
          {isVerify || isReset ? "LUXE" : "AURA"}
        </Link>

        {/* Right: Cart */}
        <button className="text-zinc-700 dark:text-zinc-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </header>

      {/* Mobile Illustration (placed above card on mobile only) */}
      <div className="flex flex-col items-center justify-center p-6 md:hidden bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="relative w-44 h-44">
          <Image
            src="/images/auth_security.png"
            alt="Security Lock Isometric Diagram"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP SPLIT PANEL LAYOUT (>= md) */}
      {/* ========================================================================= */}
      
      {/* Left Panel: High-end Sidebar */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between p-12 lg:p-16 overflow-hidden">
        
        {/* Render background based on auth stage */}
        {isSignIn || isSignUp ? (
          <>
            <div className="absolute inset-0 bg-linear-to-b from-zinc-200 via-zinc-400 to-zinc-700 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-800 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(255,255,255,0.15)_0,transparent_55%)] z-1" />
            <div className="absolute inset-0 bg-[radial-gradient(at_100%_100%,rgba(0,0,0,0.25)_0,transparent_55%)] z-1" />
          </>
        ) : isForgot ? (
          <>
            <div className="absolute inset-0 bg-linear-to-b from-zinc-50 to-zinc-150 dark:from-zinc-900 dark:to-zinc-950 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(255,255,255,0.8)_0,transparent_60%)] dark:bg-none z-1" />
          </>
        ) : isVerify ? (
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth_silk.png"
              alt="Silk fabric waves"
              fill
              className="object-cover object-center"
            />
            {/* Overlay to soften image */}
            <div className="absolute inset-0 bg-white/20 dark:bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/auth_reset_bg.png"
              alt="Reset Password mockup background"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-white/10 dark:bg-black/40" />
          </div>
        )}

        {/* Top: Logo Branding */}
        <div className="relative z-10 flex items-center space-x-3.5">
          {/* Brand/Security Icon */}
          {isReset ? (
            /* Lock Icon */
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : (
            /* Diamond Icon */
            <svg className={`h-6 w-6 ${isForgot || isVerify ? "text-zinc-800 dark:text-zinc-200" : "text-white dark:text-zinc-200"}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L12 15.75L21 6.75M21 12.75l-9 9l-9-9L12 3.75l9 9z" />
            </svg>
          )}

          <Link href="/" className={`font-serif text-lg font-bold tracking-[0.25em] uppercase ${
            isVerify || isReset
              ? "text-blue-600 dark:text-blue-400"
              : isForgot
              ? "text-zinc-800 dark:text-zinc-200"
              : "text-white dark:text-zinc-200"
          }`}>
            {isVerify || isReset ? "LUXE" : "AURA"}
          </Link>
        </div>

        {/* Bottom: Sidebar Text Content */}
        <div className="relative z-10 max-w-lg mt-auto">
          {isSignIn || isSignUp ? (
            <div className="text-white">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                {isSignIn ? (
                  <>Welcome back to the <span className="block text-zinc-100">future of retail.</span></>
                ) : (
                  <>Join the community of <span className="block text-zinc-100">minimalist design.</span></>
                )}
              </h2>
              <p className="mt-4 text-sm lg:text-base text-zinc-200/90 dark:text-zinc-400 leading-relaxed font-normal">
                Experience seamless commerce with Aura Marketplace&apos;s premium digital storefront platform.
              </p>
            </div>
          ) : isForgot ? (
            <div className="text-zinc-900 dark:text-white">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                Invisible Excellence
              </h2>
              <p className="mt-4 text-sm lg:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                Regain access to your premium tools and storefronts with ease and security.
              </p>
            </div>
          ) : isVerify ? (
            <div className="text-zinc-900 dark:text-white">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                Secure Your Experience.
              </h2>
              <p className="mt-4 text-sm lg:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                We utilize advanced encryption and two-factor authentication to ensure your high-value transactions remain strictly confidential.
              </p>
            </div>
          ) : null /* Reset password has card visual instead */}
        </div>
      </div>

      {/* Right Panel: Content Form Panel */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-zinc-50 dark:bg-zinc-950/20">
        <div className="w-full max-w-md rounded-2xl md:bg-white md:p-8 md:shadow-xl md:ring-1 md:ring-zinc-100 dark:md:bg-zinc-900 dark:md:ring-zinc-900">
          {children}
        </div>
      </div>
    </div>
  );
}
