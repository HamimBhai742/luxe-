/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface BrandItem {
  id: string;
  name: string;
  website: string;
  status: "Active" | "Pending" | "Suspended";
  productsCount: number;
  performance: string; // e.g. "+12%", "0%", "-5%", "-"
  visibility: "Featured" | "Public" | "Private" | "Hidden";
}

const INITIAL_BRANDS: BrandItem[] = [
  {
    id: "brand-1",
    name: "Nova Electronics",
    website: "nova-electronics.aura.com",
    status: "Active",
    productsCount: 1245,
    performance: "+12%",
    visibility: "Featured",
  },
  {
    id: "brand-2",
    name: "Auralis Apparel",
    website: "auralis.aura.com",
    status: "Active",
    productsCount: 342,
    performance: "0%",
    visibility: "Public",
  },
  {
    id: "brand-3",
    name: "Haven Home",
    website: "haven.aura.com",
    status: "Pending",
    productsCount: 0,
    performance: "-",
    visibility: "Private",
  },
  {
    id: "brand-4",
    name: "Velocity Sports",
    website: "velocity.aura.com",
    status: "Suspended",
    productsCount: 89,
    performance: "-5%",
    visibility: "Hidden",
  },
];

export default function AdminBrandsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [brands, setBrands] = useState<BrandItem[]>(INITIAL_BRANDS);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All"); // Mock selector
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Create/Edit modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");
  const [productsCount, setProductsCount] = useState("");
  const [performance, setPerformance] = useState("+0%");
  const [visibility, setVisibility] = useState<"Featured" | "Public" | "Private" | "Hidden">("Public");

  // Edit states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Derived state to check if modal should be open (either triggered locally or via URL params)
  const isModalOpen = localIsModalOpen || searchParams.get("create") === "true";

  // Close menus on click outside
  useEffect(() => {
    if (!activeMenuId) return;
    const handleCloseMenus = () => setActiveMenuId(null);
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, [activeMenuId]);

  // Auto-generate website suffix from brand name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingBrandId && val) {
      const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setWebsite(`${slugified}.aura.com`);
    }
  };

  const closeModal = () => {
    setLocalIsModalOpen(false);
    // Clear query parameter
    if (searchParams.get("create") === "true") {
      router.replace("/admin/dashboard/brands");
    }
    // Clear form inputs
    setName("");
    setWebsite("");
    setStatus("Active");
    setProductsCount("");
    setPerformance("+0%");
    setVisibility("Public");
    setEditingBrandId(null);
  };

  const handleCreateBrand = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (brand: BrandItem) => {
    setEditingBrandId(brand.id);
    setName(brand.name);
    setWebsite(brand.website);
    setStatus(brand.status);
    setProductsCount(String(brand.productsCount));
    setPerformance(brand.performance);
    setVisibility(brand.visibility);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteBrand = (id: string, brandName: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    toast.success(`Brand "${brandName}" deleted successfully!`);
    setActiveMenuId(null);
  };

  const handleBulkDelete = () => {
    if (selectedBrands.length === 0) return;
    setBrands((prev) => prev.filter((b) => !selectedBrands.includes(b.id)));
    toast.success(`Successfully deleted ${selectedBrands.length} brand(s)!`);
    setSelectedBrands([]);
  };

  const handleSubmitBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !website) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (editingBrandId) {
      setBrands((prev) =>
        prev.map((b) => {
          if (b.id === editingBrandId) {
            return {
              ...b,
              name,
              website,
              status,
              productsCount: productsCount === "" ? 0 : Number(productsCount),
              performance,
              visibility,
            };
          }
          return b;
        })
      );
      toast.success("Brand updated successfully!");
    } else {
      const newBrand: BrandItem = {
        id: `brand-${Date.now()}`,
        name,
        website,
        status,
        productsCount: productsCount === "" ? 0 : Number(productsCount),
        performance: performance || "-",
        visibility,
      };

      setBrands((prev) => [newBrand, ...prev]);
      toast.success("Brand created successfully!");
    }
    closeModal();
  };

  const handleExport = () => {
    toast.info("Export CSV action triggered!");
  };

  const toggleSelectAll = () => {
    if (selectedBrands.length === brands.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(brands.map((b) => b.id));
    }
  };

  const toggleSelectBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Search logic
  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      b.website.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "Active":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-650 dark:bg-zinc-805 dark:text-zinc-400">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
            Suspended
          </span>
        );
    }
  };

  const renderPerformanceIndicator = (perf: string) => {
    if (perf === "-") {
      return <span className="text-zinc-350 dark:text-zinc-600 font-bold">-</span>;
    }
    const isPositive = perf.startsWith("+");
    const isNegative = perf.startsWith("-");

    if (isPositive) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-555">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
          </svg>
          {perf}
        </span>
      );
    }
    if (isNegative) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.281m5.94-2.28l-2.28-5.941" />
          </svg>
          {perf}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
        {perf}
      </span>
    );
  };

  const renderVisibilityBadge = (vis: string) => {
    switch (vis) {
      case "Featured":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-150 px-2 py-0.5 text-[10px] font-bold text-blue-650 dark:bg-blue-950/20 dark:border-blue-900/50 dark:text-blue-400">
            <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z" />
            </svg>
            Featured
          </span>
        );
      case "Public":
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-650 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
            Public
          </span>
        );
      case "Private":
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-100 border border-zinc-250 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-350">
            Private
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-200/50 border border-zinc-305 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-850 dark:border-zinc-800 dark:text-zinc-500">
            Hidden
          </span>
        );
    }
  };

  const renderBrandLogo = (name: string) => {
    const initial = name ? name.charAt(0).toUpperCase() : "B";
    const bgColors = [
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
      "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
      "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    ];
    const colorIndex = name.charCodeAt(0) % bgColors.length;

    return (
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-150 dark:border-zinc-800 font-extrabold text-xs shadow-xs ${bgColors[colorIndex]}`}>
        {initial}
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
            <span className="text-zinc-650 dark:text-zinc-350">Brands</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">Brands</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your marketplace brands, partnerships, and brand-level settings.</p>
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
            onClick={handleCreateBrand}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add New Brand</span>
          </button>
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
              placeholder="Filter brands..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative min-w-36">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Category Dropdown (Mock filter) */}
            <div className="relative min-w-36">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Home">Home Goods</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

        </div>

        {/* Brand list representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 w-12 border-0">
                  <input
                    type="checkbox"
                    checked={selectedBrands.length === brands.length && brands.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-905"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Brand</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Status</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Products</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Performance</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Visibility</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px] border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 border-0">
                    No brands match your search filters.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const isSelected = selectedBrands.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors border-b border-zinc-100 dark:border-zinc-900/50 last:border-0 ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 border-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectBrand(b.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </td>

                      {/* Brand Info */}
                      <td className="py-4 px-4 border-0">
                        <div className="flex items-center gap-3">
                          {renderBrandLogo(b.name)}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-900 dark:text-white leading-tight">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                              {b.website}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 border-0">
                        {renderStatusBadge(b.status)}
                      </td>

                      {/* Products count */}
                      <td className="py-4 px-4 text-xs font-bold text-zinc-700 dark:text-zinc-300 border-0">
                        {b.productsCount.toLocaleString()}
                      </td>

                      {/* Performance */}
                      <td className="py-4 px-4 border-0">
                        {renderPerformanceIndicator(b.performance)}
                      </td>

                      {/* Visibility */}
                      <td className="py-4 px-4 border-0">
                        {renderVisibilityBadge(b.visibility)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right relative border-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(b)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Edit Brand"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === b.id ? null : b.id));
                            }}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-655 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                        </div>

                        {/* Dropdown overlay */}
                        {activeMenuId === b.id && (
                          <div className="absolute right-6 mt-1.5 w-28 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(b)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Update</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteBrand(b.id, b.name)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-450 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
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
            Showing 1 to {filteredBrands.length} of {brands.length} brands
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
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
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

      {/* Add / Update Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                  </svg>
                  {editingBrandId ? "Update Brand Details" : "Create New Brand"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingBrandId ? "Modify details for this catalog provider and save." : "Register a brand or marketplace vendor partnership."}
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
            <form onSubmit={handleSubmitBrand} className="space-y-4">
              
              {/* Brand Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Techs"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Website URL / Slug Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="zenith.aura.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Brand Status *
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-705 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Visibility Badge */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Storefront Visibility *
                  </label>
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="Featured">Featured (Starred)</option>
                      <option value="Public">Public (All Channels)</option>
                      <option value="Private">Private (Restricted)</option>
                      <option value="Hidden">Hidden (Catalog Only)</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Products Count Initial */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Initial Products Count
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 120"
                    value={productsCount}
                    onChange={(e) => setProductsCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>

                {/* Performance Growth */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Performance Indicator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +15% or -"
                    value={performance}
                    onChange={(e) => setPerformance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
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
                  {editingBrandId ? "Save Changes" : "Save Brand"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedBrands.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">
            {selectedBrands.length} brand{selectedBrands.length > 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-black text-red-400 hover:text-red-300 dark:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer"
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
