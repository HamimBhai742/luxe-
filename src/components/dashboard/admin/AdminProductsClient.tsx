/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  variantsText?: string;
  sku: string;
  barcode: string;
  inventoryType: "tracked" | "untracked";
  inventoryCount: number;
  price: number;
  media: { image: boolean; video: boolean; threeD: boolean };
  status: "Published" | "Draft" | "Out of Stock";
  image: string;
  images?: string[];
  description: string;
  brand?: string;
  originalPrice?: number;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Delete confirmation modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const [filterSearch, setFilterSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Create modal states

  // Create modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [inventoryCount, setInventoryCount] = useState("");
  const [status, setStatus] = useState<"Published" | "Draft" | "Out of Stock">("Published");
  interface ProductImageState {
    id: string;
    file: File | null;
    preview: string;
  }

  const [productImages, setProductImages] = useState<ProductImageState[]>([]);
  
  // Custom enhanced fields
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");

  // Action menu & Update states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Fetch products from database on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        } else {
          toast.error(data.message || "Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL]);

  // Fetch categories from database on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setDbCategories(data.data);
          // Set initial default category if available
          const activeCategories = data.data.filter((c: any) => c.status === "Active");
          if (activeCategories.length > 0) {
            setCategory(activeCategories[0].name);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
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

  const closeModal = () => {
    setLocalIsModalOpen(false);
    // Clear query parameter
    if (searchParams.get("create") === "true") {
      router.replace("/admin/dashboard/products");
    }
    // Clear form inputs
    setName("");
    const activeCategories = dbCategories.filter((c: any) => c.status === "Active");
    setCategory(activeCategories.length > 0 ? activeCategories[0].name : "Electronics");
    setSku("");
    setBarcode("");
    setPrice("");
    setInventoryCount("");
    setStatus("Published");
    setDescription("");
    setBrand("");
    setOriginalPrice("");
    setFormErrors({});
    
    // Revoke blob urls
    productImages.forEach(img => {
      if (img.preview && img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setProductImages([]);
    setEditingProductId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = files.map(file => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: `new-${Date.now()}-${file.name}-${Math.random()}`,
          file: file,
          preview: previewUrl
        };
      });
      setProductImages(prev => [...prev, ...newImages]);
    }
  };

  const handleCreateProduct = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (product: ProductItem) => {
    setEditingProductId(product.id);
    setName(product.name);
    setCategory(product.category);
    setSku(product.sku);
    setBarcode(product.barcode === "No barcode" ? "" : product.barcode);
    setPrice(String(product.price));
    setInventoryCount(product.inventoryType === "untracked" ? "" : String(product.inventoryCount));
    setStatus(product.status);
    
    const existingImages = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);
      
    setProductImages(existingImages.map(url => ({
      id: url,
      file: null,
      preview: url
    })));
    
    setDescription(product.description || "");
    setBrand(product.brand || "");
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };


  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product from server.");
    } finally {
      setDeleteConfirmId(null);
      setDeleteConfirmName("");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    try {
      let successCount = 0;
      for (const id of selectedProducts) {
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        }
      }
      setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
      toast.success(`Successfully deleted ${successCount} product(s)!`);
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error bulk deleting products:", error);
      toast.error("Failed to complete bulk delete operations.");
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick validation
    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = "Product name is required.";
    if (!description.trim()) clientErrors.description = "Product description is required.";
    if (!sku.trim()) clientErrors.sku = "SKU is required.";
    if (!price || Number(price) <= 0) clientErrors.price = "Price must be a positive number.";
    if (inventoryCount !== "" && Number(inventoryCount) < 0) {
      clientErrors.inventoryCount = "Inventory count cannot be negative.";
    }
    if (productImages.length === 0) {
      clientErrors.image = "At least one product image is required.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      toast.error("Please fix all form validation errors!");
      return;
    }

    const toastId = toast.loading(editingProductId ? "Updating product..." : "Saving product...");

    try {
      const uploadedUrls: string[] = [];
      
      for (const imgState of productImages) {
        if (imgState.file) {
          toast.loading(`Uploading image "${imgState.file.name}" to Cloudinary...`, { id: toastId });
          const base64Image = await fileToBase64(imgState.file);
          
          // Upload to server's Cloudinary upload endpoint
          const uploadRes = await fetch(`${API_URL}/upload/image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
          
          const uploadData = await uploadRes.json();
          
          if (!uploadRes.ok || !uploadData.success) {
            toast.error(uploadData.message || "Failed to upload image to Cloudinary.", { id: toastId });
            setFormErrors((prev) => ({ ...prev, image: uploadData.message || "Image upload failed." }));
            return;
          }
          
          uploadedUrls.push(uploadData.url);
        } else {
          // Retain existing image URL
          uploadedUrls.push(imgState.preview);
        }
      }

      toast.loading("Saving product details...", { id: toastId });

      const payload = {
        name,
        category,
        sku,
        barcode: barcode || undefined,
        inventoryType: inventoryCount === "" ? "untracked" : "tracked",
        inventoryCount: inventoryCount === "" ? 0 : Number(inventoryCount),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        status,
        image: uploadedUrls[0] || "",
        images: uploadedUrls,
        description,
        brand: brand || undefined,
      };

      let res;
      if (editingProductId) {
        res = await fetch(`${API_URL}/products/${editingProductId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        if (editingProductId) {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingProductId ? responseData.data : p))
          );
          toast.success("Product updated successfully!", { id: toastId });
        } else {
          setProducts((prev) => [responseData.data, ...prev]);
          toast.success("Product created successfully!", { id: toastId });
        }
        closeModal();
      } else {
        if (responseData.errors) {
          setFormErrors(responseData.errors);
          toast.error(responseData.message || "Server validation failed.", { id: toastId });
        } else {
          toast.error(responseData.message || "Failed to save product.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("An error occurred while saving the product.", { id: toastId });
    }
  };

  const handleImportTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so the user can select the same file again
    e.target.value = "";

    const toastId = toast.loading("Reading JSON file...");
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (!Array.isArray(jsonData)) {
        toast.error("Import failed: JSON must be an array of products.", { id: toastId });
        return;
      }

      toast.loading(`Importing ${jsonData.length} products...`, { id: toastId });

      let successCount = 0;
      let failCount = 0;
      const importedProducts: ProductItem[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];

        if (!item.name || !item.sku || item.price === undefined) {
          console.warn(`Product at index ${i} is missing name, sku, or price.`);
          failCount++;
          continue;
        }

        // Default premium placeholder image if missing
        const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop";

        const payload = {
          name: String(item.name).trim(),
          category: String(item.category || "Electronics").trim(),
          sku: String(item.sku).trim(),
          barcode: item.barcode ? String(item.barcode).trim() : undefined,
          inventoryType: item.inventoryCount === undefined || item.inventoryCount === "" ? "untracked" : "tracked",
          inventoryCount: item.inventoryCount === undefined || item.inventoryCount === "" ? 0 : Number(item.inventoryCount),
          price: Number(item.price),
          originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
          status: item.status || "Published",
          image: item.image || defaultImage,
          images: Array.isArray(item.images) ? item.images : [item.image || defaultImage],
          description: String(item.description || item.name || "No description provided.").trim(),
          brand: item.brand ? String(item.brand).trim() : undefined,
        };

        try {
          const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            successCount++;
            importedProducts.push(data.data);
          } else {
            console.error(`Failed to import product ${item.name}:`, data.message);
            failCount++;
          }
        } catch (err) {
          console.error(`Error importing product ${item.name}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        setProducts((prev) => [...importedProducts, ...prev]);
        toast.success(`Successfully imported ${successCount} products! ${failCount > 0 ? `(${failCount} failed)` : ""}`, { id: toastId });
      } else {
        toast.error(`Import failed. All ${failCount} products failed to save. Check console for details.`, { id: toastId });
      }

    } catch (error) {
      console.error("JSON parsing error:", error);
      toast.error("Invalid JSON file structure. Make sure it is valid JSON.", { id: toastId });
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "products_export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Successfully exported products to JSON file!");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export products.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(filterSearch.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(filterSearch.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(filterSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const renderInventoryIndicator = (item: ProductItem) => {
    if (item.inventoryType === "untracked") {
      return <span className="text-zinc-400 dark:text-zinc-500 italic text-xs font-semibold">Not tracked</span>;
    }

    let progressColor = "bg-emerald-500";
    if (item.inventoryCount === 0) {
      progressColor = "bg-rose-500";
    } else if (item.inventoryCount < 10) {
      progressColor = "bg-amber-500";
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-16 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColor}`}
            style={{ width: `${Math.min(100, (item.inventoryCount / 150) * 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300">
          {item.inventoryCount}
        </span>
      </div>
    );
  };

  const renderStatusBadge = (status: ProductItem["status"]) => {
    switch (status) {
      case "Published":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-950/20">
            Published
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            Draft
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-950/20">
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  const categories = dbCategories.length > 0
    ? ["All", ...dbCategories.filter((c: any) => c.status === "Active").map((c: any) => c.name)]
    : ["All", "Electronics", "Furniture", "Home Goods"];
  const statuses = ["All", "Published", "Draft", "Out of Stock"];

  return (
    <div className="space-y-6 pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-semibold">
            Manage your inventory, pricing, and variants.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Import JSON Button */}
          <button
            onClick={handleImportTrigger}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-xs transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span>Import JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-xs transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export JSON</span>
          </button>

          {/* Create Product Button */}
          <button
            onClick={handleCreateProduct}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-blue-500/20 transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Product</span>
          </button>
        </div>
      </div>

      {/* FILTER & ACTIONS CARD */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Filter inputs */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-4xl">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Filter products..."
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 px-4 py-2.5 pr-9 text-xs font-extrabold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300 transition-all cursor-pointer focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-zinc-250 bg-zinc-50/50 hover:bg-zinc-100/50 px-4 py-2.5 pr-9 text-xs font-extrabold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300 transition-all cursor-pointer focus:outline-none"
            >
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "Status: All" : st}
                </option>
              ))}
            </select>
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Right Side: Additional Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Advanced Filter adjustments button */}
          <button
            onClick={() => toast.info("Advanced filter options coming soon!")}
            className="rounded-xl border border-zinc-200 hover:bg-zinc-500/5 p-2.5 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer"
            title="Filter Adjustments"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.59l-5.343 5.344A2.25 2.25 0 0014.25 14.25v3.187a.75.75 0 01-.312.607l-2.25 1.625a.75.75 0 01-1.188-.607v-4.812a2.25 2.25 0 00-.659-1.59L4.542 8.318A2.25 2.25 0 013.883 6.73V4.82c0-.54.384-1.006.917-1.096A50.06 50.06 0 0112 3z" />
            </svg>
          </button>

          {/* Grid/List Layout Mode button */}
          <button
            onClick={() => toast.info("Layout mode change coming soon!")}
            className="rounded-xl border border-zinc-200 hover:bg-zinc-500/5 p-2.5 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer"
            title="Layout Mode"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-3.75-2.25v-2.25z" />
            </svg>
          </button>
        </div>

      </div>

      {/* PRODUCTS TABLE CARD */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 text-left text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <th className="py-4 pl-6 w-12">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </th>
                <th className="py-4 px-4 pl-2">Product</th>
                <th className="py-4 px-4">SKU / Barcode</th>
                <th className="py-4 px-4">Inventory</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Media</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 pr-6 text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 dark:text-zinc-500 font-bold">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching products catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 dark:text-zinc-500 font-bold">
                    No products found. Click "Create Product" to add one.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isSelected = selectedProducts.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 pl-6">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </td>

                      {/* Product column */}
                      <td className="py-4 px-4 pl-2">
                        <div className="flex items-center gap-4">
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={40}
                            height={40}
                            unoptimized={p.image.startsWith("blob:") || p.image.startsWith("data:")}
                            className="h-10 w-10 rounded-xl object-cover bg-zinc-50 border border-zinc-100 dark:border-zinc-800"
                          />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1 flex items-center gap-2 uppercase tracking-wide">
                              {p.brand && `${p.brand} • `}{p.category}
                              {p.variantsText && (
                                <button
                                  onClick={() => toast.info(`Viewing variants for ${p.name}`)}
                                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline cursor-pointer lowercase flex items-center gap-1 font-extrabold"
                                >
                                  <span>•</span> {p.variantsText}
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                  </svg>
                                </button>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Barcode column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{p.sku}</span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{p.barcode}</span>
                        </div>
                      </td>

                      {/* Inventory column */}
                      <td className="py-4 px-4">
                        {renderInventoryIndicator(p)}
                      </td>

                      {/* Price column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                            ৳{p.price.toFixed(2)}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-through font-bold">
                              ৳{p.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Media icons column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-600">
                          {/* Image Icon */}
                          <svg className={`h-4 w-4 ${p.media?.image || p.image ? "text-blue-500 dark:text-blue-400" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          {/* Video Icon */}
                          <svg className={`h-4 w-4 ${p.media?.video ? "text-blue-500 dark:text-blue-400" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25zM15.75 9l-4.5 3m0 0l4.5 3m-4.5-3h6.75" />
                          </svg>
                          {/* 3D-box Icon */}
                          <svg className={`h-4 w-4 ${p.media?.threeD ? "text-blue-500 dark:text-blue-400" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                          </svg>
                        </div>
                      </td>

                      {/* Status badge column */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* Actions column */}
                      <td className="py-4 pr-6 text-right relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(prev => prev === p.id ? null : p.id);
                          }}
                          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === p.id && (
                          <div className="absolute right-6 mt-1.5 w-28 origin-top-right rounded-xl border border-zinc-250 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(p)}
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
                                setDeleteConfirmId(p.id);
                                setDeleteConfirmName(p.name);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
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

        {/* Footer pagination panels */}
        {totalItems > 10 && (
          <div className="bg-zinc-50/30 dark:bg-zinc-900/30 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
              </span>
              
              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Limit:</span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300 px-3 py-1.5 pr-8 text-xs font-extrabold text-zinc-700 cursor-pointer focus:outline-none transition-colors"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  currentPage === 1
                    ? "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed bg-zinc-50/20 dark:bg-zinc-900/10"
                    : "border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span key={`dots-${index}`} className="text-xs font-bold text-zinc-400 px-1">
                      ...
                    </span>
                  );
                }
                const isPageActive = currentPage === page;
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(Number(page))}
                    className={`rounded-xl px-3.5 py-2 text-xs font-black shadow-xs transition-all cursor-pointer ${
                      isPageActive
                        ? "bg-blue-600 text-white shadow-blue-500/10 animate-fade-in"
                        : "border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  currentPage === totalPages
                    ? "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed bg-zinc-50/20 dark:bg-zinc-900/10"
                    : "border-zinc-250 dark:border-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Create Product Dialog/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto transform rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {editingProductId ? "Update Product" : "Create New Product"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingProductId ? "Modify the product details and save changes." : "Add a new item to your store's inventory catalog."}
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
            <form onSubmit={handleSubmitProduct} noValidate className="space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Wireless Earbuds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.name ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.name}</p>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide a detailed description of the product, its features, specifications, and materials..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.description ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400 resize-none`}
                />
                {formErrors.description && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all"
                    >
                      {(dbCategories.length > 0
                        ? dbCategories.filter((c: any) => c.status === "Active").map((c: any) => c.name)
                        : ["Electronics", "Furniture", "Home Goods"]
                      ).map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                  {formErrors.category && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.category}</p>
                  )}
                </div>

                {/* Brand Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CHRONOS, LUXE"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.brand ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.brand && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.brand}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SKU Code */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUR-EB-99"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.sku ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.sku && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.sku}</p>
                  )}
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Barcode (EAN / UPC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 894123567999"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.barcode ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.barcode && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.barcode}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 99.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.price ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.price}</p>
                  )}
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Compare-at Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 120.00"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.originalPrice ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.originalPrice && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.originalPrice}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Inventory Count */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Inventory Count (Stock)
                  </label>
                  <input
                    type="number"
                    placeholder="Blank for untracked"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.inventoryCount ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400`}
                  />
                  {formErrors.inventoryCount && (
                    <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.inventoryCount}</p>
                  )}
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Product Status *
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Image Upload Zone */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Product Images *
                </label>
                
                {productImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3.5 mb-4">
                    {productImages.map((img, index) => (
                      <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xs">
                        <Image
                          src={img.preview}
                          alt="Product Gallery Item"
                          fill
                          unoptimized={img.preview.startsWith("blob:") || img.preview.startsWith("data:")}
                          className="object-cover"
                        />
                        {/* Remove Image Button overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              if (img.preview.startsWith("blob:")) URL.revokeObjectURL(img.preview);
                              setProductImages(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="rounded-full bg-red-600 hover:bg-red-500 p-2 text-white transition-all shadow-md cursor-pointer"
                            title="Remove Image"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                        {/* Primary Image Badge */}
                        {index === 0 && (
                          <span className="absolute top-1.5 left-1.5 rounded-md bg-blue-600 text-[8px] font-black tracking-wider uppercase text-white px-1.5 py-0.5">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Uploader Box */}
                <div className="relative rounded-2xl border-2 border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <svg className="h-8 w-8 text-zinc-400 mb-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-xs font-bold text-zinc-705 dark:text-zinc-300">
                      Click or drag images here
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                      Upload one or more product images (PNG, JPG or WEBP, Max 2MB each)
                    </p>
                  </div>
                </div>
                {formErrors.image && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.image}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-zinc-250 py-2.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  {editingProductId ? "Save Changes" : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirm Delete
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-zinc-900 dark:text-white">"{deleteConfirmName}"</span>? This action is permanent and cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-5">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName("");
                }}
                className="flex-1 rounded-xl border border-zinc-250 py-2 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2 text-xs font-extrabold text-white shadow-sm shadow-red-500/10 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">
            {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
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
