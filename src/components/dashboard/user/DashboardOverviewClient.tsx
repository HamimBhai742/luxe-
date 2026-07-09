/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/features/cart/cartSlice";
import { useGetWishlistQuery, useAddToWishlistMutation, useRemoveFromWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useSyncDbCartMutation } from "@/lib/features/api/cartApi";
import { useGetOrdersQuery } from "@/lib/features/api/orderApi";
import { useGetProductsQuery } from "@/lib/features/api/productApi";

export default function DashboardOverviewClient() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const userEmail = user?.email || (typeof window !== "undefined" ? localStorage.getItem("userEmail") : "");

  const { data: wishlistData } = useGetWishlistQuery();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [syncDbCart] = useSyncDbCartMutation();

  const { data: ordersData, isLoading: isLoadingOrders } = useGetOrdersQuery(
    userEmail ? { search: userEmail } : undefined,
    { skip: !userEmail }
  );

  const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery();

  const wishlist = wishlistData?.success && wishlistData.data ? wishlistData.data : [];
  const orders = ordersData?.success && ordersData.data ? ordersData.data : [];
  const productsList = productsData?.success && productsData.data ? productsData.data : [];

  const recommendedItems = useMemo(() => {
    return productsList.slice(0, 4);
  }, [productsList]);

  // Dynamic metrics calculation
  const totalOrders = orders.length;
  const activeShipments = orders.filter((ord) => 
    ord.fulfillmentStatus === "Processing" || 
    ord.fulfillmentStatus === "Confirmed" || 
    ord.fulfillmentStatus === "Packed" || 
    ord.fulfillmentStatus === "Shipped"
  ).length;
  const wishlistItemsCount = wishlist.length;
  
  const totalSpent = orders.reduce((sum, ord) => sum + ord.total, 0);
  const auraPoints = Math.floor(totalSpent * 5);

  const toggleFavorite = async (id: string | number, name: string) => {
    const stringId = String(id);
    const isFav = wishlist.some((item) => String(item.id) === stringId);
    try {
      if (isFav) {
        await removeFromWishlist({ productId: stringId }).unwrap();
        toast.success(`Removed ${name} from wishlist`);
      } else {
        await addToWishlist({ productId: stringId }).unwrap();
        toast.success(`Added ${name} to wishlist!`);
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
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
    toast.success(`Added ${item.name} to cart!`);

    try {
      await syncDbCart({
        items: [{ productId: String(item.id), quantity: 1, specsText: "Default Edition • Premium Grade" }],
      }).unwrap();
    } catch (err) {
      console.error("Failed to sync item addition to DB cart:", err);
    }
  };

  const renderStatusPill = (status: string) => {
    switch (status) {
      case "Processing":
      case "Confirmed":
      case "Packed":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            Processing
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-0.5 text-xs font-bold text-zinc-650 dark:bg-zinc-950/30 dark:text-zinc-400">
            {status || "Pending"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* ========================================================================= */}
      {/* WELCOME BANNER CARD */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-blue-100/50 bg-blue-50/15 dark:border-blue-900/20 dark:bg-blue-950/5 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xs">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || "Customer"}
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
            Here's a summary of your account activity and latest updates.
          </p>
        </div>
        <div className="flex gap-3.5 shrink-0">
          <Link
            href="/dashboard/settings"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-200 shadow-sm transition-all cursor-pointer text-center flex items-center justify-center"
          >
            View Profile
          </Link>
          <Link
            href="/collections"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRICS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Orders */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex justify-between items-start">
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider block">Total Orders</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-white block leading-none">
              {isLoadingOrders ? "..." : totalOrders}
            </span>
          </div>
          <span className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-2 text-blue-600 dark:text-blue-455">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
            </svg>
          </span>
        </div>

        {/* Card 2: Active Shipments */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex justify-between items-start">
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider block">Active Shipments</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-white block leading-none">
              {isLoadingOrders ? "..." : activeShipments}
            </span>
          </div>
          <span className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-2 text-blue-600 dark:text-blue-455">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
            </svg>
          </span>
        </div>

        {/* Card 3: Wishlist Items */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex justify-between items-start">
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider block">Wishlist Items</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-white block leading-none">{wishlistItemsCount}</span>
          </div>
          <span className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-2 text-blue-600 dark:text-blue-455">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </span>
        </div>

        {/* Card 4: Aura Points */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex justify-between items-start">
          <div className="space-y-3">
            <span className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider block">Aura Points</span>
            <span className="text-3xl font-black text-zinc-900 dark:text-white block leading-none">
              {isLoadingOrders ? "..." : auraPoints.toLocaleString()}
            </span>
          </div>
          <span className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-2 text-blue-600 dark:text-blue-455">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECENT ORDERS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        
        {/* Header link */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
            Recent Orders
          </h3>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-blue-600 dark:text-blue-455 hover:underline cursor-pointer text-center"
          >
            View All
          </Link>
        </div>

        {/* Table layout wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
            <thead>
              <tr className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">
                <th className="pb-3.5 pl-3">Order ID</th>
                <th className="pb-3.5">Date</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right pr-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isLoadingOrders ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-400 dark:text-zinc-500">
                    Loading recent orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-zinc-400 dark:text-zinc-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                    <td className="py-4 pl-3 font-bold text-zinc-900 dark:text-white">
                      <Link href="/dashboard/orders" className="hover:underline text-blue-600 dark:text-blue-455">
                        {ord.orderId}
                      </Link>
                    </td>
                    <td className="py-4 text-zinc-500 dark:text-zinc-400">{ord.date}</td>
                    <td className="py-4">{renderStatusPill(ord.fulfillmentStatus)}</td>
                    <td className="py-4 text-right pr-3 font-bold text-zinc-900 dark:text-white">${ord.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RECOMMENDED PRODUCTS SECTION */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <h3 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase">
          Recommended for You
        </h3>
        
        {isLoadingProducts ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recommendedItems.length === 0 ? (
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
            No product recommendations available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {recommendedItems.map((item) => {
              const isFav = wishlist.some((fav) => String(fav.id) === String(item.id));
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  
                  {/* Image showcase */}
                  <div className="relative aspect-square w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center p-4">
                    <Link href={`/collections/${item.id}`} className="w-full h-full flex items-center justify-center">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={150}
                        height={150}
                        className="object-contain max-h-[85%] max-w-[85%] transition-transform duration-500 ease-out group-hover:scale-103"
                      />
                    </Link>
                    
                    {/* Heart Fav trigger */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id, item.name);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xs text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <svg className={`h-4 w-4 ${isFav ? "fill-red-500 stroke-red-500" : "stroke-current"}`} fill="none" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>

                  {/* Info panels */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide block">{item.category}</span>
                      <Link href={`/collections/${item.id}`}>
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-white mt-1 leading-snug truncate group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                      </Link>
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-white">${item.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                        className="rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-700 p-1.5 dark:bg-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-xs"
                        title="Add to Cart"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
