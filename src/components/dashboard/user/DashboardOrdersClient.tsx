"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  name: string;
  image: string;
  specs: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  items: OrderItem[];
  deliveryDate?: string;
  progressStep?: number; // 1: Confirmed, 2: Packed, 3: Shipped, 4: Delivered
}

const MOCK_ORDERS: Order[] = [
  {
    id: "#ORD-7732",
    date: "Oct 24, 2023",
    status: "Delivered",
    total: 349.99,
    deliveryDate: "Oct 27, 2023",
    items: [
      {
        name: "Aura Sonic Pro ANC Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
        specs: "Matte Black • Qty: 1",
        qty: 1,
        price: 299.99,
      },
      {
        name: "Nylon Braided USB-C Cable",
        image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=400&auto=format&fit=crop",
        specs: "2 Meters • Qty: 2",
        qty: 2,
        price: 25.00,
      },
    ],
  },
  {
    id: "#ORD-8105",
    date: "Nov 02, 2023",
    status: "Shipped",
    total: 1299.00,
    deliveryDate: "Nov 05, 2023",
    progressStep: 3,
    items: [
      {
        name: "NovaBook Pro 14\"",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop",
        specs: "Silver • 16GB RAM • 512GB SSD",
        qty: 1,
        price: 1299.00,
      },
    ],
  },
  {
    id: "#ORD-8921",
    date: "Nov 12, 2023",
    status: "Shipped",
    total: 349.99,
    progressStep: 3,
    items: [
      {
        name: "Aura Sonic Pro ANC Headphones - Matte Black",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
        specs: "Matte Black",
        qty: 1,
        price: 349.99,
      },
    ],
  },
  {
    id: "#ORD-8844",
    date: "Oct 24, 2023",
    status: "Delivered",
    total: 129.50,
    deliveryDate: "Oct 27, 2023",
    items: [
      {
        name: "Keychron K3 Ultra-slim Wireless Mechanical Keyboard",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=400&auto=format&fit=crop",
        specs: "White Backlight • Gateron Low Profile Red",
        qty: 1,
        price: 129.50,
      },
    ],
  },
];

export default function DashboardOrdersClient() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState("wishlist"); // Highlight wishlist icon in mockup bottom nav

  const handleInvoice = (orderId: string) => {
    toast.success(`Downloading invoice for order ${orderId}...`);
  };

  const handleReview = (name: string) => {
    toast.success(`Opening review writer for: ${name}`);
  };

  const handleBuyAgain = (name: string) => {
    toast.success(`Re-added ${name} to shopping cart!`);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: "Cancelled" } : ord))
    );
    toast.success(`Cancelled order ${orderId}`);
  };

  const handleTrackOrder = (orderId: string) => {
    toast.success(`Tracking delivery status for ${orderId}...`);
  };

  // Search & Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Filter Category
      if (activeFilter !== "All" && activeFilter !== "All Orders") {
        if (ord.status !== activeFilter) return false;
      }
      // Search Box Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = ord.id.toLowerCase().includes(query);
        const matchesItems = ord.items.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        return matchesId || matchesItems;
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase font-serif">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-zinc-450 dark:text-zinc-500 font-semibold">
            View and manage your recent purchases and returns.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-xs">
          
          {/* Filter tabs list */}
          <div className="flex flex-wrap gap-1">
            {["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
              const isActive = activeFilter === tab || (tab === "All Orders" && activeFilter === "All");
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab === "All Orders" ? "All" : tab)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search box & Duration */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Order ID or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white hover:bg-zinc-55 px-4 py-2 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 cursor-pointer shadow-xs">
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Past 3 months</span>
            </button>
          </div>

        </div>

        {/* List of Orders */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl text-center">
              <svg className="h-12 w-12 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25M3.75 7.5L5.621 3.757A1.5 1.5 0 016.964 3h10.071a1.5 1.5 0 011.343.803L20.25 7.5m-16.5 0H20.25" />
              </svg>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No orders found</h3>
              <p className="mt-1 text-xs text-zinc-400">Try adjusting your filters or query to find items.</p>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
              >
                {/* Header strip */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-zinc-150 dark:border-zinc-800">
                  <div className="flex gap-8 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Order ID</span>
                      <span className="text-zinc-850 dark:text-white">{ord.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Date Placed</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{ord.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Total Amount</span>
                      <span className="text-zinc-850 dark:text-white text-sm font-extrabold">${ord.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div>
                    {ord.status === "Delivered" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-900/10">
                        &#8226; Delivered
                      </span>
                    ) : ord.status === "Shipped" ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-100/50 dark:border-blue-900/10">
                        &#8226; Shipped
                      </span>
                    ) : ord.status === "Cancelled" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-650 dark:bg-red-950/20 dark:text-red-450">
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-800">
                        Processing
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in order */}
                <div className="p-6 divide-y divide-zinc-100 dark:divide-zinc-800/80 space-y-5">
                  {ord.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-6 pt-5 first:pt-0">
                      <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                        <img src={item.image} alt={item.name} className="object-contain max-h-full max-w-full" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">{item.name}</h4>
                        <p className="text-xs text-zinc-400 dark:text-zinc-555 mt-1 font-semibold">{item.specs}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress tracker widget (if active) */}
                {ord.status === "Shipped" && ord.progressStep && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="max-w-xl mx-auto">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line background */}
                        <div className="absolute left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800 -z-10 rounded-full" />
                        {/* Active Line indicator */}
                        <div
                          className="absolute left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all"
                          style={{ width: `${((ord.progressStep - 1) / 3) * 100}%` }}
                        />

                        {/* Steps circles */}
                        {[
                          { label: "Confirmed", step: 1 },
                          { label: "Packed", step: 2 },
                          { label: "Shipped", step: 3 },
                          { label: "Delivered", step: 4 },
                        ].map((s) => {
                          const isDone = s.step < ord.progressStep!;
                          const isCurrent = s.step === ord.progressStep!;
                          return (
                            <div key={s.label} className="flex flex-col items-center">
                              <div
                                className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                  isDone
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : isCurrent
                                    ? "bg-white border-blue-600 dark:bg-zinc-900 text-blue-600 ring-4 ring-blue-50 dark:ring-blue-950/20"
                                    : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-300"
                                }`}
                              >
                                {isDone ? (
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                ) : isCurrent ? (
                                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                                ) : null}
                              </div>
                              <span className={`text-[10px] font-extrabold mt-2.5 uppercase tracking-wide ${
                                isDone || isCurrent ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer buttons row */}
                <div className="bg-zinc-50/25 dark:bg-zinc-900/30 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-450">
                    {ord.status === "Delivered" ? (
                      <span className="flex items-center gap-1.5 text-emerald-650 dark:text-emerald-450">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Delivered on {ord.deliveryDate}</span>
                      </span>
                    ) : ord.status === "Cancelled" ? (
                      <span className="text-red-500">Order Cancelled</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
                        </svg>
                        <span>Estimated delivery: {ord.deliveryDate}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInvoice(ord.id)}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>Invoice</span>
                    </button>

                    {ord.status === "Delivered" ? (
                      <>
                        <button
                          onClick={() => handleReview(ord.items[0]?.name || "item")}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer"
                        >
                          Write a Review
                        </button>
                        <button
                          onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          <span>Buy Again</span>
                        </button>
                      </>
                    ) : ord.status === "Shipped" ? (
                      <>
                        <button
                          onClick={() => handleCancelOrder(ord.id)}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-350 shadow-sm transition-all cursor-pointer"
                        >
                          Cancel Order
                        </button>
                        <button
                          onClick={() => handleTrackOrder(ord.id)}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span>Track Order</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col bg-zinc-50/40 dark:bg-zinc-950/20 pb-20">
        
        {/* Mobile search bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Mobile Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3.5 scrollbar-none shrink-0 select-none">
          {["All", "Processing", "Shipped", "Delivered"].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Mobile Card list */}
        <div className="space-y-4 px-4 pt-1">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-150 p-6">
              <span className="text-xs font-bold text-zinc-400">No matching orders</span>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850 rounded-2xl p-4 shadow-sm space-y-4"
              >
                {/* Mobile Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-zinc-850 dark:text-white font-serif">{ord.id}</h4>
                    <span className="text-[10px] font-bold text-zinc-400 block mt-0.5">{ord.date}</span>
                  </div>
                  <div>
                    {ord.status === "Delivered" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        {ord.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Item Info */}
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img src={ord.items[0]?.image} alt={ord.items[0]?.name} className="object-contain max-h-full max-w-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-zinc-800 dark:text-white leading-tight truncate">
                      {ord.items[0]?.name}
                    </h5>
                    <span className="text-[10px] font-semibold text-zinc-400 block mt-1">
                      Qty: {ord.items[0]?.qty}
                    </span>
                  </div>
                </div>

                {/* Milestone Progress Indicators (if active) */}
                {ord.status === "Shipped" && (
                  <div className="py-2 border-t border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-bold text-zinc-400">
                    <div className="flex items-center gap-1">
                      <span className="h-4.5 w-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black">✓</span>
                      <span className="text-zinc-800 dark:text-zinc-200">Confirmed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-4.5 w-4.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[8px] font-black">✓</span>
                      <span className="text-zinc-800 dark:text-zinc-200">Packed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-4.5 w-4.5 rounded-full border-2 border-blue-650 flex items-center justify-center"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /></span>
                      <span className="text-blue-650 dark:text-blue-400">Shipped</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-40">
                      <span className="h-4.5 w-4.5 rounded-full border-2 border-zinc-200" />
                      <span>Delivered</span>
                    </div>
                  </div>
                )}

                {/* Mobile Bottom Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    ${ord.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <div className="flex gap-2">
                    {ord.status === "Delivered" ? (
                      <>
                        <button
                          onClick={() => handleReview(ord.items[0]?.name || "item")}
                          className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-300"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                          className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"
                        >
                          Buy Again
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleInvoice(ord.id)}
                          className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-650 dark:text-zinc-300"
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => handleTrackOrder(ord.id)}
                          className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"
                        >
                          Track Order
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Mobile Navigation Dock (Active Wishlist circular overlay matches screenshot design) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-900 px-6 py-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <Link href="/" onClick={() => setActiveMobileTab("home")} className="flex flex-col items-center gap-0.5 transition-colors">
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </Link>

            <Link href="/collections" onClick={() => setActiveMobileTab("search")} className="flex flex-col items-center gap-0.5 transition-colors">
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </Link>

            <button
              onClick={() => setActiveMobileTab("wishlist")}
              className={`flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-all shadow-xs ${
                activeMobileTab === "wishlist" ? "bg-blue-600 text-white" : "text-zinc-450 hover:bg-zinc-50"
              }`}
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>

            <Link href="/dashboard" onClick={() => setActiveMobileTab("profile")} className="flex flex-col items-center gap-0.5 transition-colors">
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
