/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useSubmitReviewMutation, useGetUserReviewsQuery } from "@/lib/features/api/reviewApi";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  specs: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderId: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  deliveryDate?: string;
  progressStep?: number; // 1: Confirmed, 2: Packed, 3: Shipped, 4: Delivered
  paymentStatus?: string;
  paymentMethod?: string;
}

export default function DashboardOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState("wishlist"); // Highlight wishlist icon in mockup bottom nav
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const authUserStr = localStorage.getItem("authUser");
        if (!authUserStr) {
          setIsLoading(false);
          return;
        }
        const authUser = JSON.parse(authUserStr);
        const userEmail = authUser.email;
        if (!userEmail) {
          setIsLoading(false);
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
        // Query backend for this user's email
        const res = await fetch(`${baseUrl}/orders?search=${encodeURIComponent(userEmail)}&limit=100`);
        const json = await res.json();
        if (json.success && json.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedOrders = json.data.map((ord: any) => {
            const rawItems = ord.items ? (typeof ord.items === "string" ? JSON.parse(ord.items) : ord.items) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedItems = rawItems.map((item: any) => ({
              id: item.id || item.productId,
              name: item.name || "Product Item",
              image: item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150",
              specs: item.specsText || "",
              qty: item.quantity || 1,
              price: item.price || 0,
            }));

            // Map status
            let status = ord.fulfillmentStatus || "Processing";
            if (ord.fulfillmentStatus === "Canceled") {
              status = "Cancelled";
            }

            let progressStep = 1;
            if (ord.fulfillmentStatus === "Processing") progressStep = 1;
            else if (ord.fulfillmentStatus === "Confirmed") progressStep = 2;
            else if (ord.fulfillmentStatus === "Packed") progressStep = 3;
            else if (ord.fulfillmentStatus === "Shipped") progressStep = 4;
            else if (ord.fulfillmentStatus === "Delivered") progressStep = 5;
            else progressStep = 0;

            // Delivery Date
            let deliveryDate = "3-5 Days";
            if (ord.fulfillmentStatus === "Delivered") {
              deliveryDate = new Date(ord.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            } else {
              deliveryDate = new Date(new Date(ord.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }

            return {
              id: ord.id,
              orderId: ord.orderId,
              date: ord.date,
              status,
              total: ord.total,
              items: mappedItems,
              deliveryDate,
              progressStep,
              paymentStatus: ord.paymentStatus || "Pending",
              paymentMethod: ord.paymentMethod || "card",
            };
          });
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserOrders();
  }, []);

  const handleInvoice = (dbId: string, orderId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
    const downloadUrl = `${baseUrl}/orders/${dbId}/invoice/download`;
    
    toast.success(`Downloading invoice for order ${orderId}...`);
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `invoice-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { data: userReviewsData } = useGetUserReviewsQuery();
  const [submitReview] = useSubmitReviewMutation();
  const [reviewProduct, setReviewProduct] = useState<{ id: string; name: string; image: string } | null>(null);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState("");
  const [modalHoveredRating, setModalHoveredRating] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleModalReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct) return;
    if (!modalComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }

    setIsSubmittingReview(true);
    const toastId = toast.loading("Uploading image and submitting review...");
    try {
      let uploadedImages: string[] = [];

      if (selectedFile) {
        toast.loading("Uploading review image...", { id: toastId });
        const base64Image = await fileToBase64(selectedFile);
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
        
        const uploadRes = await fetch(`${baseUrl}/upload/image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Failed to upload review image.");
        }
        uploadedImages = [uploadData.url];
      }

      toast.loading("Saving review...", { id: toastId });
      const res = await submitReview({
        productId: reviewProduct.id,
        rating: modalRating,
        comment: modalComment.trim(),
        images: uploadedImages,
      }).unwrap();

      if (res.success) {
        toast.success("Review submitted successfully!", { id: toastId });
        setReviewProduct(null);
        setModalComment("");
        setModalRating(5);
        setSelectedFile(null);
        setFilePreview(null);
      }
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err?.message || err?.data?.message || "Failed to submit review. You might have already reviewed this item.", { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBuyAgain = (name: string) => {
    toast.success(`Re-added ${name} to shopping cart!`);
  };

  const handleCancelOrder = async (orderId: string, displayId: string) => {
    const toastId = toast.loading(`Cancelling order ${displayId}...`);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${baseUrl}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus: "Canceled" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: "Cancelled", progressStep: 0 } : ord))
        );
        toast.success(`Order ${displayId} has been successfully cancelled.`, { id: toastId });
      } else {
        let errMsg = json.message || "Failed to cancel order.";
        if (json.errors) {
          const firstErrKey = Object.keys(json.errors)[0];
          if (firstErrKey) {
            errMsg = json.errors[firstErrKey];
          }
        }
        toast.error(errMsg, { id: toastId });
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("Failed to cancel order due to a network error.", { id: toastId });
    }
  };

  const handleTrackOrder = (orderId: string) => {
    toast.success(`Tracking delivery status for ${orderId}...`);
  };

  // Search & Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Filter Category
      if (activeFilter !== "All" && activeFilter !== "All Orders") {
        if (ord.status !== activeFilter) return false;
      }
      // Search Box Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = ord.orderId.toLowerCase().includes(query) || ord.id.toLowerCase().includes(query);
        const matchesItems = ord.items.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        return matchesId || matchesItems;
      }
      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 font-bold space-y-4">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs animate-pulse">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="hidden md:block">
        
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase font-serif">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 font-semibold">
            View and manage your recent purchases and returns.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-xs">
          
          {/* Filter tabs list */}
          <div className="flex flex-wrap gap-1">
            {["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => {
              const isActive = activeFilter === tab || (tab === "All Orders" && activeFilter === "All");
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveFilter(tab === "All Orders" ? "All" : tab);
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Search box & Duration */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Order ID or item..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-56 pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white hover:bg-zinc-55 px-4 py-2 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-xs">
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Past 3 months</span>
            </button>
          </div>

        </div>

        {/* List of Orders */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl text-center">
              <svg className="h-12 w-12 text-zinc-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25M3.75 7.5L5.621 3.757A1.5 1.5 0 016.964 3h10.071a1.5 1.5 0 011.343.803L20.25 7.5m-16.5 0H20.25" />
              </svg>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No orders found</h3>
              <p className="mt-1 text-xs text-zinc-400">Try adjusting your filters or query to find items.</p>
            </div>
          ) : (
            paginatedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
              >
                {/* Header strip */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-wrap gap-8 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Order ID</span>
                      <span className="text-zinc-800 dark:text-white">{ord.orderId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Date Placed</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{ord.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Payment Method</span>
                      <span className="text-zinc-800 dark:text-zinc-200 capitalize">
                        {ord.paymentMethod === "card" 
                          ? "Stripe (Card)" 
                          : ord.paymentMethod === "bkash" 
                            ? "bKash" 
                            : "Cash on Delivery"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Payment Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentStatus === "Paid" 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50"
                          : ord.paymentStatus === "Refunded"
                            ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-450"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-1">Total Amount</span>
                      <span className="text-zinc-800 dark:text-white text-sm font-extrabold">৳{ord.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div>
                    {ord.status === "Delivered" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/10">
                        &#8226; Delivered
                      </span>
                    ) : ord.status === "Shipped" ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/10">
                        &#8226; Shipped
                      </span>
                    ) : ord.status === "Confirmed" ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/10">
                        &#8226; Confirmed
                      </span>
                    ) : ord.status === "Packed" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-450 border border-amber-100/50 dark:border-amber-900/10">
                        &#8226; Packed
                      </span>
                    ) : ord.status === "Cancelled" || ord.status === "Canceled" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-950/20 dark:text-red-450">
                        Cancelled
                      </span>
                    ) : ord.status === "Returned" ? (
                      <span className="inline-flex items-center rounded-full bg-zinc-50 px-3 py-1 text-xs font-bold text-zinc-500 border border-zinc-100 dark:bg-zinc-950/20">
                        Returned
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-800">
                        Processing
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in order */}
                <div className="p-6 divide-y divide-zinc-100 dark:divide-zinc-800/80 space-y-5">
                  {ord.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-6 pt-5 first:pt-0">
                      <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">{item.name}</h4>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">{item.specs}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">৳{item.price.toFixed(2)}</span>
                        {ord.status === "Delivered" && !(userReviewsData?.data?.some((rev: any) => String(rev.productId) === String(item.id))) && (
                          <button
                            onClick={() => setReviewProduct({ id: item.id, name: item.name, image: item.image })}
                            className="text-[10px] font-extrabold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-400 uppercase tracking-wider hover:underline cursor-pointer"
                          >
                            Review Item
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress tracker widget (if active) */}
                {(ord.status === "Processing" || ord.status === "Confirmed" || ord.status === "Packed" || ord.status === "Shipped") && ord.progressStep && (
                  <div className="px-6 pb-8 pt-4">
                    <div className="max-w-xl mx-auto">
                      <div className="relative flex items-center justify-between z-0">
                        {/* Connecting Line background */}
                        <div className="absolute left-[12.5%] right-[12.5%] h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 top-4 z-0 rounded-full" />
                        {/* Active Line indicator */}
                        <div
                          className="absolute left-[12.5%] h-0.5 bg-blue-600 -translate-y-1/2 top-4 z-0 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${((Math.min(4, ord.progressStep) - 1) / 3) * 75}%` }}
                        />

                        {/* Steps circles */}
                        {[
                          { label: "Confirmed", step: 1 },
                          { label: "Packed", step: 2 },
                          { label: "Shipped", step: 3 },
                          { label: "Delivered", step: 4 },
                        ].map((s) => {
                          const isDone = s.step < ord.progressStep!;
                          const isCurrent = s.step === ord.progressStep!;
                          return (
                            <div key={s.label} className="flex flex-col items-center flex-1 relative z-10">
                              {isDone ? (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-md shadow-blue-500/10">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                </div>
                              ) : isCurrent ? (
                                <div className="h-8 w-8 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-950/30 ring-4 ring-blue-100/50 dark:ring-blue-900/30 shadow-md">
                                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />
                              )}
                              <span className={`text-[10px] font-black mt-3 uppercase tracking-wider ${
                                isDone || isCurrent ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer buttons row */}
                <div className="bg-zinc-50/25 dark:bg-zinc-900/30 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {ord.status === "Delivered" ? (
                      <span className="flex items-center gap-1.5 text-emerald-650 dark:text-emerald-400">
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Delivered on {ord.deliveryDate}</span>
                      </span>
                    ) : ord.status === "Cancelled" ? (
                      <span className="text-red-500">Order Cancelled</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
                        </svg>
                        <span>Estimated delivery: {ord.deliveryDate}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleInvoice(ord.id, ord.orderId)}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>Invoice</span>
                    </button>

                    {ord.status === "Delivered" ? (
                      <>
                        {ord.items.length > 0 && !(userReviewsData?.data?.some((rev: any) => String(rev.productId) === String(ord.items[0].id))) && (
                          <button
                            onClick={() => {
                              const itm = ord.items[0];
                              setReviewProduct({ id: itm.id, name: itm.name, image: itm.image });
                            }}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer"
                          >
                            Write a Review
                          </button>
                        )}
                        <button
                          onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                          <span>Buy Again</span>
                        </button>
                      </>
                    ) : ord.status === "Cancelled" || ord.status === "Returned" ? (
                      <button
                        onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>Buy Again</span>
                      </button>
                    ) : (
                      <>
                        {(ord.status === "Processing" || ord.status === "Confirmed" || ord.status === "Packed") && (
                          <button
                            onClick={() => handleCancelOrder(ord.id, ord.orderId)}
                            className="rounded-xl border border-red-200 dark:border-red-900 bg-white hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/20 px-4 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 shadow-sm transition-all cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => handleTrackOrder(ord.id)}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-4 py-2.5 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span>Track Order</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs select-none transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span>Previous</span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      type="button"
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all cursor-pointer select-none ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                          : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <span className="sm:hidden text-xs font-black text-zinc-500 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs select-none transition-all"
              >
                <span>Next</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col bg-zinc-50/40 dark:bg-zinc-950/20 pb-20">
        
        {/* Mobile search bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Mobile Horizontal Filter Pills */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3.5 scrollbar-none shrink-0 select-none">
          {["All", "Processing", "Shipped", "Delivered"].map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveFilter(tab);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Mobile Card list */}
        <div className="space-y-4 px-4 pt-1">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 p-6">
              <span className="text-xs font-bold text-zinc-400">No matching orders</span>
            </div>
          ) : (
            paginatedOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4"
              >
                {/* Mobile Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-zinc-800 dark:text-white font-serif">{ord.orderId}</h4>
                    <span className="text-[10px] font-bold text-zinc-400 block mt-0.5">{ord.date}</span>
                  </div>
                  <div>
                    {ord.status === "Delivered" ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                        Delivered
                      </span>
                    ) : ord.status === "Confirmed" ? (
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/20 dark:text-purple-400">
                        Confirmed
                      </span>
                    ) : ord.status === "Packed" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                        Packed
                      </span>
                    ) : ord.status === "Cancelled" || ord.status === "Canceled" ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                        Cancelled
                      </span>
                    ) : ord.status === "Returned" ? (
                      <span className="inline-flex items-center rounded-full bg-zinc-50 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 border dark:bg-zinc-950/20">
                        Returned
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        {ord.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Payment details row */}
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div>
                    <span className="text-[9px] text-zinc-400 block">Payment Method</span>
                    <span className="text-zinc-800 dark:text-zinc-200 capitalize">
                      {ord.paymentMethod === "card" 
                        ? "Stripe (Card)" 
                        : ord.paymentMethod === "bkash" 
                          ? "bKash" 
                          : "Cash on Delivery"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 block">Payment Status</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                      ord.paymentStatus === "Paid" 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                        : ord.paymentStatus === "Refunded"
                          ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Mobile Item Info */}
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 space-y-4">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center pt-3 first:pt-0">
                      <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="object-contain max-h-full max-w-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-zinc-800 dark:text-white leading-tight truncate">
                          {item.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">{item.specs}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] font-semibold text-zinc-400 block">
                            Qty: {item.qty} • ৳{item.price.toFixed(2)}
                          </span>
                          {ord.status === "Delivered" && (
                            <button
                              onClick={() => setReviewProduct({ id: item.id, name: item.name, image: item.image })}
                              className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline cursor-pointer"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Milestone Progress Indicators (if active) */}
                {(ord.status === "Processing" || ord.status === "Confirmed" || ord.status === "Packed" || ord.status === "Shipped") && ord.progressStep && (
                  <div className="px-2 py-4 border-t border-b border-zinc-100 dark:border-zinc-800/80">
                    <div className="relative flex items-center justify-between z-0">
                      {/* Connecting Line background */}
                      <div className="absolute left-[12.5%] right-[12.5%] h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 top-3.5 z-0" />
                      {/* Active Line indicator */}
                      <div
                        className="absolute left-[12.5%] h-0.5 bg-blue-600 -translate-y-1/2 top-3.5 z-0 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((Math.min(4, ord.progressStep) - 1) / 3) * 75}%` }}
                      />

                      {/* Steps circles */}
                      {[
                        { label: "Confirmed", step: 1 },
                        { label: "Packed", step: 2 },
                        { label: "Shipped", step: 3 },
                        { label: "Delivered", step: 4 },
                      ].map((s) => {
                        const isDone = s.step < ord.progressStep!;
                        const isCurrent = s.step === ord.progressStep!;
                        return (
                          <div key={s.label} className="flex flex-col items-center flex-1 relative z-10">
                            {isDone ? (
                              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-blue-600 text-white shadow-sm">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            ) : isCurrent ? (
                              <div className="h-7 w-7 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-50/80 dark:bg-blue-950/30 ring-4 ring-blue-100/50 dark:ring-blue-900/30 shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                              </div>
                            ) : (
                              <div className="h-7 w-7 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />
                            )}
                            <span className={`text-[8px] font-black mt-2 uppercase tracking-wide ${
                              isDone || isCurrent ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-600"
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile Bottom Actions */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    ${ord.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <div className="flex gap-2">
                    {ord.status === "Delivered" ? (
                      <>
                        <button
                          onClick={() => {
                            if (ord.items.length > 0) {
                              const itm = ord.items[0];
                              setReviewProduct({ id: itm.id, name: itm.name, image: itm.image });
                            }
                          }}
                          className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                          className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"
                        >
                          Buy Again
                        </button>
                      </>
                    ) : ord.status === "Cancelled" || ord.status === "Returned" ? (
                      <button
                        onClick={() => handleBuyAgain(ord.items[0]?.name || "item")}
                        className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"
                      >
                        Buy Again
                      </button>
                    ) : (
                      <>
                        {(ord.status === "Processing" || ord.status === "Confirmed" || ord.status === "Packed") && (
                          <button
                            onClick={() => handleCancelOrder(ord.id, ord.orderId)}
                            className="rounded-xl border border-red-200 dark:border-red-900 bg-white hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-950/20 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleInvoice(ord.id, ord.orderId)}
                          className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                        >
                          Invoice
                        </button>
                        <button
                          onClick={() => handleTrackOrder(ord.id)}
                          className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-bold"
                        >
                          Track Order
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}

          {/* Mobile Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 pt-4 mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
              >
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span>Prev</span>
              </button>
              <span className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
              >
                <span>Next</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Dock (Active Wishlist circular overlay matches screenshot design) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 px-6 py-2 shadow-lg">
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
                activeMobileTab === "wishlist" ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-50"
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

      {/* Review Modal */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden scale-100 transition-transform duration-300">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Write a Review</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">Share your experience with this item</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewProduct(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product details summary in modal */}
            <div className="flex items-center gap-4 p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl mb-6">
              <div className="h-12 w-12 bg-white dark:bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0">
                <img
                  src={reviewProduct.image}
                  alt={reviewProduct.name}
                  className="object-contain max-h-full max-w-full"
                  style={{ width: "48px", height: "48px" }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-snug">{reviewProduct.name}</h4>
              </div>
            </div>

            <form onSubmit={handleModalReviewSubmit}>
              {/* Star Rating Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2.5">Your Rating</label>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const isHighlighted = modalHoveredRating !== null ? starVal <= modalHoveredRating : starVal <= modalRating;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setModalRating(starVal)}
                        onMouseEnter={() => setModalHoveredRating(starVal)}
                        onMouseLeave={() => setModalHoveredRating(null)}
                        className="text-amber-400 hover:scale-110 transition-all duration-150 cursor-pointer focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${isHighlighted ? "fill-amber-400" : "fill-zinc-200 dark:fill-zinc-800"}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 ml-2">
                    {modalHoveredRating !== null ? `${modalHoveredRating} Star${modalHoveredRating > 1 ? 's' : ''}` : `${modalRating} Star${modalRating > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              {/* Review Comment Details */}
              <div className="mb-6">
                <label htmlFor="modal-comment-text" className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Review Details</label>
                <textarea
                  id="modal-comment-text"
                  rows={4}
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  placeholder="Share details about what you liked or disliked about this product..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-medium"
                  required
                />
              </div>

              {/* Image upload field */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">Review Image (Optional)</label>
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="modal-review-image"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFilePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="modal-review-image"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Choose Image</span>
                  </label>

                  {filePreview && (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <img src={filePreview} alt="Review preview" className="object-cover h-full w-full" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-zinc-900/80 hover:bg-zinc-900 rounded-full p-0.5 text-white transition-all cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewProduct(null)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-3 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-4 py-3 text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmittingReview ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
