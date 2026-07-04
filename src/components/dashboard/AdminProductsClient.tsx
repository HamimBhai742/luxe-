/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Aura Studio Pro Headphones",
    category: "Electronics",
    variantsText: "4 Variants",
    sku: "AUR-HP-001",
    barcode: "894123567123",
    inventoryType: "tracked",
    inventoryCount: 142,
    price: 299.00,
    media: { image: true, video: true, threeD: true },
    status: "Published",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "prod-2",
    name: "Ergonomic Office Chair v2",
    category: "Furniture",
    variantsText: undefined,
    sku: "FUR-CH-042",
    barcode: "No barcode",
    inventoryType: "untracked",
    inventoryCount: 0,
    price: 450.00,
    media: { image: false, video: false, threeD: false },
    status: "Draft",
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "prod-3",
    name: "Minimalist Mechanical Keyboard",
    category: "Electronics",
    variantsText: "2 Variants",
    sku: "AUR-KB-012",
    barcode: "894123567888",
    inventoryType: "tracked",
    inventoryCount: 0,
    price: 129.00,
    media: { image: true, video: true, threeD: true },
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "prod-4",
    name: "Artisan Ceramic Mug",
    category: "Home Goods",
    variantsText: undefined,
    sku: "HOM-MG-101",
    barcode: "894123567999",
    inventoryType: "tracked",
    inventoryCount: 8,
    price: 24.00,
    media: { image: true, video: true, threeD: true },
    status: "Published",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop",
  },
];

export default function AdminProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Create modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [inventoryCount, setInventoryCount] = useState("");
  const [status, setStatus] = useState<"Published" | "Draft" | "Out of Stock">("Published");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Action menu & Update states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

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
    setCategory("Electronics");
    setSku("");
    setBarcode("");
    setPrice("");
    setInventoryCount("");
    setStatus("Published");
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    setEditingProductId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
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
    setImagePreview(product.image);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteProduct = (id: string, productName: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success(`Product "${productName}" deleted successfully!`);
    setActiveMenuId(null);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)));
    toast.success(`Successfully deleted ${selectedProducts.length} product(s)!`);
    setSelectedProducts([]);
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !price) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === editingProductId) {
            return {
              ...p,
              name,
              category,
              sku,
              barcode: barcode || "No barcode",
              inventoryType: inventoryCount === "" ? "untracked" : "tracked",
              inventoryCount: inventoryCount === "" ? 0 : Number(inventoryCount),
              price: Number(price),
              status,
              image: imagePreview || p.image,
              media: { ...p.media, image: !!imagePreview || !!p.image },
            };
          }
          return p;
        })
      );
      toast.success("Product updated successfully!");
    } else {
      const newProduct: ProductItem = {
        id: `prod-${Date.now()}`,
        name,
        category,
        variantsText: undefined,
        sku,
        barcode: barcode || "No barcode",
        inventoryType: inventoryCount === "" ? "untracked" : "tracked",
        inventoryCount: inventoryCount === "" ? 0 : Number(inventoryCount),
        price: Number(price),
        media: { image: !!imagePreview, video: false, threeD: false },
        status,
        image: imagePreview || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop",
      };

      setProducts((prev) => [newProduct, ...prev]);
      toast.success("Product created successfully!");
    }
    closeModal();
  };

  const handleImportExport = () => {
    toast.info("Import / Export CSV action triggered!");
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
      p.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.barcode.toLowerCase().includes(filterSearch.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const renderInventoryIndicator = (item: ProductItem) => {
    if (item.inventoryType === "untracked") {
      return <span className="text-zinc-400 dark:text-zinc-550 italic text-xs font-semibold">Not tracked</span>;
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
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-950/20">
            Published
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-550/10 px-2.5 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
            Draft
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-650 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-950/20">
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  const categories = ["All", "Electronics", "Furniture", "Home Goods"];
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
          {/* Import / Export Outline Button */}
          <button
            onClick={handleImportExport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-xs transition-all duration-200 cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-.75m-6-3h10.5m0 0L17.25 10.5M21 13.5L17.25 16.5" />
            </svg>
            <span>Import / Export</span>
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
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/50 px-4 py-2.5 pr-9 text-xs font-extrabold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-300 transition-all cursor-pointer focus:outline-none"
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
            className="rounded-xl border border-zinc-200 hover:bg-zinc-550/5 p-2.5 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer"
            title="Filter Adjustments"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.59l-5.343 5.344A2.25 2.25 0 0014.25 14.25v3.187a.75.75 0 01-.312.607l-2.25 1.625a.75.75 0 01-1.188-.607v-4.812a2.25 2.25 0 00-.659-1.59L4.542 8.318A2.25 2.25 0 013.883 6.73V4.82c0-.54.384-1.006.917-1.096A50.06 50.06 0 0112 3z" />
            </svg>
          </button>

          {/* Grid/List Layout Mode button */}
          <button
            onClick={() => toast.info("Layout mode change coming soon!")}
            className="rounded-xl border border-zinc-200 hover:bg-zinc-550/5 p-2.5 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all cursor-pointer"
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
          <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/30 text-left text-[11px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">
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
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {filteredProducts.map((p) => {
                const isSelected = selectedProducts.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors ${
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
                          unoptimized={p.image.startsWith("blob:")}
                          className="h-10 w-10 rounded-xl object-cover bg-zinc-50 border border-zinc-100 dark:border-zinc-800"
                        />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-900 dark:text-white hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold mt-1 flex items-center gap-2 uppercase tracking-wide">
                            {p.category}
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
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
                        ${p.price.toFixed(2)}
                      </span>
                    </td>

                    {/* Media icons column */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-zinc-350 dark:text-zinc-650">
                        {/* Image Icon */}
                        <svg className={`h-4 w-4 ${p.media.image ? "text-blue-500 dark:text-blue-450" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        {/* Video Icon */}
                        <svg className={`h-4 w-4 ${p.media.video ? "text-blue-500 dark:text-blue-450" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25zM15.75 9l-4.5 3m0 0l4.5 3m-4.5-3h6.75" />
                        </svg>
                        {/* 3D-box Icon */}
                        <svg className={`h-4 w-4 ${p.media.threeD ? "text-blue-500 dark:text-blue-450" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
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
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
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
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
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
              })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination panels */}
        <div className="bg-zinc-50/30 dark:bg-zinc-900/30 px-6 py-4 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
            Showing 1 to {filteredProducts.length} of 250 products
          </span>

          <div className="inline-flex items-center gap-1.5">
            {/* Previous */}
            <button
              onClick={() => toast.info("First page reached")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              disabled
            >
              Previous
            </button>
            
            {/* 1 */}
            <button className="rounded-xl bg-blue-600 text-white px-3.5 py-2 text-xs font-black shadow-xs shadow-blue-500/10 cursor-pointer">
              1
            </button>

            {/* 2 */}
            <button
              onClick={() => toast.info("Opening page 2...")}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              2
            </button>

            {/* 3 */}
            <button
              onClick={() => toast.info("Opening page 3...")}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              3
            </button>

            <span className="text-xs font-bold text-zinc-400 px-1">...</span>

            {/* 25 */}
            <button
              onClick={() => toast.info("Opening page 25...")}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              25
            </button>

            {/* Next */}
            <button
              onClick={() => toast.info("Opening next page...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Create Product Dialog/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
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
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
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
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Home Goods">Home Goods</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>

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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Inventory Count */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Inventory Count (Stock)
                  </label>
                  <input
                    type="number"
                    placeholder="Blank for untracked"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
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
                  Product Image *
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-2.5 flex items-center gap-4">
                    <Image
                      src={imagePreview}
                      alt="Upload Preview"
                      width={64}
                      height={64}
                      unoptimized={imagePreview.startsWith("blob:")}
                      className="h-16 w-16 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {imageFile?.name || "Uploaded Image"}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                        {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="rounded-lg border border-red-200 hover:bg-red-50 p-1.5 text-red-500 dark:border-red-950/30 dark:hover:bg-red-950/20 transition-all cursor-pointer shadow-xs"
                      title="Remove Image"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0M4.5 18.06l4.5-4.5m0 0l4.5 4.5m-4.5-4.5V21" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl border-2 border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <svg className="h-8 w-8 text-zinc-400 mb-2.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Click or drag image here
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                        PNG, JPG or WEBP (Max 2MB)
                      </p>
                    </div>
                  </div>
                )}
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
                  {editingProductId ? "Save Changes" : "Save Product"}
                </button>
              </div>

            </form>
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
