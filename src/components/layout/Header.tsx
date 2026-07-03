"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCredentials } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutConfirm = () => {
    setIsModalOpen(false);
    dispatch(clearCredentials());
    router.push("/sign-in");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-900 dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="font-serif text-2xl font-bold tracking-[0.2em] text-zinc-900 dark:text-white">
            LUXE
          </Link>
        </div>

        {/* Middle-Left: Search Bar */}
        <div className="hidden max-w-xs flex-1 px-4 lg:block">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4.5 w-4.5 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search premium products..."
              className="w-full rounded-md border-0 bg-zinc-50 py-1.5 pl-10 pr-3 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800"
            />
          </div>
        </div>

        {/* Middle: Navigation Links */}
        <nav className="hidden md:flex space-x-8">
          <Link
            href="/new-arrivals"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            New Arrivals
          </Link>
          <Link
            href="/designers"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Designers
          </Link>
          <Link
            href="/collections"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/sustainability"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Sustainability
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-5">
          {/* Favorites */}
          <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>

          {/* Cart with badge */}
          <Link href="/cart" className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              3
            </span>
          </Link>

          <ThemeToggle />

          {/* User Account Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Dropdown Box */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none z-50">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800"></div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <svg className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors text-left"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Notifications */}
          <button className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </button>
        </div>
      </div>

    </header>
    
      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-zinc-100 dark:border-zinc-900 dark:bg-zinc-950 transition-all scale-100 duration-300">
            {/* Sign Out Warning Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Sign Out of LUXE</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to log out? You will need to sign in again to access your profile, cart, and orders.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 rounded-xl bg-red-650 py-2.5 text-xs font-semibold border border-zinc-200 text-zinc-700 hover:text-white shadow-sm hover:bg-red-500 transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
