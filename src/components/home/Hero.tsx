/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2 select-none">
      
      {/* Self-contained CSS styles for animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(0.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-0.5deg); }
        }
        @keyframes blob-drift {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 8s ease-in-out infinite;
        }
        .animate-blob-drift {
          animation: blob-drift 12s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      {/* Hero Inner Floating Card */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-linear-to-br from-zinc-50/70 via-white to-blue-50/20 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-blue-950/20 py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-12 transition-colors duration-500">
        
        {/* Animated Mesh Blobs */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl animate-blob-drift pointer-events-none z-0" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-purple-400/10 dark:bg-purple-600/10 blur-3xl animate-blob-drift animation-delay-2000 pointer-events-none z-0" />

        {/* Left Side: Content & Actions */}
        <div className="relative z-10 max-w-xl text-left space-y-6">
          {/* New Collection pill */}
          <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20">
            New Collection
          </span>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Elevate Your <span className="block text-blue-600 dark:text-blue-400 mt-1">Tech Aesthetic.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
            Discover the latest premium electronics designed for minimalist workspaces and high-performance lifestyles.
          </p>

          {/* Buttons Stack */}
          <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/collections"
              className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-blue-500 hover:scale-102 hover:shadow-lg transition-all duration-300"
            >
              <span>Shop Now</span>
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <Link
              href="/collections"
              className="inline-flex items-center justify-center px-6 py-3 text-xs sm:text-sm font-extrabold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors duration-300"
            >
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Right Side: Parallax Floating Product Cards */}
        <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col gap-6 lg:gap-8 items-center w-full lg:w-auto shrink-0 select-none">
          
          {/* Card 1: Aura Headphones (Floating slow) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg flex items-center gap-4 w-72 max-w-full backdrop-blur-md animate-float-slow">
            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop"
                alt="Aura Headphones"
                width={64}
                height={64}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-serif truncate">
                Aura Headphones
              </h4>
              <span className="text-xs font-black text-zinc-950 dark:text-zinc-200 block mt-1">
                $249.00
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-1">
                Noise Cancellation
              </span>
            </div>
          </div>

          {/* Card 2: AuraBook Pro (Floating reverse) */}
          <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl p-4 shadow-lg flex items-center gap-4 w-72 max-w-full backdrop-blur-md animate-float-reverse sm:translate-y-8 lg:translate-y-0 lg:translate-x-6">
            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=200&auto=format&fit=crop"
                alt="AuraBook Pro 14"
                width={64}
                height={64}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white font-serif truncate">
                AuraBook Pro 14"
              </h4>
              <span className="text-xs font-black text-zinc-950 dark:text-zinc-200 block mt-1">
                $1,299.00
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-1">
                M3 Pro Chipset
              </span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
