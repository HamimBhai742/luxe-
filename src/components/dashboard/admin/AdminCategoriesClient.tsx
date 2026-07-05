/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parent: string;
  productsCount: number;
  status: "Active" | "Draft" | "Archived";
  visibility: { web: boolean; mobile: boolean };
  iconType: "electronics" | "laptops" | "clothing" | "other";
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Electronics",
    slug: "/electronics",
    parent: "--",
    productsCount: 1245,
    status: "Active",
    visibility: { web: true, mobile: true },
    iconType: "electronics",
  },
  {
    id: "cat-2",
    name: "Laptops",
    slug: "/electronics/laptops",
    parent: "Electronics",
    productsCount: 342,
    status: "Active",
    visibility: { web: true, mobile: false },
    iconType: "laptops",
  },
  {
    id: "cat-3",
    name: "Clothing & Apparel",
    slug: "/clothing",
    parent: "--",
    productsCount: 4502,
    status: "Draft",
    visibility: { web: false, mobile: false },
    iconType: "clothing",
  },
];

export default function AdminCategoriesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirmation modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const [filterSearch, setFilterSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Create/Edit modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState("--");
  const [productsCount, setProductsCount] = useState("");
  const [status, setStatus] = useState<"Active" | "Draft" | "Archived">("Active");
  const [visWeb, setVisWeb] = useState(true);
  const [visMobile, setVisMobile] = useState(true);
  const [iconType, setIconType] = useState<"electronics" | "laptops" | "clothing" | "other">("other");

  // Edit states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          toast.error(data.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [API_URL]);

  // Derived state to check if modal should be open (either triggered locally or via URL params)
  const isModalOpen = localIsModalOpen || searchParams.get("create") === "true";

  // Close menus on click outside
  useEffect(() => {
    if (!activeMenuId) return;
    const handleCloseMenus = () => setActiveMenuId(null);
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, [activeMenuId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategoryId && val) {
      const generated = "/" + val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  const closeModal = () => {
    setLocalIsModalOpen(false);
    // Clear query parameter
    if (searchParams.get("create") === "true") {
      router.replace("/admin/dashboard/categories");
    }
    // Clear form inputs
    setName("");
    setSlug("");
    setParent("--");
    setProductsCount("");
    setStatus("Active");
    setVisWeb(true);
    setVisMobile(true);
    setIconType("other");
    setFormErrors({});
    setEditingCategoryId(null);
  };

  const handleCreateCategory = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setParent(cat.parent);
    setProductsCount(String(cat.productsCount));
    setStatus(cat.status);
    setVisWeb(cat.visibility.web);
    setVisMobile(cat.visibility.mobile);
    setIconType(cat.iconType);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success("Category deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category from server.");
    } finally {
      setDeleteConfirmId(null);
      setDeleteConfirmName("");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    try {
      let successCount = 0;
      for (const id of selectedCategories) {
        const res = await fetch(`${API_URL}/categories/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        }
      }
      setCategories((prev) => prev.filter((c) => !selectedCategories.includes(c.id)));
      toast.success(`Successfully deleted ${successCount} category(s)!`);
      setSelectedCategories([]);
    } catch (error) {
      console.error("Error bulk deleting categories:", error);
      toast.error("Failed to complete bulk delete operations.");
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick checks
    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = "Category name is required.";
    if (!slug.trim()) clientErrors.slug = "Slug path is required.";

    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      toast.error("Please fix all form validation errors!");
      return;
    }

    const toastId = toast.loading(editingCategoryId ? "Updating category..." : "Saving category...");

    try {
      const payload = {
        name,
        slug,
        parent,
        status,
        visibility: { web: visWeb, mobile: visMobile },
        iconType,
      };

      let res;
      if (editingCategoryId) {
        res = await fetch(`${API_URL}/categories/${editingCategoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        if (editingCategoryId) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategoryId ? responseData.data : c))
          );
          toast.success("Category updated successfully!", { id: toastId });
        } else {
          setCategories((prev) => [responseData.data, ...prev]);
          toast.success("Category created successfully!", { id: toastId });
        }
        closeModal();
      } else {
        if (responseData.errors) {
          setFormErrors(responseData.errors);
          toast.error(responseData.message || "Server validation failed.", { id: toastId });
        } else {
          toast.error(responseData.message || "Failed to save category.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("An error occurred while saving the category.", { id: toastId });
    }
  };

  const handleExport = () => {
    toast.info("Export CSV action triggered!");
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((c) => c.id));
    }
  };

  const toggleSelectCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter & Search logic
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesStatus = selectedStatus === "All" || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case "electronics":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <svg className="h-4.5 w-4.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25M18 12H6" />
            </svg>
          </div>
        );
      case "laptops":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <svg className="h-4.5 w-4.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
          </div>
        );
      case "clothing":
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <svg className="h-4.5 w-4.5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a2.5 2.5 0 00-4.96-.458L2.25 9.75 2.25 21a1.5 1.5 0 001.5 1.5h16.5a1.5 1.5 0 001.5-1.5V9.75l-4.79-5.708A2.5 2.5 0 0012 4.5z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
        );
    }
  };

  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "Active":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            Active
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400">
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Breadcrumbs & Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Admin</span>
            <svg className="h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-zinc-600 dark:text-zinc-350">Categories</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">Categories</h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export</span>
          </button>
          
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Main categories panel */}
      <div className="rounded-3xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-950 overflow-hidden shadow-xs">
        
        {/* Filters bar */}
        <div className="border-b border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search categories by name or slug..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Status selector */}
          <div className="relative min-w-44">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 w-12">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === categories.length && categories.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-905"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-[10px]">Category</th>
                <th className="py-4 px-4 font-bold text-[10px]">Parent</th>
                <th className="py-4 px-4 font-bold text-[10px]">Products</th>
                <th className="py-4 px-4 font-bold text-[10px]">Status</th>
                <th className="py-4 px-4 font-bold text-[10px]">Visibility</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-650" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching categories catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold">
                    No categories found. Click "Create Category" to add one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => {
                  const isSelected = selectedCategories.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCategory(c.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </td>

                      {/* Category metadata */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {renderIcon(c.iconType)}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-900 dark:text-white leading-tight">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                              {c.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Parent category */}
                      <td className="py-4 px-4 text-xs font-bold text-zinc-650 dark:text-zinc-400">
                        {c.parent === "--" ? (
                          <span className="text-zinc-350 dark:text-zinc-600">--</span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-zinc-50 border border-zinc-150 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-900 dark:border-zinc-850 dark:text-zinc-450">
                            {c.parent}
                          </span>
                        )}
                      </td>

                      {/* Products count */}
                      <td className="py-4 px-4 text-xs font-black text-zinc-700 dark:text-zinc-300">
                        {c.productsCount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(c.status)}
                      </td>

                      {/* Visibility */}
                      <td className="py-4 px-4">
                        {!c.visibility.web && !c.visibility.mobile ? (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-550 italic font-semibold">
                            Hidden
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-500">
                            {c.visibility.web && (
                              <span title="Web/Desktop Storefront">
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                                </svg>
                              </span>
                            )}
                            {c.visibility.mobile && (
                              <span title="Mobile App Storefront">
                                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H13.5M10.5 22.5H13.5M9 3.75H15M6.75 3.75V20.25C6.75 21.493 7.757 22.5 9 22.5H15C16.243 22.5 17.25 21.493 17.25 20.25V3.75C17.25 2.507 16.243 1.5 15 1.5H9C7.757 1.5 6.75 2.507 6.75 3.75Z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions dropdown */}
                      <td className="py-4 pr-6 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Edit Category"
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
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Update</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmId(c.id);
                                setDeleteConfirmName(c.name);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-655 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
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
            Showing 1 to {filteredCategories.length} of {categories.length} categories
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

      {/* Add / Update Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  {editingCategoryId ? "Update Category" : "Create New Category"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingCategoryId ? "Modify the category details and save changes." : "Add a new product category grouping to your catalog."}
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
            <form onSubmit={handleSubmitCategory} noValidate className="space-y-4">
              
              {/* Category Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Smart Home Accessories"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.name ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Slug Path *
                </label>
                <input
                  type="text"
                  placeholder="/smart-home"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.slug ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                />
                {formErrors.slug && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.slug}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Parent Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Parent Category
                  </label>
                  <div className="relative">
                    <select
                      value={parent}
                      onChange={(e) => setParent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="--">-- None --</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Home Goods">Home Goods</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Products Count Initial */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Product Count
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={productsCount}
                    onChange={(e) => setProductsCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Category Status *
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Category Icon *
                  </label>
                  <div className="relative">
                    <select
                      value={iconType}
                      onChange={(e) => setIconType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="electronics">Electronics (Device)</option>
                      <option value="laptops">Laptops (Computer)</option>
                      <option value="clothing">Clothing (Hanger)</option>
                      <option value="other">Default Grid Icon</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Visibility Options */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                  Visibility / Publishing Channels
                </label>
                <div className="flex items-center gap-6 rounded-xl border border-zinc-150 dark:border-zinc-850 p-3 bg-zinc-50/50 dark:bg-zinc-900">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-750 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visWeb}
                      onChange={(e) => setVisWeb(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <span>Web/Desktop Storefront</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-750 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visMobile}
                      onChange={(e) => setVisMobile(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <span>Mobile App Channels</span>
                  </label>
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
                  {editingCategoryId ? "Save Changes" : "Save Category"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirm Delete
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-2.5 leading-relaxed">
              Are you sure you want to delete category <span className="font-extrabold text-zinc-900 dark:text-white">"{deleteConfirmName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-5">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName("");
                }}
                className="flex-1 rounded-xl border border-zinc-250 py-2 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmId)}
                className="flex-1 rounded-xl bg-red-655 hover:bg-red-550 py-2 text-xs font-extrabold text-white shadow-sm shadow-red-500/10 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedCategories.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">
            {selectedCategories.length} category{selectedCategories.length > 1 ? "s" : ""} selected
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
