/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface TransactionItem {
  id: string;
  transactionId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string | null;
  amount: number;
  status: "Succeeded" | "Pending" | "Failed" | "Refunded";
  method: "Stripe" | "Wire Transfer" | "Credit Card" | "bKash";
}

interface StatsState {
  totalVolume: number;
  pendingPayout: number;
  successRate: number;
  totalTransactions: number;
}

export default function AdminTransactionsClient() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMethod, setSelectedMethod] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("30d"); // mockup default: Last 30 Days

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Statistics state
  const [stats, setStats] = useState<StatsState>({
    totalVolume: 1200000,
    pendingPayout: 84000,
    successRate: 99.1,
    totalTransactions: 14203,
  });

  // Transaction detail view modal state
  const [viewingTransaction, setViewingTransaction] = useState<TransactionItem | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          search: filterSearch,
          status: selectedStatus,
          method: selectedMethod,
          dateRange: selectedDateRange,
        });

        const res = await fetch(`${API_URL}/transactions?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setTransactions(data.data);
          setTotalPages(data.meta.totalPages);
          setTotalItems(data.meta.total);
          if (data.meta.stats) {
            setStats(data.meta.stats);
          }
        } else {
          toast.error(data.message || "Failed to fetch transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast.error("Failed to fetch transactions from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [API_URL, currentPage, itemsPerPage, filterSearch, selectedStatus, selectedMethod, selectedDateRange]);


  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "Succeeded":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
            &bull; Succeeded
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-3 py-0.5 text-xs font-black text-blue-700 dark:text-blue-400">
            &bull; Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 px-3 py-0.5 text-xs font-black text-red-700 dark:text-red-400">
            &bull; Failed
          </span>
        );
      default:
        // Refunded
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-0.5 text-xs font-black text-zinc-650 dark:text-zinc-400">
            &#x21B6; Refunded
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderMethodIconAndLabel = (method: string) => {
    // Generate icons matching UI design mockup
    switch (method) {
      case "Stripe":
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <svg className="h-4.5 w-4.5 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v-3a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v3" />
            </svg>
            <span>Stripe</span>
          </div>
        );
      case "Wire Transfer":
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <svg className="h-4.5 w-4.5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12h-15A1.5 1.5 0 013 19.5v-3h18v3a1.5 1.5 0 01-1.5 1.5zM10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <span>Wire Transfer</span>
          </div>
        );
      case "bKash":
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <div className="h-4.5 w-4.5 rounded-md bg-pink-600 flex items-center justify-center text-[7px] font-black text-white select-none">
              bK
            </div>
            <span>bKash</span>
          </div>
        );
      default:
        // Credit Card
        return (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <svg className="h-4.5 w-4.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h19.5m-19.5 0a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25m-19.5 0v-3a2.25 2.25 0 012.25-2.25h15a2.25 2.25 0 012.25 2.25v3" />
            </svg>
            <span>Credit Card</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Admin</span>
            <svg className="h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-zinc-650 dark:text-zinc-350">Transactions</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">Transactions</h1>
        </div>
      </div>

      {/* STATS CONSOLE DECK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Volume */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Total Volume
            </span>
            <svg className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.374.049m3.374-.049l-.049 3.374" />
            </svg>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
              ${(stats.totalVolume / 1000000).toFixed(1)}M
            </h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <span>+12.5%</span>
              <span className="text-zinc-400 dark:text-zinc-550 font-semibold">from last month</span>
            </p>
          </div>
        </div>

        {/* Card 2: Pending Payouts */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Pending Payouts
            </span>
            <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A48.536 48.536 0 0112 3m0 0c-2.923 0-5.786.104-8.625.308a2.25 2.25 0 00-2.006 2.24v12.75a2.25 2.25 0 002.006 2.24C5.176 20.912 8.01 21 11.25 21" />
            </svg>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
              ${(stats.pendingPayout / 1000).toFixed(0)}k
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-550 font-semibold mt-1.5">
              23 transfers processing
            </p>
          </div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Success Rate
            </span>
            <svg className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">
              {stats.successRate}%
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-550 font-semibold mt-1.5">
              Based on {stats.totalTransactions.toLocaleString()} transactions
            </p>
          </div>
        </div>

      </div>

      {/* Main Console Box */}
      <div className="rounded-3xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-955 overflow-hidden shadow-xs animate-fade-in">
        
        {/* Filters Bar */}
        <div className="border-b border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 lg:flex-row lg:items-center">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search ID, Customer, or Amount..."
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-805 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Dropdown */}
            <div className="relative min-w-36">
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Date Range</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-450 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Status Dropdown */}
            <div className="relative min-w-32">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Status</option>
                <option value="Succeeded">Succeeded</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-450 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Method Dropdown */}
            <div className="relative min-w-32">
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Method</option>
                <option value="Stripe">Stripe</option>
                <option value="Wire Transfer">Wire Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="bKash">bKash</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-455 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

        </div>

        {/* Transactions Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 font-bold text-[10px] border-0">Transaction ID</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Date & Time</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Customer</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Amount</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Status</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Method</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px] border-0">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold border-0">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-650" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching ledger transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 border-0">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr
                    key={trx.id}
                    className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors border-b border-zinc-100 dark:border-zinc-900/50 last:border-0 ${
                      trx.status === "Failed" ? "opacity-60" : ""
                    }`}
                  >
                    {/* Transaction ID */}
                    <td className="py-4 pl-6 text-xs font-black text-zinc-900 dark:text-white border-0">
                      {trx.transactionId}
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4 border-0">
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                          {trx.date}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold mt-0.5">
                          {trx.time}
                        </span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-4 border-0">
                      <div className="flex items-center gap-3">
                        {trx.customerAvatar ? (
                          <div className="relative h-7.5 w-7.5 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <Image
                              src={trx.customerAvatar}
                              alt="Avatar"
                              fill
                              sizes="30px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-7.5 w-7.5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-black text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">
                            {getInitials(trx.customerName)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-zinc-850 dark:text-white leading-none">
                            {trx.customerName}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold mt-0.5">
                            {trx.customerEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className={`py-4 px-4 text-xs font-black border-0 ${
                      trx.amount < 0
                        ? "text-red-650 dark:text-red-400"
                        : "text-zinc-850 dark:text-white"
                    }`}>
                      {trx.amount < 0 ? "-" : ""}${Math.abs(trx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4 border-0">
                      {renderStatusBadge(trx.status)}
                    </td>

                    {/* Method details */}
                    <td className="py-4 px-4 border-0">
                      {renderMethodIconAndLabel(trx.method)}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 pr-6 text-right border-0">
                      <button
                        type="button"
                        onClick={() => setViewingTransaction(trx)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        {trx.status === "Failed" ? (
                          <svg className="h-4.5 w-4.5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        ) : (
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        )}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-550">
            Showing {transactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems.toLocaleString()} entries
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {/* Dynamic Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`rounded-xl px-3.5 py-2 text-xs font-black cursor-pointer transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/10"
                    : "border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300"
                } disabled:opacity-50`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Transaction Details Modal (READ-ONLY) */}
      {viewingTransaction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 scale-100 duration-300 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">
                  Transaction Audit Log
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                  {viewingTransaction.transactionId} &bull; {viewingTransaction.date} {viewingTransaction.time}
                </p>
              </div>
              <button
                onClick={() => setViewingTransaction(null)}
                className="rounded-full bg-zinc-50 dark:bg-zinc-900 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Summary Information */}
            <div className="space-y-4 py-2 text-xs">
              
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-850">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Customer</span>
                  <span className="font-extrabold text-zinc-850 dark:text-zinc-200 block mt-1">{viewingTransaction.customerName}</span>
                  <span className="text-zinc-450 dark:text-zinc-500 font-medium block mt-0.5">{viewingTransaction.customerEmail}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Gross Value</span>
                  <span className={`font-black block mt-1 text-sm ${viewingTransaction.amount < 0 ? "text-red-500" : "text-zinc-850 dark:text-white"}`}>
                    {viewingTransaction.amount < 0 ? "-" : ""}${Math.abs(viewingTransaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Settlement Status</span>
                  {renderStatusBadge(viewingTransaction.status)}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">Payment Method</span>
                  {renderMethodIconAndLabel(viewingTransaction.method)}
                </div>
              </div>

              {viewingTransaction.status === "Failed" && (
                <div className="rounded-xl bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 p-3 text-red-750 dark:text-red-400">
                  <p className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>Declined Transaction Reason</span>
                  </p>
                  <p className="mt-1 font-semibold text-[11px]">The card issuer declined this transaction due to insufficient funds or incorrect expiration date details.</p>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex items-center pt-3 border-t border-zinc-100 dark:border-zinc-900 mt-6">
              <button
                type="button"
                onClick={() => setViewingTransaction(null)}
                className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 py-2.5 text-xs font-extrabold transition-colors cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
