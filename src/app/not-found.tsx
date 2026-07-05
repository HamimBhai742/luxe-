/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to collections page with the search query
      router.push(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 dark:bg-zinc-950/50 transition-colors duration-300">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto w-full">
        {/* Card illustration container */}
        <div className="relative w-full max-w-md aspect-4/3 rounded-2xl border border-zinc-100 bg-white/60 p-4 shadow-xl backdrop-blur-sm dark:border-zinc-900/80 dark:bg-zinc-900/60 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] mb-8">
          <div className="absolute inset-0 bg-linear-to-tr from-blue-50/20 via-transparent to-zinc-50/30 dark:from-blue-950/10 dark:to-zinc-950/10 pointer-events-none" />
          
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Minimalist preview of website name in top left of card */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 opacity-60">
              <span className="font-serif text-[10px] font-extrabold tracking-[0.2em] text-zinc-900 dark:text-white">
                LUXE
              </span>
              <span className="text-[8px] tracking-wider text-zinc-400 font-mono">
                Marketplace
              </span>
            </div>

            {/* Float effect around the bag */}
            <div className="relative w-52 h-52 animate-bounce [animation-duration:4s]">
              <Image
                src="/images/not_found_bag.png"
                alt="Page Not Found Illustration"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 208px"
                className="object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)] transition-transform duration-500 rounded-xl"
              />
            </div>
            
            {/* Subtle card text */}
            <div className="absolute bottom-2 text-center">
              <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Page Not Found
              </h2>
              <p className="text-[8px] text-zinc-400/85 dark:text-zinc-500/85 mt-0.5">
                The link you followed may be broken or the page has been removed.
              </p>
            </div>
          </div>
        </div>

        {/* 404 Status Code */}
        <h1 className="text-8xl font-black tracking-tight text-blue-650 dark:text-blue-500 select-none animate-pulse [animation-duration:3s]">
          404
        </h1>

        {/* Text Heading */}
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
          Oops! Page not found.
        </h2>
        
        {/* Description */}
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
          The page you're looking for doesn't exist or has been moved to a new destination.
        </p>

        {/* Actions Row */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <Link
            id="back-to-home-btn"
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-655 px-6 py-3.5 text-sm font-semibold text-black shadow-md hover:bg-blue-700 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 active:scale-[0.98]"
          >
            {/* Home Icon */}
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Back to Homepage
          </Link>

          <Link
            id="continue-shopping-btn"
            href="/collections"
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white transition-all duration-200 active:scale-[0.98]"
          >
            {/* Bag Icon */}
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Try searching section inside rounded container */}
        <div className="mt-12 w-full max-w-2xl rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-md dark:border-zinc-900 dark:bg-zinc-900/40 backdrop-blur-sm text-center transition-all duration-300 hover:shadow-lg">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Try searching for something else
          </h3>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-4 relative max-w-md mx-auto">
            <input
              id="not-found-search-input"
              type="text"
              placeholder="Search products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-3 pl-11 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-blue-500 transition-all duration-200"
            />
            <button
              type="submit"
              id="not-found-search-btn"
              className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 hover:text-blue-600 transition-colors"
              aria-label="Search"
            >
              {/* Search Magnifying Glass Icon */}
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z"
                />
              </svg>
            </button>
          </form>

          {/* Popular Categories */}
          <div className="mt-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              Popular Categories
            </h4>

            {/* Responsive grid of categories */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Category 1: Electronics */}
              <Link
                id="cat-electronics-link"
                href="/collections"
                className="flex flex-col items-center p-4 rounded-xl border border-zinc-100 hover:border-blue-500/40 hover:bg-blue-50/5 bg-white dark:border-zinc-900/60 dark:bg-zinc-900/20 dark:hover:border-blue-500/30 dark:hover:bg-blue-950/5 transition-all duration-300 group hover:shadow-sm hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-blue-50 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400 transition-all duration-300 shadow-inner">
                  {/* Screen/Laptop Icon */}
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                </div>
                <span className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  Electronics
                </span>
              </Link>

              {/* Category 2: Fashion */}
              <Link
                id="cat-fashion-link"
                href="/collections"
                className="flex flex-col items-center p-4 rounded-xl border border-zinc-100 hover:border-blue-500/40 hover:bg-blue-50/5 bg-white dark:border-zinc-900/60 dark:bg-zinc-900/20 dark:hover:border-blue-500/30 dark:hover:bg-blue-950/5 transition-all duration-300 group hover:shadow-sm hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-blue-50 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400 transition-all duration-300 shadow-inner">
                  {/* Hanger Icon */}
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m4.188-5.096L14 21m-2-5v-1c0-1.657 1.343-3 3-3h.5m-3.5 0a3.001 3.001 0 013-3h.5a3.001 3.001 0 013 3v2a3.001 3.001 0 01-3 3h-4a3.001 3.001 0 01-3-3v-1.5M12 3v3M5.433 11.233A9.78 9.78 0 0112 8.25c2.502 0 4.793.938 6.567 2.483l1.103-1.103c-2.072-1.93-4.858-3.13-7.67-3.13a10.978 10.978 0 00-7.67 3.13l1.103 1.103z" />
                  </svg>
                </div>
                <span className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  Fashion
                </span>
              </Link>

              {/* Category 3: Home & Living */}
              <Link
                id="cat-home-link"
                href="/collections"
                className="flex flex-col items-center p-4 rounded-xl border border-zinc-100 hover:border-blue-500/40 hover:bg-blue-50/5 bg-white dark:border-zinc-900/60 dark:bg-zinc-900/20 dark:hover:border-blue-500/30 dark:hover:bg-blue-950/5 transition-all duration-300 group hover:shadow-sm hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-blue-50 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400 transition-all duration-300 shadow-inner">
                  {/* Sofa/Couch Icon */}
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v-4.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v4.25m16.5 0a2.25 2.25 0 012.25 2.25v2.25a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-2.25a2.25 2.25 0 012.25-2.25m16.5 0h-16.5m16.5 0a2.25 2.25 0 01-2.25-2.25h-9a2.25 2.25 0 01-2.25 2.25M6 7.65V4.5a.75.75 0 01.75-.75h10.5a.75.75 0 01.75.75v3.15" />
                  </svg>
                </div>
                <span className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  Home & Living
                </span>
              </Link>

              {/* Category 4: Sports */}
              <Link
                id="cat-sports-link"
                href="/collections"
                className="flex flex-col items-center p-4 rounded-xl border border-zinc-100 hover:border-blue-500/40 hover:bg-blue-50/5 bg-white dark:border-zinc-900/60 dark:bg-zinc-900/20 dark:hover:border-blue-500/30 dark:hover:bg-blue-950/5 transition-all duration-300 group hover:shadow-sm hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 group-hover:bg-blue-50 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400 transition-all duration-300 shadow-inner">
                  {/* Dumbbell Icon */}
                  <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6h16.5M6 9v6M18 9v6M9 9h6v6H9V9z" />
                  </svg>
                </div>
                <span className="mt-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  Sports
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
