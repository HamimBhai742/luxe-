/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useSyncDbCartMutation } from "@/lib/features/api/cartApi";

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  isNew: boolean;
  tag: string;
  image: string;
  inStock: boolean;
}

interface CollectionsClientProps {
  products: Product[];
}

const ITEMS_PER_PAGE = 6;

export default function CollectionsClient({ products }: CollectionsClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [syncDbCart] = useSyncDbCartMutation();
  const dbWishlist = wishlistData?.success && wishlistData.data ? wishlistData.data : [];

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const storedStr = localStorage.getItem("recentlyViewed");
        if (storedStr) {
          return JSON.parse(storedStr);
        }
      } catch (err) {
        console.error("Error loading recently viewed list from localStorage:", err);
      }
    }
    return [];
  });

  // Navigation & UI States
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      // Capitalize first letter as a default guess
      return [categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)];
    }
    return [];
  });
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [selectedRating, setSelectedRating] = useState<number | null>(4);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam && ["price-low-high", "price-high-low", "rating", "featured"].includes(sortParam)) {
      return sortParam;
    }
    return "featured";
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Mobile Drawers
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState<boolean>(false);

  // User interactions
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<string>("collections");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

  // Fetch db products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        if (data.success) {
          const mapped: Product[] = data.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand || "LUXE",
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice || undefined,
            rating: p.rating || 5.0,
            ratingCount: p.ratingCount || 15,
            isNew: p.status === "Published",
            tag: p.status === "Published" ? "NEW" : "",
            image: p.image,
            inStock: p.inventoryType === "untracked" || p.inventoryCount > 0,
          }));
          setDbProducts(mapped);
        }
      } catch (err) {
        console.error("Error loading products from server:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [API_URL]);




  // Scroll to top of list on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle Category Select
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.some((c) => c.toLowerCase() === category.toLowerCase());
      if (isSelected) {
        return prev.filter((c) => c.toLowerCase() !== category.toLowerCase());
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1);
  };

  // Add to Favorites Toggle
  const toggleFavorite = async (productId: any, name = "Product") => {
    if (!isAuthenticated) {
      localStorage.setItem("pendingWishlistAdd", String(productId));
      toast.info("Please log in to add items to your wishlist.");
      router.push("/sign-in");
      return;
    }

    const isFav = dbWishlist.some((item) => String(item.id) === String(productId));
    try {
      if (isFav) {
        await removeFromWishlist({ productId: String(productId) }).unwrap();
        toast.success(`Removed ${name} from wishlist`);
      } else {
        await addToWishlist({ productId: String(productId) }).unwrap();
        toast.success(`Added ${name} to wishlist!`);
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  // Add to Cart Functionality
  const handleAddToCart = async (product: any) => {
    dispatch(
      addToCart({
        id: product.id,
        productId: String(product.id),
        name: product.name,
        brand: product.brand || "LUXE",
        price: product.price,
        image: product.image,
        specsText: "Default Edition • Premium Grade",
      })
    );
    toast.success(`Added ${product.name} to cart!`);

    if (isAuthenticated) {
      try {
        await syncDbCart({
          items: [{ productId: String(product.id), quantity: 1, specsText: "Default Edition • Premium Grade" }],
        }).unwrap();
      } catch (err) {
        console.error("Failed to sync item addition to DB cart:", err);
      }
    }
  };

  const activeProducts = dbProducts.length > 0 ? dbProducts : products;

  // Dynamic categories list
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>(["Watches", "Jewelry", "Accessories"]);
    activeProducts.forEach((p) => {
      if (p.category) {
        const formatted = p.category.charAt(0).toUpperCase() + p.category.slice(1);
        cats.add(formatted);
      }
    });
    return Array.from(cats);
  }, [activeProducts]);



  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      // Category filter
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.some(cat => cat.toLowerCase() === (product.category || "").toLowerCase())
      ) {
        return false;
      }
      // Price filter
      if (product.price > priceRange) {
        return false;
      }
      // Rating filter
      if (selectedRating !== null && product.rating < selectedRating) {
        return false;
      }
      // Stock filter
      if (inStockOnly && !product.inStock) {
        return false;
      }
      return true;
    });
  }, [activeProducts, selectedCategories, priceRange, selectedRating, inStockOnly]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-low-high":
        return list.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "featured":
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Pagination Calculations
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-zinc-50/30 dark:bg-zinc-950/20 min-h-screen pb-24 md:pb-12 transition-colors duration-300">
      
      {/* Breadcrumbs */}
      <nav className="mb-6 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
        <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Home</Link>
        <span className="mx-2 text-zinc-300">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Collections</span>
      </nav>

      {/* MOBILE ONLY SUB-HEADER */}
      <div className="md:hidden flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <span className="text-sm font-semibold text-zinc-505 dark:text-zinc-400">
          Showing <span className="font-bold text-zinc-900 dark:text-white">{sortedProducts.length}</span> items
        </span>
        <div className="flex gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            <span>Filter</span>
          </button>
          
          {/* Mobile Sort Button */}
          <button
            onClick={() => setIsSortDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-4 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-8">
            
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white uppercase mb-4">Category</h3>
              <div className="space-y-3">
                {categoryOptions.map((category) => (
                  <label key={category} className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.some(c => c.toLowerCase() === category.toLowerCase())}
                      onChange={() => handleCategoryToggle(category)}
                      className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-955 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors font-medium">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* Price Range Filter */}
            <div>
              <h3 className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white uppercase mb-4">Price Range</h3>
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-xs font-semibold text-zinc-450 dark:text-zinc-500 mt-3.5">
                <span>$0</span>
                <span className="text-blue-650 dark:text-blue-400 font-bold">${priceRange.toLocaleString()}+</span>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* Rating Filter */}
            <div>
              <h3 className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white uppercase mb-4">Rating</h3>
              <div className="space-y-3">
                {[5, 4].map((rating) => (
                  <label key={rating} className="flex items-center group cursor-pointer">
                    <input
                      type="radio"
                      name="rating-desktop"
                      checked={selectedRating === rating}
                      onChange={() => {
                        setSelectedRating(rating);
                        setCurrentPage(1);
                      }}
                      className="h-4 w-4 border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer"
                    />
                    <div className="ml-3 flex items-center gap-1.5">
                      <div className="flex text-amber-450">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                        & Up
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-800" />

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold tracking-wider text-zinc-900 dark:text-white uppercase">In Stock Only</span>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  inStockOnly ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <section className="flex-1">
          
          {/* DESKTOP HEADER ACTION BAR */}
          <div className="hidden md:flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
            <span className="text-sm font-semibold text-zinc-555 dark:text-zinc-400">
              Showing <span className="font-bold text-zinc-900 dark:text-white">{sortedProducts.length}</span> premium items
            </span>
            <div className="flex items-center gap-6">
              
              {/* Sort Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-450 uppercase">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-sm outline-none focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* View Mode Grid/List Toggle */}
              <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-white dark:bg-zinc-900 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  }`}
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* PRODUCT LAYOUT GRID/LIST */}
          {isLoading ? (
            // Shimmer Loading Skeletons
            <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10" : "space-y-4"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="aspect-square w-full bg-zinc-200 dark:bg-zinc-850" />
                  <div className="flex-1 p-3.5 sm:p-5 space-y-3">
                    <div className="h-2 w-1/4 bg-zinc-200 dark:bg-zinc-850 rounded" />
                    <div className="h-3.5 w-3/4 bg-zinc-200 dark:bg-zinc-850 rounded" />
                    <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-850 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm px-4">
              <svg className="h-12 w-12 text-zinc-350 mb-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25M3.75 7.5L5.621 3.757A1.5 1.5 0 016.964 3h10.071a1.5 1.5 0 011.343.803L20.25 7.5m-16.5 0H20.25" />
              </svg>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">No products found</h3>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Try adjusting your filters or price range to find matching premium goods.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10">
              {paginatedProducts.map((product) => {
                const isProductInWishlist = isAuthenticated 
                  ? dbWishlist.some((item) => String(item.id) === String(product.id))
                  : false;
                const isFavorite = isAuthenticated ? isProductInWishlist : favorites.includes(product.id);
                return (
                  <Link key={product.id} href={`/collections/${product.id}`} className="group relative flex flex-col cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    
                    {/* Image Box */}
                    <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-955 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={280}
                        height={280}
                        className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      
                      {/* Heart Icon Toggle (Mobile/Desktop consistent) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleFavorite(product.id, product.name);
                        }}
                        className="absolute top-3 right-3 z-20 flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm text-zinc-650 hover:text-red-500 dark:text-zinc-300 dark:hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <svg className={`h-4.5 w-4.5 ${isFavorite ? "fill-red-500 stroke-red-500" : "stroke-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>

                      {/* Optional Tag Badge */}
                      {product.tag && (
                        <span className={`absolute top-3 left-3 z-10 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm ${
                          product.tag === "NEW" ? "bg-blue-600" : "bg-red-550"
                        }`}>
                          {product.tag}
                        </span>
                      )}
                    </div>

                    {/* Content Detail Panel */}
                    <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                          {product.brand}
                        </span>
                        <h3 className="mt-1 text-sm font-bold text-zinc-905 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        
                        {/* Rating Row (Desktop & Tablet star indicators) */}
                        <div className="hidden sm:flex items-center gap-1 mt-1.5">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400">({product.ratingCount})</span>
                        </div>

                        {/* Rating Row (Mobile single star indicator) */}
                        <div className="sm:hidden flex items-center gap-1 mt-1">
                          <span className="text-[11px] font-bold text-zinc-550 dark:text-zinc-400 flex items-center gap-0.5">
                            <span className="text-amber-450">★</span> {product.rating}
                          </span>
                        </div>
                      </div>

                      {/* Pricing + Cart Button Panel */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                            ${product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-zinc-450 dark:text-zinc-500 line-through">
                              ${product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {/* Cart CTA: Blue square desktop/tablet icon button, Mobile plus button */}
                        <div className="relative">
                          {/* Desktop Cart Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all duration-200 cursor-pointer"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                          </button>
                          
                          {/* Mobile Circular Plus Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="sm:hidden flex h-7.5 w-7.5 items-center justify-center rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedProducts.map((product) => {
                const isProductInWishlist = isAuthenticated 
                  ? dbWishlist.some((item) => String(item.id) === String(product.id))
                  : false;
                const isFavorite = isAuthenticated ? isProductInWishlist : favorites.includes(product.id);
                return (
                  <Link key={product.id} href={`/collections/${product.id}`} className="group flex bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative w-36 sm:w-48 aspect-square shrink-0 bg-zinc-100 dark:bg-zinc-955 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={180}
                        height={180}
                        className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      {product.tag && (
                        <span className={`absolute top-3 left-3 z-10 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm ${
                          product.tag === "NEW" ? "bg-blue-600" : "bg-red-550"
                        }`}>
                          {product.tag}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">{product.brand}</span>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">{product.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-zinc-400">({product.ratingCount} reviews)</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id, product.name);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-655 hover:text-red-500 dark:hover:text-red-500 transition-colors shadow-sm cursor-pointer"
                        >
                          <svg className={`h-4.5 w-4.5 ${isFavorite ? "fill-red-500 stroke-red-500" : "stroke-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-zinc-955 dark:text-zinc-50">${product.price.toLocaleString()}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-zinc-400 dark:text-zinc-555 line-through">${product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                          </svg>
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* PAGINATION SECTION */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2.5 mt-12">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-550 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-550 shadow-sm hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </nav>
          )}

        </section>
      </div>      {/* RECENTLY VIEWED SECTION */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.map((product) => (
              <Link key={product.id} href={`/collections/${product.id}`} className="group relative flex flex-col cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-square w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-103"
                  />
                </div>
                <div className="p-3">
                  <span className="text-[9px] font-bold tracking-wider text-zinc-400 uppercase">{product.brand}</span>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">{product.name}</h3>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 block mt-1.5">${product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MOBILE INTERACTIVE FILTER DRAWER (SLIDE-UP OVERLAY) */}
      {/* ========================================================================= */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsFilterDrawerOpen(false)} />
          
          <div className="relative w-full max-h-[85vh] bg-white dark:bg-zinc-950 rounded-t-3xl p-6 shadow-2xl overflow-y-auto border-t border-zinc-100 dark:border-zinc-900 animate-slide-up z-55">
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-6">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Filters</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-1.5 text-zinc-500 dark:text-zinc-450 hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category selection */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const isSelected = selectedCategories.some(c => c.toLowerCase() === category.toLowerCase());
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price selection */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Max Price</h4>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between text-xs font-bold text-zinc-500 mt-2.5">
                <span>$0</span>
                <span className="text-blue-600 dark:text-blue-400 font-extrabold">${priceRange.toLocaleString()}</span>
              </div>
            </div>

            {/* Rating selection */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Ratings</h4>
              <div className="flex gap-2">
                {[5, 4].map((rating) => {
                  const isSelected = selectedRating === rating;
                  return (
                    <button
                      key={rating}
                      onClick={() => {
                        setSelectedRating(rating);
                        setCurrentPage(1);
                      }}
                      className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-zinc-200 bg-white text-zinc-650 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      }`}
                    >
                      <span className="text-amber-450">★</span>
                      <span>{rating} & Up</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Toggle */}
            <div className="flex items-center justify-between py-4 border-t border-zinc-150 dark:border-zinc-800 mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">In Stock Only</span>
              <button
                type="button"
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setCurrentPage(1);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  inStockOnly ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    inStockOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-md transition-colors cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE SORT DRAWER (BOTTOM DIALOG SHEET) */}
      {/* ========================================================================= */}
      {isSortDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs md:hidden animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsSortDrawerOpen(false)} />
          
          <div className="relative w-full bg-white dark:bg-zinc-950 rounded-t-3xl p-6 shadow-2xl border-t border-zinc-100 dark:border-zinc-900 animate-slide-up z-55">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900 mb-4">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Sort Preference</h3>
              <button
                onClick={() => setIsSortDrawerOpen(false)}
                className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-1.5 text-zinc-500 dark:text-zinc-450 hover:bg-zinc-250 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-1">
              {[
                { label: "Featured", value: "featured" },
                { label: "Price: Low to High", value: "price-low-high" },
                { label: "Price: High to Low", value: "price-high-low" },
                { label: "Customer Rating", value: "rating" },
              ].map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setIsSortDrawerOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400"
                        : "text-zinc-650 hover:bg-zinc-50 dark:text-zinc-350 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isActive && (
                      <svg className="h-4.5 w-4.5 text-blue-650" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED DOCKED FOOTER) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 md:hidden px-6 py-2 shadow-lg">
        <div className="flex items-center justify-between text-zinc-400">
          
          {/* Home Tab */}
          <Link
            href="/"
            onClick={() => setActiveMobileTab("home")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeMobileTab === "home" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
            }`}
          >
            <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider uppercase">Home</span>
          </Link>

          {/* Search Tab */}
          <button
            onClick={() => {
              setActiveMobileTab("search");
              toast.info("Search bar is located in the top header!");
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeMobileTab === "search" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-650"
            }`}
          >
            <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider uppercase">Search</span>
          </button>

          {/* Collections Tab (Active) */}
          <Link
            href="/collections"
            onClick={() => setActiveMobileTab("collections")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeMobileTab === "collections" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
            }`}
          >
            <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider uppercase">Collections</span>
          </Link>

          {/* Profile Tab */}
          <Link
            href="/dashboard"
            onClick={() => setActiveMobileTab("profile")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeMobileTab === "profile" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
            }`}
          >
            <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
          </Link>

        </div>
      </div>

    </div>
  );
}
