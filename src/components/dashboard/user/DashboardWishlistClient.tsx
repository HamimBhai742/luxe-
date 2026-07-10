/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAppDispatch } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useSyncDbCartMutation } from "@/lib/features/api/cartApi";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: 501,
    name: "AuraBook Pro 14\"",
    price: 1299.00,
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 502,
    name: "Aura Noise-Cancelling Headphones",
    price: 249.00,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 503,
    name: "Minimalist Leather Desk Mat",
    price: 45.00,
    category: "Office",
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400&auto=format&fit=crop",
  },
];

const SIMILAR_PRODUCTS: WishlistItem[] = [
  {
    id: 601,
    name: "Premium Wool Desk Mat",
    price: 45.00,
    category: "Office",
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 602,
    name: "Ergo Mouse Pro",
    price: 89.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 603,
    name: "Oak Monitor Stand",
    price: 120.00,
    category: "Office",
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 604,
    name: "Type-C Hub 8-in-1",
    price: 65.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 605,
    name: "Desktop Audio Monitors",
    price: 150.00,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=400&auto=format&fit=crop",
  },
];

export default function DashboardWishlistClient() {
  const dispatch = useAppDispatch();
  const { data: wishlistData, isLoading: isWishlistLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [syncDbCart] = useSyncDbCartMutation();

  const [sortOption, setSortOption] = useState("Recently Added");
  const [activeMobileTab, setActiveMobileTab] = useState("wishlist");

  const wishlist = wishlistData?.success && wishlistData.data ? wishlistData.data : [];

  const handleRemoveItem = async (id: string | number, name: string) => {
    try {
      await removeFromWishlist({ productId: String(id) }).unwrap();
      toast.success(`Removed ${name} from your wishlist`);
    } catch (err) {
      toast.error("Failed to remove item from wishlist");
    }
  };

  const handleAddToCart = async (item: any) => {
    dispatch(
      addToCart({
        id: item.id,
        productId: String(item.id),
        name: item.name,
        brand: item.brand || "LUXE",
        price: item.price,
        image: item.image,
        specsText: "Default Edition • Premium Grade",
      })
    );
    toast.success(`Added ${item.name} to shopping cart!`);

    try {
      await syncDbCart({
        items: [{ productId: String(item.id), quantity: 1, specsText: "Default Edition • Premium Grade" }],
      }).unwrap();
      await removeFromWishlist({ productId: String(item.id) }).unwrap();
    } catch (err) {
      console.error("Failed to sync item addition or remove from wishlist:", err);
    }
  };

  const [addToWishlist] = useAddToWishlistMutation();

  const handleAddToWishlist = async (product: any) => {
    try {
      await addToWishlist({ productId: String(product.id) }).unwrap();
      toast.success(`Added ${product.name} to wishlist!`);
    } catch (err) {
      toast.error("Failed to add item to wishlist");
    }
  };

  if (isWishlistLoading) {
    return (
      <div className="space-y-8 pb-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 dark:text-zinc-400 font-bold font-serif text-sm tracking-wide">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        
        {/* Header segment */}
        <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-800 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase font-serif">
              My Wishlist
            </h1>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              You have{" "}
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
              </span>{" "}
              saved for later.
            </p>
          </div>

          {/* Sort selector dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 outline-none shadow-xs transition-colors cursor-pointer appearance-none pr-8"
            >
              <option>Recently Added</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
            <svg className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Wishlist grid list */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 p-8 shadow-xs">
            <svg className="h-14 w-14 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Your wishlist is empty</h3>
            <p className="mt-1 text-xs text-zinc-400">Save products you like to view or checkout later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 pt-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                {/* Image layout */}
                <div className="aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden p-4 flex items-center justify-center relative">
                  <Image src={item.image} alt={item.name} width={150} height={150} className="object-contain max-h-[85%] max-w-[85%] transition-transform duration-500 ease-out group-hover:scale-103" />
                  
                  {/* Delete remove badge */}
                  <button
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="absolute top-2.5 right-2.5 z-10 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xs text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">{item.category}</span>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-white mt-1 leading-snug truncate group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                  
                  {/* Footer Price & Add */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white">${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-[10px] font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="md:hidden">
        
        {/* Mobile Header Title */}
        <div className="px-4 pt-4 pb-2 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white font-serif">
              My Wishlist
            </h1>
            <span className="text-[10px] font-bold text-zinc-400 block mt-1">
              You have <span className="text-blue-600 font-extrabold">{wishlist.length} items</span> saved.
            </span>
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[10px] font-bold text-zinc-600 outline-none shadow-xs cursor-pointer"
          >
            <option>Recently Added</option>
            <option>Price</option>
          </select>
        </div>

        {/* Wishlist grid items */}
        {wishlist.length === 0 ? (
          <div className="mx-4 my-6 py-12 text-center rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
            <span className="text-xs font-bold text-zinc-400">Your wishlist is empty</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 px-4 pt-2">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs relative"
              >
                
                {/* Delete button top right */}
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-xs text-zinc-500 hover:text-red-500 cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* image */}
                <div className="aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-950 p-3 flex items-center justify-center">
                  <Image src={item.image} alt={item.name} width={120} height={120} className="object-contain max-h-full max-w-full" />
                </div>

                {/* Info */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 block mt-1">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-blue-600 text-white rounded-lg py-1.5 text-[10px] font-bold shadow-xs cursor-pointer text-center"
                  >
                    Add to Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SIMILAR PRODUCTS YOU MIGHT LIKE (CAROUSEL GRID) */}
      {/* ========================================================================= */}
      <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 mx-4 sm:mx-0">
        
        {/* Heading arrows */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15.09 8.19 14.28 9 9.18l.813 5.096 5.096.813-5.096.814zM19.07 7.07l-.357 2.237-.238-1.5-1.5-.238 2.237-.357.357-2.237.238 1.5 1.5.238-2.237.357z" />
            </svg>
            <span>Similar Products You Might Like</span>
          </h3>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toast.info("Showing previous recommendations")}
              className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => toast.info("Showing next recommendations")}
              className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products horizontally scrollable or wrapping grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SIMILAR_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              onClick={() => handleAddToWishlist(prod)}
              className="group flex flex-col bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-pointer"
            >
              {/* Image box */}
              <div className="aspect-square w-full bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center relative">
                <Image src={prod.image} alt={prod.name} width={120} height={120} className="object-contain max-h-[85%] max-w-[85%] transition-transform duration-500 group-hover:scale-103" />
              </div>

              {/* metadata info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between bg-white dark:bg-zinc-900/10">
                <div>
                  <h4 className="text-[11px] font-bold text-zinc-800 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                    {prod.name}
                  </h4>
                  <span className="text-[11px] font-black text-zinc-900 dark:text-zinc-200 block mt-2">
                    ${prod.price.toLocaleString()}.00
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATION DOCK */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 px-6 py-2 shadow-lg">
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
              activeMobileTab === "wishlist" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-55"
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
  );
}
