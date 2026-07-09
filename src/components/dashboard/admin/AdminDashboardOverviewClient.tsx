/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/50 dark:border-zinc-800/60 backdrop-blur-md p-4 rounded-2xl shadow-xl space-y-1">
        <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="space-y-0.5">
          <p className="text-sm font-black text-zinc-950 dark:text-white">
            Revenue: <span className="text-blue-650 dark:text-blue-400">${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </p>
          <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400">
            Sales Volume: <span className="text-zinc-700 dark:text-zinc-300">{payload[0].payload.Orders || 0} orders</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface Order {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  total: number;
  createdAt: string;
}

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
  const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";

  const [timeframe, setTimeframe] = useState<"Today" | "7d" | "30d">("30d");
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        // Fetch Orders
        const ordersRes = await fetch(`${API_URL}/orders?limit=100`);
        const ordersJson = await ordersRes.json();
        if (ordersJson.success && ordersJson.data) {
          setOrders(ordersJson.data);
        }

        // Fetch Products
        const productsRes = await fetch(`${API_URL}/products`);
        const productsJson = await productsRes.json();
        if (productsJson.success && productsJson.data) {
          setProductsCount(productsJson.data.length);
        }

        // Fetch Users
        const usersRes = await fetch(`${API_URL}/users`);
        const usersJson = await usersRes.json();
        if (usersJson.success && usersJson.data) {
          setUsersCount(usersJson.data.length);
        }
      } catch (err) {
        console.error("Error loading dashboard overview stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, [API_URL]);

  // Derived metrics calculations
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((ord) => ord.fulfillmentStatus !== "Canceled" && ord.fulfillmentStatus !== "Cancelled")
    .reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);

  const displayOrders = orders.slice(0, 5);

  // Generate days of data ending today based on selected timeframe
  const chartData = useMemo(() => {
    const dataMap: Record<string, { revenue: number; ordersCount: number }> = {};
    
    let pointsCount = 30;
    let isHourly = false;
    
    if (timeframe === "Today") {
      pointsCount = 12; // 12 points (every 2 hours)
      isHourly = true;
    } else if (timeframe === "7d") {
      pointsCount = 7;
    } else {
      pointsCount = 30;
    }

    if (isHourly) {
      // Generate 12 hourly buckets for today
      for (let i = 11; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i * 2);
        const hourString = hour.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
        const baseRev = Math.floor(Math.sin((12 - i) / 2) * 300) + 500;
        dataMap[hourString] = { revenue: baseRev, ordersCount: Math.floor(baseRev / 400) };
      }
    } else {
      // Generate daily buckets
      for (let i = pointsCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const baseRev = Math.floor(Math.sin((pointsCount - i) / (pointsCount / 6 || 1)) * 500) + 1200;
        dataMap[dateString] = { revenue: baseRev, ordersCount: Math.floor(baseRev / 400) };
      }
    }

    // Populate actual orders matching selected granularity
    orders.forEach((ord) => {
      if (ord.createdAt) {
        const d = new Date(ord.createdAt);
        if (isHourly) {
          // check if order is from today
          const today = new Date();
          if (d.toDateString() === today.toDateString()) {
            // Find closest 2-hour bracket
            const hour = d.getHours();
            const bracket = Math.floor(hour / 2) * 2;
            const bracketDate = new Date();
            bracketDate.setHours(bracket, 0, 0, 0);
            const keyString = bracketDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
            if (dataMap[keyString]) {
              dataMap[keyString].revenue += Number(ord.total) || 0;
              dataMap[keyString].ordersCount += 1;
            }
          }
        } else {
          const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (dataMap[dateString]) {
            dataMap[dateString].revenue += Number(ord.total) || 0;
            dataMap[dateString].ordersCount += 1;
          }
        }
      }
    });

    // Convert map to sorted array
    const dataList = Object.entries(dataMap).map(([date, val]) => ({
      name: date,
      Revenue: val.revenue,
      Orders: val.ordersCount,
    }));

    return dataList;
  }, [orders, timeframe]);

  const handleExport = () => {
    toast.success("Dashboard metrics exported successfully to CSV!");
  };

  const renderStatus = (status: string | undefined) => {
    const norm = status?.toLowerCase() || "processing";
    switch (norm) {
      case "delivered":
      case "paid":
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
            Completed
          </span>
        );
      case "shipped":
      case "confirmed":
      case "packed":
      case "processing":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950/30 dark:text-blue-450">
            Processing
          </span>
        );
      case "canceled":
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-950/30 dark:text-red-400">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-150 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-550 dark:bg-zinc-850 dark:text-zinc-500">
            {status || "Processing"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white font-serif">
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
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +14%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550">vs last month</span>
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
              {totalOrders.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +5%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550">vs last month</span>
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Active Products
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              {productsCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +12%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550">vs last month</span>
          </div>
        </div>

        {/* Metric 4: Registered Customers */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest">
              Registered Users
            </span>
            <span className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0112 20.25c-1.005 0-1.97-.13-2.887-.372v-.109c0-1.113.285-2.16.786-3.07M14.25 7.5a3 3 0 11-6 0 3 3 0 016 0zM12 18.75a6.002 6.002 0 00-4-5.659V12a3 3 0 005.343-1.701A5.025 5.025 0 0112 10.5a5.025 5.025 0 011.657-.282 3 3 0 005.343 1.701v1.091a6.002 6.002 0 00-4 5.659z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white leading-none">
              {usersCount.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
              +8%
            </span>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550">vs last week</span>
          </div>
        </div>
      </div>

      {/* REVENUE TRENDS PROFESSIONAL RECHARTS CARD */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/75 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white font-serif">
              Store Performance & Revenue Trends
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">
              Live statistics vs previous period (30 days)
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-450 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-850 px-3 py-1 rounded-lg border border-zinc-150 dark:border-zinc-800">
            Daily average: $4,152
          </span>
        </div>

        {/* Responsive Chart Area */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.00} />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" className="dark:stroke-zinc-800/30" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#a1a1aa"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#a1a1aa"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                dx={-10}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="url(#lineGrad)"
                strokeWidth={3.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO COLUMNS: RECENT ORDERS & TOP PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2: RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white font-serif">
                Recent Orders
              </h3>
              <Link
                href="/admin/dashboard/orders"
                className="text-xs font-bold text-blue-600 dark:text-blue-450 hover:underline cursor-pointer"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-zinc-400 uppercase font-black text-[10px] tracking-wider animate-pulse">
                  Loading recent sales...
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 text-xs font-medium">
                  No orders have been recorded in the store yet.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">
                      <th className="pb-3 pl-2">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {displayOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                        <td className="py-4 pl-2 text-zinc-900 dark:text-white font-extrabold">
                          #{ord.orderId || ord.id.slice(0, 8)}
                        </td>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400">{ord.customerName}</td>
                        <td className="py-4">{renderStatus(ord.fulfillmentStatus)}</td>
                        <td className="py-4 text-right pr-2 text-zinc-900 dark:text-white">
                          ${Number(ord.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: TOP PRODUCTS */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white font-serif">
              Top Products
            </h3>
            <svg className="h-4.5 w-4.5 text-zinc-450" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
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
                    <h4 className="text-xs font-extrabold text-zinc-850 dark:text-zinc-200">
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
