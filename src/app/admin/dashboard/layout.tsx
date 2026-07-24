"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks";
import AdminDashboardSidebar from "@/components/dashboard/admin/AdminDashboardSidebar";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkSingleAsReadMutation,
  useClearAllNotificationsMutation,
} from "@/lib/features/api/notificationApi";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { data: notifData } = useGetNotificationsQuery(undefined, { pollingInterval: 6000 });
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markSingleAsRead] = useMarkSingleAsReadMutation();
  const [clearAllNotifications] = useClearAllNotificationsMutation();

  const notifications = notifData?.success ? notifData.data : [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const prevNotificationsRef = useRef<any[]>([]);

  // Close notifications popover on click outside
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleCloseNotif = () => setIsNotifOpen(false);
    document.addEventListener("click", handleCloseNotif);
    return () => document.removeEventListener("click", handleCloseNotif);
  }, [isNotifOpen]);

  // Play sound when a new notification is received
  useEffect(() => {
    if (notifications.length > 0 && prevNotificationsRef.current.length > 0) {
      const hasNewNotif = notifications.some(
        (newNotif: any) => !prevNotificationsRef.current.some((prevNotif) => prevNotif.id === newNotif.id)
      );

      if (hasNewNotif) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            
            // Synthesize a beautiful notification chime
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(830.61, ctx.currentTime);
            gain1.gain.setValueAtTime(0.15, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start();
            osc1.stop(ctx.currentTime + 0.5);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.1);
            gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.7);
          }
        } catch (err) {
          console.error("Failed to synthesize chime:", err);
        }
      }
    }
    prevNotificationsRef.current = notifications;
  }, [notifications]);

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
            
            {/* Notification bell with dropdown wrapper */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900"
                title="Notifications"
              >
                <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left animate-fade-in flex flex-col max-h-[500px]">
                  
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
                    <span className="text-sm font-extrabold text-zinc-950 dark:text-white uppercase font-serif tracking-wider">
                      Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                    </span>
                    <div className="flex gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await markAllAsRead().unwrap();
                              toast.success("All notifications marked as read!");
                            } catch (e) {
                              toast.error("Failed to mark all as read");
                            }
                          }}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={async () => {
                            try {
                              await clearAllNotifications().unwrap();
                              toast.success("Notifications cleared!");
                            } catch (e) {
                              toast.error("Failed to clear notifications");
                            }
                          }}
                          className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-500 cursor-pointer"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown List Body */}
                  <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold text-xs flex flex-col items-center justify-center gap-2">
                        <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-800" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        <span>No administrative notifications</span>
                      </div>
                    ) : (
                      notifications.map((notif: any) => {
                        let typeColor = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400";
                        if (notif.type === "new_order") {
                          typeColor = "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400";
                        } else if (notif.type === "cancelled_order") {
                          typeColor = "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400";
                        }

                        return (
                          <div
                            key={notif.id}
                            onClick={async () => {
                              if (!notif.isRead) {
                                try {
                                  await markSingleAsRead({ id: notif.id }).unwrap();
                                } catch (e) {
                                  console.error("Failed to mark single read:", e);
                                }
                              }
                            }}
                            className={`flex gap-3 border rounded-2xl p-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all ${
                              notif.isRead
                                ? "bg-white border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800/50 opacity-60"
                                : "bg-blue-50/10 border-blue-100/50 dark:bg-blue-950/5 dark:border-blue-900/20 font-semibold"
                            }`}
                          >
                            {/* Type Icon Indicator */}
                            <div className={`h-8 w-8 rounded-xl border flex items-center justify-center shrink-0 ${typeColor}`}>
                              {notif.type === "new_order" && (
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                              )}
                              {notif.type === "cancelled_order" && (
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                              {notif.type !== "new_order" && notif.type !== "cancelled_order" && (
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                              )}
                            </div>

                            {/* Message Details */}
                            <div className="flex-1 flex flex-col text-xs">
                              <span className="font-extrabold text-zinc-900 dark:text-white">{notif.title}</span>
                              <span className="text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{notif.message}</span>
                              <span className="text-[9px] text-zinc-400 mt-1.5 font-bold">
                                {new Date(notif.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              )}
            </div>

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
