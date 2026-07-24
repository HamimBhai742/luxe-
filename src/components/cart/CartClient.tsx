/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { CartItem, RecommendedProduct } from "@/lib/mockData";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { updateQuantity, removeFromCart, clearCart, addToCart } from "@/lib/features/cart/cartSlice";
import { useGetProductsQuery } from "@/lib/features/api/productApi";
import { useSyncDbCartMutation, useRemoveDbCartItemMutation, useClearDbCartMutation } from "@/lib/features/api/cartApi";
import { useAddToWishlistMutation } from "@/lib/features/api/wishlistApi";
import { useValidateCouponMutation } from "@/lib/features/api/couponApi";

interface CartClientProps {
  initialItems: CartItem[];
  recommended: RecommendedProduct[];
}

export default function CartClient({ initialItems, recommended }: CartClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: productsData } = useGetProductsQuery();

  const [syncDbCart] = useSyncDbCartMutation();
  const [removeDbCartItem] = useRemoveDbCartItemMutation();
  const [clearDbCart] = useClearDbCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  const [promoInput, setPromoInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; type: string; value: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [activeMobileTab, setActiveMobileTab] = useState("cart");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const recommendedList = useMemo(() => {
    if (!productsData?.success || !productsData.data) {
      return recommended;
    }
    const dbProducts = productsData.data;
    const cartItemNames = new Set(cartItems.map((item) => item.name));
    const filtered = dbProducts.filter((p) => !cartItemNames.has(p.name));
    const mapped = filtered.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      brand: p.brand
    }));
    return mapped.length > 0 ? mapped.slice(0, 4) : dbProducts.slice(0, 4);
  }, [productsData, cartItems, recommended]);

  // Derived calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% sales tax matching desktop screenshot estimates
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "Percentage") {
      const pct = parseFloat(appliedCoupon.value) / 100;
      discountAmount = subtotal * pct;
    } else if (appliedCoupon.type === "Fixed Amount") {
      discountAmount = parseFloat(appliedCoupon.value);
    }
  }
  const total = Math.max(0, subtotal + tax - discountAmount);

  // Mobile total (matches screenshot with no tax logic, simple subtotal and discount)
  const mobileTotal = Math.max(0, subtotal - discountAmount);

  // Quantity updates
  const handleUpdateQuantity = async (id: string | number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    dispatch(updateQuantity({ id, quantity: newQty }));

    if (isAuthenticated) {
      try {
        await syncDbCart({
          items: [{ productId: String(id), quantity: newQty }],
          overwrite: true,
        }).unwrap();
      } catch (err) {
        console.error("Failed to update cart item quantity in DB:", err);
      }
    }
  };

  // Remove item
  const handleRemove = async (id: string | number, name: string) => {
    dispatch(removeFromCart({ id }));
    toast.success(`Removed ${name} from cart`);

    if (isAuthenticated) {
      try {
        await removeDbCartItem({ productId: String(id) }).unwrap();
      } catch (err) {
        console.error("Failed to remove cart item from DB:", err);
      }
    }
  };

  // Save for later
  const handleSaveForLater = async (id: string | number, name: string) => {
    if (!isAuthenticated) {
      localStorage.setItem("pendingWishlistAdd", String(id));
      toast.info("Please log in to save items for later.");
      router.push("/sign-in");
      return;
    }

    try {
      await addToWishlist({ productId: String(id) }).unwrap();
      dispatch(removeFromCart({ id }));
      await removeDbCartItem({ productId: String(id) }).unwrap();
      toast.success(`Saved ${name} for later (moved to wishlist)!`);
    } catch (err) {
      toast.error("Failed to save item for later");
    }
  };

  // Clear cart
  const handleClearCart = async () => {
    dispatch(clearCart());
    toast.success("Shopping cart cleared");

    if (isAuthenticated) {
      try {
        await clearDbCart().unwrap();
      } catch (err) {
        console.error("Failed to clear cart in DB:", err);
      }
    }
  };

  // Promo code
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    try {
      const result = await validateCoupon({ code }).unwrap();
      if (result.success && result.data) {
        const coupon = result.data;
        setAppliedCoupon(coupon);
        let desc = "";
        if (coupon.type === "Percentage") {
          desc = `${coupon.value}% off`;
        } else if (coupon.type === "Fixed Amount") {
          desc = `৳${coupon.value} off`;
        } else {
          desc = "Free Shipping";
        }
        setPromoSuccess(`Promo code ${coupon.code} applied: ${desc}!`);
        toast.success(`Promo code ${coupon.code} applied successfully!`);
      }
    } catch (err: any) {
      const errorMsg = err?.data?.message || "Invalid promo code or gift card";
      setPromoError(errorMsg);
      toast.error(errorMsg);
      setAppliedCoupon(null);
    }
  };

  // Add recommended product
  const handleAddRecommended = async (rec: any) => {
    const brand = rec.brand || "AURATECH";
    dispatch(
      addToCart({
        id: rec.id,
        productId: String(rec.id),
        name: rec.name,
        brand,
        price: rec.price,
        image: rec.image,
        specsText: "Default Edition • Premium Grade",
      })
    );
    toast.success(`Added ${rec.name} to cart!`);

    if (isAuthenticated) {
      try {
        await syncDbCart({
          items: [{ productId: String(rec.id), quantity: 1, specsText: "Default Edition • Premium Grade" }],
        }).unwrap();
      } catch (err) {
        console.error("Failed to sync recommended item to DB:", err);
      }
    }
  };

  // Checkout Simulation
  const handleCheckout = () => {
    if (appliedCoupon) {
      sessionStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon));
    } else {
      sessionStorage.removeItem("appliedCoupon");
    }
    if (!isAuthenticated) {
      toast.error("Please log in to proceed to checkout!");
      router.push("/sign-in?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold font-serif text-sm tracking-wide">Loading your luxury bag...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/30 dark:bg-zinc-950/20 transition-colors duration-300 min-h-screen">
      
      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Shopping Cart {cartItems.length > 0 && `(${itemsCount} ${itemsCount === 1 ? 'Item' : 'Items'})`}
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-bold text-red-600 hover:text-red-500 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer bg-red-50 dark:bg-red-950/20 px-3.5 py-2 rounded-xl border border-red-100 dark:border-red-950/50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <svg className="h-16 w-16 text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your cart is empty</h2>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/collections" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-colors cursor-pointer">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8 items-start mb-16">
            
            {/* Left Panel: Cart items list */}
            <div className="col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all gap-6 justify-between items-center"
                >
                  <div className="flex gap-6 items-center flex-1">
                    <div className="h-24 w-24 shrink-0 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-2">
                      <Image src={item.image} alt={item.name} width={96} height={96} className="object-contain max-h-full max-w-full" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 font-medium">
                        {item.specsText}
                      </p>
                      <div className="flex items-center gap-4 mt-4 text-xs font-bold text-zinc-400">
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="flex items-center gap-1.5 hover:text-red-500 dark:hover:text-red-400 text-zinc-400 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          <span>Remove</span>
                        </button>
                        
                        <button
                          onClick={() => handleSaveForLater(item.id, item.name)}
                          className="flex items-center gap-1.5 hover:text-zinc-600 dark:hover:text-zinc-200 text-zinc-400 transition-colors cursor-pointer"
                          title="Save for Later"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                          </svg>
                          <span>Save for Later</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-end gap-3 shrink-0">
                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
                      ৳{(item.price * item.quantity).toLocaleString()}.00
                    </span>
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 font-bold transition-colors cursor-pointer disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        &minus;
                      </button>
                      <span className="px-3.5 text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 font-bold transition-colors cursor-pointer"
                      >
                        &#43;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Panel: Order Summary */}
            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                Order Summary
              </h2>
              
              <div className="space-y-3.5 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal ({itemsCount} {itemsCount === 1 ? 'item' : 'items'})</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">৳{subtotal.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Estimate</span>
                  <span className="text-zinc-600 dark:text-zinc-300 font-bold">
                    {subtotal >= 50 ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">৳{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-৳{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-zinc-950 dark:text-zinc-50">
                  ৳{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <form onSubmit={handleApplyPromo} className="pt-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                  <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  <span>Add Promo Code / Gift Card</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (try LUXE20)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-sm transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] font-bold text-red-500 mt-2">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] font-bold text-green-600 mt-2">{promoSuccess}</p>}
              </form>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <div className="pt-4 border-t border-zinc-155 dark:border-zinc-800 space-y-3 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                  </svg>
                  <span>Secure, encrypted checkout</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
                  </svg>
                  <span>Free shipping on orders over ৳5,000</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <svg className="h-4.5 w-4.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M7.5 12l-3 3m3-3l3 3" />
                  </svg>
                  <span>30-day hassle-free returns</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Recommended list */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-6">
            Recommended for You
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {recommendedList.map((rec) => (
              <div
                key={rec.id}
                className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden p-4 flex items-center justify-center">
                  <Image src={rec.image} alt={rec.name} width={150} height={150} className="object-contain max-h-[85%] max-w-[85%] transition-transform duration-500 ease-out group-hover:scale-103" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {rec.name}
                    </h3>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 block mt-2">
                      ৳{rec.price.toLocaleString()}.00
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddRecommended(rec)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-4 transition-colors cursor-pointer shadow-xs"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT (MATCHING SCREENSHOT) */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col min-h-screen bg-zinc-50/40 dark:bg-zinc-950/20 pb-72">
        
        {/* Title Heading */}
        <div className="px-4 pt-6 pb-2 flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800 mb-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-serif">
            Shopping Cart ({itemsCount})
          </h1>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-bold text-red-600 hover:text-red-500 transition-colors bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-950/50 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            <svg className="h-16 w-16 text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Your cart is empty</h2>
            <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 mb-5">Add some items from collections to start shopping!</p>
            <Link href="/collections" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition-colors cursor-pointer">
              Go to Collections
            </Link>
          </div>
        ) : (
          <div className="space-y-4 px-4">
            
            {/* List of Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-3.5 gap-4 shadow-sm"
                >
                  {/* Left: Thumbnail Image */}
                  <div className="h-20 w-20 shrink-0 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex items-center justify-center p-1.5">
                    <Image src={item.image} alt={item.name} width={80} height={80} className="object-contain max-h-full max-w-full" />
                  </div>

                  {/* Right: Info Panel */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-800 dark:text-white font-serif leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1 block">
                        ৳{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Bottom Row: Selector + Save Remove triggers */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity select */}
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs scale-90 -ml-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          className="px-2.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 font-bold transition-colors cursor-pointer disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          &minus;
                        </button>
                        <span className="px-2.5 text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          className="px-2.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 font-bold transition-colors cursor-pointer"
                        >
                          &#43;
                        </button>
                      </div>

                      {/* Text links Save and Remove */}
                      <div className="flex items-center gap-3.5 text-xs font-semibold">
                        <button
                          onClick={() => handleSaveForLater(item.id, item.name)}
                          className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="text-red-600 hover:text-red-500 font-bold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Promo Code entry block */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 px-3.5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {promoError && <p className="text-[10px] font-bold text-red-500 mt-2 pl-1">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] font-bold text-green-600 mt-2 pl-1">{promoSuccess}</p>}
            </div>

            {/* Recommended Products Grid */}
            <div className="pt-6 pb-4">
              <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white uppercase mb-4">
                Recommended for You
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {recommendedList.slice(0, 2).map((rec) => (
                  <div
                    key={rec.id}
                    className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="aspect-4/3 w-full bg-zinc-50 dark:bg-zinc-950 p-3 flex items-center justify-center">
                      <Image src={rec.image} alt={rec.name} width={120} height={120} className="object-contain max-h-full max-w-full" />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {rec.name}
                        </h3>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 block mt-1">
                          ৳{rec.price.toLocaleString()}.00
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddRecommended(rec)}
                        className="w-full flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50/50 px-2 py-1.5 text-[10px] font-bold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MOBILE STICKY SUMMARY & CHECKOUT (STICKY BOTTOM DOCKED) */}
        {/* ========================================================================= */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-14 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-4 shadow-[0_-6px_16px_rgba(0,0,0,0.06)] backdrop-blur-md">
            
            {/* Calculation rows */}
            <div className="space-y-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">
                  ৳{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-medium">
                  Calculated at next step
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-৳{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800" />

            {/* Total Row */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white">Total</span>
              <span className="text-lg font-black text-zinc-950 dark:text-zinc-50">
                ৳{mobileTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Proceed checkout button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-extrabold shadow-md transition-colors cursor-pointer text-center"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Docked bottom menu) */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-zinc-950/98 border-t border-zinc-200 dark:border-zinc-900 px-6 py-2 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <Link
              href="/"
              onClick={() => setActiveMobileTab("home")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeMobileTab === "home" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </Link>

            <Link
              href="/collections"
              onClick={() => setActiveMobileTab("search")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeMobileTab === "search" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </Link>

            <Link
              href="/collections"
              onClick={() => setActiveMobileTab("sparkles")}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                activeMobileTab === "sparkles" ? "text-zinc-900 dark:text-white" : "hover:text-zinc-600"
              }`}
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3.096 15.09 8.19 14.28 9 9.18l.813 5.096 5.096.813-5.096.814zM19.07 7.07l-.357 2.237-.238-1.5-1.5-.238 2.237-.357.357-2.237.238 1.5 1.5.238-2.237.357z" />
              </svg>
            </Link>

            <Link
              href="/cart"
              onClick={() => setActiveMobileTab("cart")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white cursor-pointer shadow-sm transition-transform"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
              </svg>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
