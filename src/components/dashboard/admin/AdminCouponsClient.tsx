/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface CouponItem {
  id: string;
  code: string;
  type: "Percentage" | "Fixed Amount" | "Free Shipping";
  value: string; // e.g. "20%", "$15.00", "Standard"
  usageUsed: number;
  usageMax: number; // -1 represents Infinity
  expiryDate: string; // "Never" or Date format e.g. "Dec 31, 2024"
  status: "Active" | "Expired" | "Scheduled";
}

const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";

export default function AdminCouponsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);

  // Create/Edit modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"Percentage" | "Fixed Amount" | "Free Shipping">("Percentage");
  const [value, setValue] = useState("");
  const [usageUsed, setUsageUsed] = useState("0");
  const [usageMax, setUsageMax] = useState("");
  const [isInfiniteUsage, setIsInfiniteUsage] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [isNeverExpiry, setIsNeverExpiry] = useState(false);
  const [status, setStatus] = useState<"Active" | "Expired" | "Scheduled">("Active");

  // Edit states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Derived state to check if modal should be open (either triggered locally or via URL params)
  const isModalOpen = localIsModalOpen || searchParams.get("create") === "true";

  // Calculate stats dynamically
  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter((c) => c.status === "Active").length;
  const inactiveCouponsCount = coupons.length - activeCouponsCount;
  const totalRedemptionsCount = coupons.reduce((sum, c) => sum + c.usageUsed, 0);

  const totalSavingsVal = coupons.reduce((sum, c) => {
    const discountVal = parseFloat(c.value.replace(/[^0-9.]/g, "")) || 0;
    const itemSavings = c.type === "Percentage"
      ? (discountVal / 100) * 60 // 60 USD average order
      : c.type === "Fixed Amount"
        ? discountVal
        : 8.5; // Free shipping value
    return sum + (c.usageUsed * itemSavings);
  }, 0);
  const displaySavings = totalSavingsVal >= 1000
    ? `$${(totalSavingsVal / 1000).toFixed(1)}K`
    : `$${totalSavingsVal.toFixed(2)}`;


  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/coupons`);
        const data = await res.json();
        if (data.success) {
          setCoupons(data.data);
        } else {
          toast.error(data.message || "Failed to fetch coupons");
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to fetch coupons from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
  }, [API_URL]);

  // Close menus on click outside
  useEffect(() => {
    if (!activeMenuId) return;
    const handleCloseMenus = () => setActiveMenuId(null);
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, [activeMenuId]);

  const closeModal = () => {
    setLocalIsModalOpen(false);
    // Clear query parameter
    if (searchParams.get("create") === "true") {
      router.replace("/admin/dashboard/coupons");
    }
    // Clear form inputs
    setCode("");
    setType("Percentage");
    setValue("");
    setUsageUsed("0");
    setUsageMax("");
    setIsInfiniteUsage(false);
    setExpiryDate("");
    setIsNeverExpiry(false);
    setStatus("Active");
    setEditingCouponId(null);
  };

  const handleCreateCoupon = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (coupon: CouponItem) => {
    setEditingCouponId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.replace(/[%$]/g, ""));
    setUsageUsed(String(coupon.usageUsed));
    if (coupon.usageMax === -1) {
      setUsageMax("");
      setIsInfiniteUsage(true);
    } else {
      setUsageMax(String(coupon.usageMax));
      setIsInfiniteUsage(false);
    }
    if (coupon.expiryDate === "Never") {
      setExpiryDate("");
      setIsNeverExpiry(true);
    } else {
      // Try parsing date to format YYYY-MM-DD
      try {
        const dateObj = new Date(coupon.expiryDate);
        if (!isNaN(dateObj.getTime())) {
          const formatted = dateObj.toISOString().split("T")[0];
          setExpiryDate(formatted);
        } else {
          setExpiryDate("");
        }
      } catch {
        setExpiryDate("");
      }
      setIsNeverExpiry(false);
    }
    setStatus(coupon.status);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    try {
      const res = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Coupon "${couponCode}" deleted successfully!`);
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon from server.");
    }
    setActiveMenuId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) return;
    try {
      let successCount = 0;
      for (const id of selectedCoupons) {
        const res = await fetch(`${API_URL}/coupons/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        }
      }
      setCoupons((prev) => prev.filter((c) => !selectedCoupons.includes(c.id)));
      toast.success(`Successfully deleted ${successCount} coupon(s)!`);
      setSelectedCoupons([]);
    } catch (error) {
      console.error("Error bulk deleting coupons:", error);
      toast.error("Failed to complete bulk delete operations.");
    }
  };

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error("Coupon Code is required!");
      return;
    }

    let displayValue = value;
    if (type === "Percentage") {
      displayValue = value.endsWith("%") ? value : `${value}%`;
    } else if (type === "Fixed Amount") {
      displayValue = value.startsWith("$") ? value : `$${Number(value).toFixed(2)}`;
    } else {
      displayValue = "Standard";
    }

    let finalExpiry = "Never";
    if (!isNeverExpiry && expiryDate) {
      finalExpiry = new Date(expiryDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const payload = {
      code: code.toUpperCase(),
      type,
      value: displayValue,
      usageUsed: Number(usageUsed) || 0,
      usageMax: isInfiniteUsage ? -1 : Number(usageMax) || 100,
      expiryDate: finalExpiry,
      status,
    };

    const toastId = toast.loading(editingCouponId ? "Updating coupon..." : "Creating coupon...");

    try {
      let res;
      if (editingCouponId) {
        res = await fetch(`${API_URL}/coupons/${editingCouponId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/coupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        if (editingCouponId) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCouponId ? responseData.data : c))
          );
          toast.success("Coupon updated successfully!", { id: toastId });
        } else {
          setCoupons((prev) => [responseData.data, ...prev]);
          toast.success("Coupon created successfully!", { id: toastId });
        }
        closeModal();
      } else {
        if (responseData.errors && responseData.errors.code) {
          toast.error(responseData.errors.code, { id: toastId });
        } else {
          toast.error(responseData.message || "Failed to save coupon.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Error submitting coupon:", error);
      toast.error("An error occurred while saving the coupon.", { id: toastId });
    }
  };

  const handleExport = () => {
    toast.info("Export CSV action triggered!");
  };

  const toggleSelectAll = () => {
    if (selectedCoupons.length === coupons.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(coupons.map((c) => c.id));
    }
  };

  const toggleSelectCoupon = (id: string) => {
    setSelectedCoupons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Search logic
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.type.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesStatus = selectedStatus === "All" || c.status === selectedStatus;
    const matchesType = selectedType === "All" || c.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-750 dark:bg-red-950/20 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
    }
  };

  const renderUsageBar = (used: number, max: number) => {
    if (max === -1) {
      return (
        <div className="flex flex-col w-28">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{used} / ∞</span>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: "10%" }} />
          </div>
        </div>
      );
    }
    const percent = Math.min((used / max) * 100, 100);
    return (
      <div className="flex flex-col w-28">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{used} / {max}</span>
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${percent >= 100 ? "bg-red-500" : "bg-blue-600"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
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
            <span className="text-zinc-650 dark:text-zinc-350">Coupons</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">Coupons</h1>
          <p className="text-xs text-zinc-400 mt-1">Create and manage promotional discounts and coupon codes.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-705 dark:text-zinc-300 cursor-pointer shadow-xs transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export</span>
          </button>
          
          <button
            onClick={handleCreateCoupon}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Coupons */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 flex justify-between items-center relative overflow-hidden shadow-xs">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Total Coupons</span>
            <span className="text-3xl font-black text-zinc-955 dark:text-white mt-2 block">{totalCouponsCount}</span>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {activeCouponsCount} Active
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-350" />
                {inactiveCouponsCount} Inactive
              </span>
            </div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50/60 dark:bg-zinc-900">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
        </div>

        {/* Card 2: Total Savings */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 flex justify-between items-center relative overflow-hidden shadow-xs">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Total Savings</span>
            <span className="text-3xl font-black text-zinc-955 dark:text-white mt-2 block">{displaySavings}</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-3">
              <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
              </svg>
              +12.5% vs last month
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50/60 dark:bg-zinc-900">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Redemptions */}
        <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 flex justify-between items-center relative overflow-hidden shadow-xs">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Total Redemptions</span>
            <span className="text-3xl font-black text-zinc-955 dark:text-white mt-2 block">{totalRedemptionsCount.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-zinc-400 mt-3.5 block">Across {activeCouponsCount} active campaigns</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50/60 dark:bg-zinc-900">
            <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
            </svg>
          </div>
        </div>

      </div>


      {/* Main Console Box */}
      <div className="rounded-3xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950 overflow-hidden shadow-xs">
        
        {/* Filters Bar */}
        <div className="border-b border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search by code or name..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative min-w-28">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Scheduled">Scheduled</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Discount Type Dropdown */}
            <div className="relative min-w-36">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Discount Type</option>
                <option value="Percentage">Percentage</option>
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Free Shipping">Free Shipping</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

        </div>

        {/* Coupons list representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 w-12 border-0">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-905"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Coupon Code</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Type</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Value</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Usage</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Expiry Date</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Status</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px] border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold border-0">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-650" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching coupons catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400 border-0">
                    No coupon codes match your filters.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isSelected = selectedCoupons.includes(c.id);
                  const isExpired = c.status === "Expired";
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors border-b border-zinc-100 dark:border-zinc-900/50 last:border-0 ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 border-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCoupon(c.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-955"
                        />
                      </td>

                      {/* Coupon Code */}
                      <td className="py-4 px-4 border-0">
                        <span className="font-extrabold text-blue-600 dark:text-blue-450 uppercase tracking-wide">
                          {c.code}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-650 dark:text-zinc-400 border-0">
                        {c.type}
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 text-xs font-black text-zinc-800 dark:text-zinc-200 border-0">
                        {c.value}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-4 border-0">
                        {renderUsageBar(c.usageUsed, c.usageMax)}
                      </td>

                      {/* Expiry Date */}
                      <td className={`py-4 px-4 text-xs font-bold border-0 ${isExpired ? "text-red-600 dark:text-red-500" : "text-zinc-500"}`}>
                        {c.expiryDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 border-0">
                        {renderStatusBadge(c.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right relative border-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === c.id ? null : c.id));
                            }}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-655 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                        </div>

                        {/* Dropdown overlay */}
                        {activeMenuId === c.id && (
                          <div className="absolute right-6 mt-1.5 w-28 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(c)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-705 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Update</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.id, c.code)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-450 dark:hover:bg-red-955/20 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-red-405" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-550">
            Showing 1 to {filteredCoupons.length} of {coupons.length} entries
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Prev */}
            <button
              onClick={() => toast.info("Opening previous page...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              &lt;
            </button>

            {/* 1 */}
            <button className="rounded-xl bg-blue-600 text-white px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs shadow-blue-500/10">
              1
            </button>

            {/* 2 */}
            <button
              onClick={() => toast.info("Opening page 2...")}
              className="rounded-xl border border-zinc-255 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              2
            </button>

            <span className="text-xs font-bold text-zinc-400 px-1 select-none">...</span>

            {/* Next */}
            <button
              onClick={() => toast.info("Opening next page...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Add / Update Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-955 dark:text-white flex items-center gap-2">
                  <svg className="h-5.5 w-5.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21a.75.75 0 01-1.127.65l-2.243-1.32-2.243 1.32a.75.75 0 01-.754 0l-2.243-1.32-2.243 1.32a.75.75 0 01-1.127-.65V3.757c0-.987.808-1.782 1.808-1.782h9.704c.983 0 1.785.785 1.808 1.768z" />
                  </svg>
                  {editingCouponId ? "Update Coupon Rule" : "Create New Coupon"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingCouponId ? "Modify parameters for this promotional discount code." : "Add a new coupon campaign with constraints."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full bg-zinc-50 dark:bg-zinc-900 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              
              {/* Coupon Code */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Discount Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Discount Type *
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-955 transition-all cursor-pointer"
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed Amount">Fixed Amount ($)</option>
                      <option value="Free Shipping">Free Shipping</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="text"
                    required={type !== "Free Shipping"}
                    disabled={type === "Free Shipping"}
                    placeholder={type === "Percentage" ? "20" : type === "Fixed Amount" ? "15.00" : "Standard"}
                    value={type === "Free Shipping" ? "Standard" : value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-305 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Usage limit */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 items-center justify-between">
                    <span>Usage Limit</span>
                    <label className="flex items-center gap-1 text-[9px] font-semibold text-zinc-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInfiniteUsage}
                        onChange={(e) => setIsInfiniteUsage(e.target.checked)}
                        className="h-3 w-3 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Infinite (∞)</span>
                    </label>
                  </label>
                  <input
                    type="number"
                    disabled={isInfiniteUsage}
                    placeholder="e.g. 500"
                    value={isInfiniteUsage ? "" : usageMax}
                    onChange={(e) => setUsageMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 items-center justify-between">
                    <span>Expiry Date</span>
                    <label className="flex items-center gap-1 text-[9px] font-semibold text-zinc-500 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNeverExpiry}
                        onChange={(e) => setIsNeverExpiry(e.target.checked)}
                        className="h-3 w-3 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Never</span>
                    </label>
                  </label>
                  <input
                    type="date"
                    disabled={isNeverExpiry}
                    value={isNeverExpiry ? "" : expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1.5">
                  Coupon Status *
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-955 transition-all cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-zinc-250 py-2.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-905 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  {editingCouponId ? "Save Changes" : "Save Coupon"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedCoupons.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">
            {selectedCoupons.length} coupon{selectedCoupons.length > 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-black text-red-400 hover:text-red-300 dark:text-red-650 dark:hover:text-red-550 transition-colors cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span>Delete Selected</span>
          </button>
        </div>
      )}

    </div>
  );
}
