"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Link from "next/link";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/hooks";
import { clearCredentials } from "@/lib/features/auth/authSlice";

interface SidebarProps {
  onCloseMobileDrawer?: () => void;
}

export default function DashboardSidebar({ onCloseMobileDrawer }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-3.75-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/dashboard/orders",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
        </svg>
      ),
    },
    {
      name: "Wishlist",
      path: "/dashboard/wishlist",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
    },
    {
      name: "Addresses",
      path: "/dashboard/addresses",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    },
    {
      name: "Payment Methods",
      path: "/dashboard/payments",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 8.25h12.75M2.25 5.25h16.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.12-1.125V6.375c0-.621.504-1.125 1.125-1.125z" />
        </svg>
      ),
    },
    {
      name: "Support",
      path: "/dashboard/support",
      icon: (
        <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      ),
    },
  ];

  const handleItemClick = (name: string, path: string) => {
    if (path === "#") {
      toast.info(`${name} view is under construction`);
    }
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  const handleUpgrade = () => {
    toast.success("Thank you! Upgraded to Plus membership successfully.");
  };

  const handleLogoutConfirm = () => {
    setIsModalOpen(false);
    dispatch(clearCredentials());
    toast.success("Sign out successful!");
    router.push("/sign-in");
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };


  return (
    <>
      <div className="flex flex-col justify-between h-full bg-white dark:bg-zinc-950 p-6 select-none border-r border-zinc-100 dark:border-zinc-900">
      
      {/* Brand & Menu */}
      <div className="space-y-8">
        
        {/* Branding header with Customer Portal subtitle */}
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-serif text-lg font-bold tracking-[0.05em] text-blue-600 dark:text-blue-450 uppercase pl-3">
            Aura Marketplace
          </Link>
          <span className="text-[10px] font-semibold text-zinc-400 pl-3 mt-1 block">
            Customer Portal
          </span>
        </div>

        {/* Links stack */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path) && item.path !== "#");
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => handleItemClick(item.name, item.path)}
                className={`w-full flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                    : "text-zinc-655 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

      </div>

      {/* Plus upgrade button block */}
      <div className="space-y-5 mt-6">
        
        {/* Grey Star Button */}
        <button
          onClick={handleUpgrade}
          className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl py-3 text-xs font-extrabold transition-all cursor-pointer text-center border border-zinc-200/40 dark:border-zinc-800 shadow-xs"
        >
          <svg className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-450" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <span>Upgrade to Plus</span>
        </button>

        {/* Bottom items Settings and Logout */}
        <div className="space-y-0.5 border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <Link
            href="/dashboard/settings"
            onClick={() => handleItemClick("Settings", "/dashboard/settings")}
            className={`w-full flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              pathname === "/dashboard/settings"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                : "text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100"
            }`}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94z" />
            </svg>
            <span>Settings</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer transition-colors text-left"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Logout</span>
          </button>
        </div>

      </div>
    </div>

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
          <div className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-zinc-100 dark:border-zinc-900 dark:bg-zinc-950 transition-all scale-100 duration-300">
            {/* Sign Out Warning Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Sign Out of LUXE</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to log out? You will need to sign in again to access your profile, cart, and orders.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition-colors cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
