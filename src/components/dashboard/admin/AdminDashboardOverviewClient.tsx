/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  customer: string;
  status: "Completed" | "Processing" | "Cancelled";
  amount: number;
}

const INITIAL_ORDERS: Order[] = [
  { id: "#ORD-7732", customer: "Sarah Jenkins", status: "Completed", amount: 245.00 },
  { id: "#ORD-7731", customer: "Michael Chen", status: "Processing", amount: 1120.50 },
  { id: "#ORD-7730", customer: "Emma Wilson", status: "Completed", amount: 89.99 },
];

const TOP_PRODUCTS = [
  {
    name: "Pro Wireless Mouse",
    sales: "1,240 sales",
    amount: "$12,400",
    growth: "+12%",
    icon: (
      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    name: "Noise Cancelling Buds",
    sales: "754 sales",
    amount: "$19,640",
    growth: "+8%",
    icon: (
      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
  },
  {
    name: "Smart Watch Series 5",
    sales: "620 sales",
    amount: "$22,620",
    growth: "+5%",
    icon: (
      <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AdminDashboardOverviewClient() {
  const [timeframe, setTimeframe] = useState<"Today" | "7d" | "30d">("30d");
  const [orders] = useState<Order[]>(INITIAL_ORDERS);

  const handleExport = () => {
    toast.success("Dashboard metrics exported successfully to CSV!");
  };

  const renderStatus = (status: Order["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450">
            Completed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            Processing
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Here's what's happening with your store today.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Timeframe selector button group */}
          <div className="inline-flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
            {(["Today", "7d", "30d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  timeframe === t
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-blue-500/20 transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Total Revenue
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-18 9h18m-19.5 0v-8A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v8" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              $124,563.00
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +14%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">vs last month</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Total Orders
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              1,240
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +5%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">vs last month</span>
          </div>
        </div>

        {/* Metric 3: Unique Visitors */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Unique Visitors
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0112 20.25c-1.005 0-1.97-.13-2.887-.372v-.109c0-1.113.285-2.16.786-3.07M14.25 7.5a3 3 0 11-6 0 3 3 0 016 0zM12 18.75a6.002 6.002 0 00-4-5.659V12a3 3 0 005.343-1.701A5.025 5.025 0 0112 10.5a5.025 5.025 0 011.657-.282 3 3 0 005.343 1.701v1.091a6.002 6.002 0 00-4 5.659z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              45,231
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +8%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">vs last week</span>
          </div>
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Conversion Rate
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              3.2%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +2%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">vs last week</span>
          </div>
        </div>
      </div>

      {/* REVENUE TRENDS SVG CHART CARD */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">
            Revenue Trends (Last 30 Days)
          </h2>
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">Daily average: $4,152</span>
        </div>

        {/* Responsive Chart Area */}
        <div className="w-full relative h-[300px]">
          <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            {/* Gradients */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="50" y1="50" x2="950" y2="50" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
            <line x1="50" y1="100" x2="950" y2="100" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
            <line x1="50" y1="150" x2="950" y2="150" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
            <line x1="50" y1="200" x2="950" y2="200" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />
            <line x1="50" y1="250" x2="950" y2="250" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4 4" className="dark:stroke-zinc-800" />

            {/* Area Path */}
            <path
              d="M 50 250 
                 C 100 220, 150 180, 200 170 
                 C 250 160, 300 170, 350 180 
                 C 400 190, 450 185, 500 175 
                 C 550 165, 600 140, 650 110 
                 C 700 80,  750 90,  800 100 
                 C 850 110, 900 140, 950 155 
                 L 950 250 Z"
              fill="url(#chartGradient)"
            />

            {/* Line Path */}
            <path
              d="M 50 250 
                 C 100 220, 150 180, 200 170 
                 C 250 160, 300 170, 350 180 
                 C 400 190, 450 185, 500 175 
                 C 550 165, 600 140, 650 110 
                 C 700 80,  750 90,  800 100 
                 C 850 110, 900 140, 950 155"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive/Highlight Circles */}
            <circle cx="50" cy="250" r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="350" cy="180" r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="650" cy="110" r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="950" cy="155" r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
          </svg>
        </div>

        {/* Labels underneath the chart */}
        <div className="flex justify-between px-[50px] mt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          <span>1</span>
          <span>5</span>
          <span>10</span>
          <span>15</span>
          <span>20</span>
          <span>25</span>
          <span>30</span>
        </div>
      </div>

      {/* TWO COLUMNS: RECENT ORDERS & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">
                Recent Orders
              </h3>
              <button
                onClick={() => toast.info("Full sales orders records listing...")}
                className="text-xs font-bold text-blue-600 dark:text-blue-450 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="pb-3 pl-2">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                      <td className="py-4 pl-2 text-zinc-900 dark:text-white font-extrabold">{ord.id}</td>
                      <td className="py-4 text-zinc-500 dark:text-zinc-400">{ord.customer}</td>
                      <td className="py-4">{renderStatus(ord.status)}</td>
                      <td className="py-4 text-right pr-2 text-zinc-900 dark:text-white">${ord.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUMN 3: TOP PRODUCTS */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white">
              Top Products
            </h3>
            <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-between">
            {TOP_PRODUCTS.map((prod) => (
              <div key={prod.name} className="flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 p-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 shadow-xs border border-zinc-100 dark:border-zinc-800">
                    {prod.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">
                      {prod.sales}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                    {prod.amount}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 flex items-center justify-end gap-0.5">
                    <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                    {prod.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
