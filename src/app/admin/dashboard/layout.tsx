"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks";
import AdminDashboardSidebar from "@/components/dashboard/admin/AdminDashboardSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const authUserStr = localStorage.getItem("authUser");
    if (!authUserStr) {
      router.replace("/sign-in");
    } else {
      try {
        const authUser = JSON.parse(authUserStr);
        if (authUser.role !== "admin" && authUser.email !== "admin@gmail.com") {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Error parsing authUser in admin layout:", err);
        router.replace("/sign-in");
      }
    }
  }, [router]);
  const { user } = useAppSelector((state) => state.auth);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      toast.info(`Searching admin records for: "${searchVal}"`);
    }
  };

  const adminName = user?.name || "Administrator";

  return (
    <div className="flex bg-zinc-50/20 dark:bg-zinc-950/10 min-h-screen text-zinc-800 dark:text-zinc-200">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-72 shrink-0 h-screen sticky top-0 z-30 bg-zinc-50/70 dark:bg-zinc-950">
        <AdminDashboardSidebar />
      </aside>

      {/* RIGHT MAIN CONTENT PANEL */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        
        {/* TOP DEDICATED HEADER */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          
          {/* Left search form & Mobile hamburger */}
          <div className="flex items-center gap-3.5 flex-1 max-w-lg">
            {/* Hamburger (Mobile only) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <svg className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Search across store..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
              />
            </form>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Notification bell with red badge */}
            <button
              onClick={() => toast.info("No new administrative notifications.")}
              className="relative text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Notifications"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Grid app-launcher icon */}
            <button
              onClick={() => toast.info("Apps launcher coming soon!")}
              className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              title="System Apps"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-3.75-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>

            {/* Administrator profile badge */}
            <div className="flex items-center gap-2">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
                alt="admin-avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
              />
              <span className="hidden sm:inline text-xs font-bold text-zinc-800 dark:text-zinc-250">
                {adminName}
              </span>
            </div>

          </div>
        </header>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-zinc-50/30 dark:bg-zinc-950/20">
          {children}
        </main>

      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileDrawerOpen(false)} />
          
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-950 shadow-2xl animate-slide-right z-55 flex flex-col">
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-zinc-50 dark:bg-zinc-900 p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer z-20"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex-1 h-full">
              <AdminDashboardSidebar onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
