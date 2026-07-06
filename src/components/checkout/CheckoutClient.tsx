/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useValidateCouponMutation } from "@/lib/features/api/couponApi";

export default function CheckoutClient() {
  const router = useRouter();

  // Current active step: 'shipping' | 'delivery' | 'payment' | 'review' | 'confirmation'
  const [activeStep, setActiveStep] = useState<"shipping" | "delivery" | "payment" | "review" | "confirmation">("shipping");

  // Shipping Address Form
  const [fullName, setFullName] = useState("Eleanor Vance");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [addressLine1, setAddressLine1] = useState("1042 Hillside Manor Drive");
  const [addressLine2, setAddressLine2] = useState("Apt 304");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [zipCode, setZipCode] = useState("94110");
  const [addToAddressBook, setAddToAddressBook] = useState(false);

  // Delivery Method Selection
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");

  // Payment Form Selection: 'card' (Stripe) | 'paypal' (SSLCommerz) | 'applepay' (COD)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "applepay">("card");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("•••");


  // Accordion state
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; type: string; value: string } | null>(null);

  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();

  useEffect(() => {
    const saved = sessionStorage.getItem("appliedCoupon");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const timer = setTimeout(() => {
          setAppliedCoupon(parsed);
        }, 0);
        return () => clearTimeout(timer);
      } catch (e) {
        
      }
    }
  }, []);

  // Calculations: Dynamic to match screenshot values at different checkout stages!
  const isPaymentStage = activeStep === "payment";
  const isReviewStage = activeStep === "review";
  const isConfirmStage = activeStep === "confirmation";

  const subtotal = isConfirmStage ? 299.00 : isReviewStage ? 384.00 : isPaymentStage ? 270.00 : 249.00;
  const tax = isConfirmStage ? 23.92 : isReviewStage ? 26.88 : isPaymentStage ? 21.60 : 21.16;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "Percentage") {
      const pct = parseFloat(appliedCoupon.value) / 100;
      discountAmount = subtotal * pct;
    } else if (appliedCoupon.type === "Fixed Amount") {
      discountAmount = parseFloat(appliedCoupon.value);
    }
  }

  const getShippingCost = () => {
    if (activeStep === "shipping") return "Calculated next step";
    if (isConfirmStage) return 0.00;
    if (isPaymentStage) return 15.00; // Mock Payment matching screenshot exactly ($15.00)
    
    switch (deliveryMethod) {
      case "express":
        return 25.00; // Mock Express matching screenshot exactly ($25.00)
      default:
        return 0.00; // Standard Free
    }
  };

  const getShippingCostDisplay = () => {
    const cost = getShippingCost();
    if (typeof cost === "string") return cost;
    if (appliedCoupon && appliedCoupon.type === "Free Shipping") return "Free (Coupon Applied)";
    return cost === 0 ? "Free" : `$${cost.toFixed(2)}`;
  };

  const getGrandTotal = () => {
    const cost = getShippingCost();
    let shippingNum = typeof cost === "string" ? 0 : cost;
    if (appliedCoupon && appliedCoupon.type === "Free Shipping") {
      shippingNum = 0;
    }
    return Math.max(0, subtotal + tax + shippingNum - discountAmount);
  };

  const getSubtotalLabel = () => {
    if (activeStep === "review") return "Items (2)";
    if (activeStep === "payment") return "Subtotal";
    return "Subtotal (2 items)";
  };

  const getTaxLabel = () => {
    if (activeStep === "payment") return "Tax (8%)";
    if (activeStep === "delivery") return "Taxes";
    return "Estimated Tax";
  };

  const handleNextStep = () => {
    if (activeStep === "shipping") {
      if (!fullName || !addressLine1 || !city || !state || !zipCode) {
        toast.error("Please fill in all shipping fields!");
        return;
      }
      setActiveStep("delivery");
    } else if (activeStep === "delivery") {
      setActiveStep("payment");
    } else if (activeStep === "payment") {
      if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
        toast.error("Please fill in payment card details!");
        return;
      }
      setActiveStep("review");
    } else if (activeStep === "review") {
      toast.success("Order Placed Successfully!");
      setActiveStep("confirmation");
    }
  };

  const handleBackToStep = (step: "shipping" | "delivery" | "payment" | "review" | "confirmation") => {
    // Prevent skipping forward without validation
    if (step === "delivery" && (!fullName || !addressLine1)) return;
    if (step === "payment" && (!fullName || !addressLine1)) return;
    if (step === "review" && (!fullName || !addressLine1 || (paymentMethod === "card" && !cardNumber))) return;
    if (step === "confirmation") return; // cannot jump to confirm manually
    
    setActiveStep(step);
  };

  // RENDER FOR ORDER CONFIRMATION SUCCESS PAGE
  if (activeStep === "confirmation") {
    return (
      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 transition-colors duration-300 min-h-screen flex flex-col justify-between animate-fade-in">
        
        {/* Top Header Bar */}
        <div>
          <header className="border-b border-zinc-150 bg-white px-6 py-4 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
            <div className="mx-auto max-w-7xl flex items-center justify-center relative">
              <Link href="/" className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex flex-col items-center">
                <span>Aura Marketplace</span>
              </Link>
            </div>
          </header>

          {/* Main Success Container */}
          <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center">
            
            {/* Green Success Circle */}
            <div className="h-20 w-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-6 animate-scale-up">
              <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            {/* Thank you title */}
            <h1 className="text-3xl font-black text-zinc-955 dark:text-white text-center tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-sm text-zinc-500 font-bold text-center mt-2.5">
              Order #AURA-98234-LX has been placed successfully.
            </p>

            {/* Order Summary Centered Card */}
            <div className="w-full mt-10 rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
                <span className="text-base font-extrabold text-zinc-950 dark:text-white">Order Summary</span>
                <span className="bg-blue-50/70 dark:bg-blue-955/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase">
                  Confirmed
                </span>
              </div>

              {/* Smartwatch Item Details */}
              <div className="flex gap-4 py-2">
                <div className="relative h-16 w-16 rounded-xl border border-zinc-150 dark:border-zinc-850 overflow-hidden bg-zinc-50 shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"
                    alt="Aura Horizon Smartwatch"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex justify-between items-start text-xs leading-normal">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-zinc-900 dark:text-white text-sm">Aura Horizon Smartwatch</span>
                    <span className="text-[10px] text-zinc-400 font-bold mt-1">Titanium Silver, 44mm</span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-black text-zinc-950 dark:text-white text-sm">$299.00</span>
                    <span className="text-[10px] text-zinc-400 font-bold">Qty: 1</span>
                  </div>
                </div>
              </div>

              {/* Billing Breakdowns */}
              <div className="space-y-3.5 border-t border-zinc-100 dark:border-zinc-900 pt-5 text-xs text-zinc-500 font-bold">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-zinc-800 dark:text-zinc-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="text-zinc-850 dark:text-zinc-200">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax</span>
                  <span className="text-zinc-800 dark:text-zinc-200">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4 mt-2 flex justify-between items-baseline">
                  <span className="text-sm font-black text-zinc-955 dark:text-white">Total</span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-450">${getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Delivery Alert & Invoice Row */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              
              {/* Delivery Estimation Card */}
              <div className="rounded-2xl border border-zinc-150 p-4 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 flex items-start gap-3">
                <svg className="h-5 w-5 text-zinc-450 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                </svg>
                <div className="flex flex-col text-xs leading-normal">
                  <span className="font-extrabold text-zinc-850 dark:text-white">Estimated Delivery</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-extrabold mt-1">Oct 24 - Oct 26, 2024</span>
                  <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Standard Shipping</span>
                </div>
              </div>

              {/* Download Invoice Button Card */}
              <button
                type="button"
                onClick={() => toast.success("Invoice PDF download started successfully!")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-5 text-xs font-black shadow-md shadow-blue-500/10 transition-all cursor-pointer select-none"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download Invoice</span>
              </button>

            </div>

            {/* Continue Shopping button */}
            <button
              type="button"
              onClick={() => router.push("/collections")}
              className="mt-8 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-750 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-350 rounded-xl px-8 py-3 text-xs font-bold transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>

          </main>
        </div>

        {/* Footer bar */}
        <footer className="border-t border-zinc-150 bg-white px-6 py-6 dark:border-zinc-900 dark:bg-zinc-950 mt-12 text-[11px] font-bold text-zinc-400">
          <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-zinc-800 dark:text-zinc-300">Aura Marketplace</span>
            <span>© 2024 Aura Marketplace. All transactions are secure and encrypted.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-zinc-700">Privacy Policy</Link>
              <Link href="#" className="hover:text-zinc-700">Terms of Service</Link>
              <Link href="#" className="hover:text-zinc-700">Security Standards</Link>
            </div>
          </div>
        </footer>

      </div>
    );
  }

  // RENDER FOR NORMAL MULTI-STEP CHECKOUT
  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/20 transition-colors duration-300 min-h-screen flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <div>
        <header className="border-b border-zinc-150 bg-white px-6 py-4 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs">
          <div className="mx-auto max-w-7xl flex items-center justify-center relative">
            <Link href="/" className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex flex-col items-center">
              <span>Aura Marketplace</span>
            </Link>
          </div>
        </header>

        {/* Main Grid Content */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Horizontal steps progress indicator */}
          <div className="mx-auto max-w-3xl mb-12">
            <div className="flex items-center justify-between relative">
              
              {/* Background connecting lines */}
              <div className="absolute top-5 left-10 right-10 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />
              <div className="absolute top-5 left-10 h-0.5 bg-blue-600 -z-10 transition-all duration-350" style={{
                width: activeStep === "shipping" 
                  ? "0%" 
                  : activeStep === "delivery" 
                  ? "33.3%" 
                  : activeStep === "payment" 
                  ? "66.6%" 
                  : "100%"
              }} />

              {/* Step 1: Shipping */}
              <button
                onClick={() => handleBackToStep("shipping")}
                className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  activeStep === "shipping"
                    ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-950"
                    : "border-blue-600 bg-blue-600 text-white"
                }`}>
                  {activeStep !== "shipping" ? (
                    <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeStep === "shipping" ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"
                }`}>Shipping</span>
              </button>

              {/* Step 2: Delivery */}
              <button
                onClick={() => handleBackToStep("delivery")}
                className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  activeStep === "delivery"
                    ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-950"
                    : activeStep === "payment" || activeStep === "review"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                }`}>
                  {activeStep === "payment" || activeStep === "review" ? (
                    <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeStep === "delivery" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                }`}>Delivery</span>
              </button>

              {/* Step 3: Payment */}
              <button
                onClick={() => handleBackToStep("payment")}
                className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  activeStep === "payment"
                    ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-950"
                    : activeStep === "review"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                }`}>
                  {activeStep === "review" ? (
                    <svg className="h-5 w-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-6h18A2.25 2.25 0 0122.5 12v5.25A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V12a2.25 2.25 0 012.25-2.25z" />
                    </svg>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeStep === "payment" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                }`}>Payment</span>
              </button>

              {/* Step 4: Review */}
              <button
                onClick={() => handleBackToStep("review")}
                className="flex flex-col items-center gap-2 cursor-pointer focus:outline-none"
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  activeStep === "review"
                    ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-950"
                    : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  activeStep === "review" ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
                }`}>Review</span>
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* LEFT COLUMN: Checkout Form / Details (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: Shipping Address */}
              {activeStep === "shipping" && (
                <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs min-h-[380px] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-955 dark:text-white">
                      Shipping Address
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Please enter the details where you'd like your order delivered.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-305 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                        />
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                          State
                        </label>
                        <div className="relative">
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-305 cursor-pointer"
                          >
                            <option value="WA">Washington (WA)</option>
                            <option value="CA">California (CA)</option>
                            <option value="NY">New York (NY)</option>
                            <option value="TX">Texas (TX)</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Zip Code */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-305 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                        />
                      </div>
                    </div>

                    {/* Add to address book checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addToAddressBook}
                          onChange={(e) => setAddToAddressBook(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-zinc-305 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-955"
                        />
                        <span>Add to Address Book for future purchases</span>
                      </label>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2: Delivery Method */}
              {activeStep === "delivery" && (
                <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs min-h-[380px] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-955 dark:text-white">
                      Delivery Method
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Select your preferred delivery option.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    
                    {/* Standard Shipping */}
                    <label className={`flex flex-col border rounded-3xl p-5 cursor-pointer transition-all relative ${
                      deliveryMethod === "standard"
                        ? "border-blue-600 bg-blue-50/10 dark:bg-blue-955/5"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-955 dark:hover:bg-zinc-900"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/60 text-blue-600 dark:bg-zinc-900">
                          <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                          </svg>
                        </div>
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === "standard"}
                          onChange={() => setDeliveryMethod("standard")}
                          className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      
                      <div className="mt-5">
                        <span className="text-xs font-black text-zinc-900 dark:text-white block">Standard Shipping</span>
                        <span className="text-[10px] text-zinc-455 dark:text-zinc-550 font-bold mt-0.5 block">3-5 business days</span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-sm font-black text-zinc-955 dark:text-white">Free</span>
                        <span className="text-[9px] font-bold text-zinc-400">Est. Arrival: Oct 24 - Oct 26</span>
                      </div>
                    </label>

                    {/* Express Delivery */}
                    <label className={`flex flex-col border rounded-3xl p-5 cursor-pointer transition-all relative ${
                      deliveryMethod === "express"
                        ? "border-blue-600 bg-blue-50/10 dark:bg-blue-955/5"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50/60 text-blue-600 dark:bg-zinc-900">
                          <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 9.725A.75.75 0 013.882 8.5H7.5l2-4h5l2 4h3.618a.75.75 0 01.613 1.225L18 12M6 12v3.75a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25V12M6 12h12" />
                          </svg>
                        </div>
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryMethod === "express"}
                          onChange={() => setDeliveryMethod("express")}
                          className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      
                      <div className="mt-5">
                        <span className="text-xs font-black text-zinc-900 dark:text-white block">Express Delivery</span>
                        <span className="text-[10px] text-zinc-450 dark:text-zinc-550 font-bold mt-0.5 block">Next business day</span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-sm font-black text-zinc-955 dark:text-white">$25.00</span>
                        <span className="text-[9px] font-bold text-zinc-400">Est. Arrival: Tomorrow</span>
                      </div>
                    </label>

                  </div>
                </div>
              )}

              {/* STEP 3: Payment Details */}
              {activeStep === "payment" && (
                <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs min-h-[380px] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-955 dark:text-white">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Option 1: Credit/Debit Card (Stripe) */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-white dark:bg-zinc-955"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-955 dark:hover:bg-zinc-900"
                    }`}>
                      {/* Top Selection Row */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className="w-full flex items-center justify-between p-5 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <svg className="h-5.5 w-5.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-6h18A2.25 2.25 0 0122.5 12v5.25A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V12a2.25 2.25 0 012.25-2.25z" />
                          </svg>
                          <span className="text-xs font-black text-zinc-955 dark:text-white">Credit/Debit Card (Stripe)</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </button>

                      {/* Card Input Details */}
                      {paymentMethod === "card" && (
                        <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-900 pt-5 space-y-4 animate-fade-in">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450 mb-1.5">
                              Card Number
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                <svg className="h-4.5 w-4.5 text-zinc-450" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-6h18A2.25 2.25 0 0122.5 12v5.25A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V12a2.25 2.25 0 012.25-2.25z" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                required
                                placeholder="**** **** **** 4242"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                              />
                              <div className="absolute inset-y-0 right-3.5 flex items-center gap-1.5">
                                <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-zinc-400">VI</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-zinc-400">MC</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                                Expiry Date (MM/YY)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                  <svg className="h-4.5 w-4.5 text-zinc-405" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-455 mb-1.5">
                                CVC
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                  <svg className="h-4.5 w-4.5 text-zinc-405" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="CVC"
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value)}
                                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-1.5">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="h-4.5 w-4.5 rounded border-zinc-305 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                              />
                              <span>Save this card for future purchases</span>
                            </label>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-2">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-emerald-650 dark:text-emerald-500">
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                                </svg>
                                <span>SSL Secure</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                </svg>
                                <span>Encrypted Payment</span>
                              </span>
                            </div>
                            <div className="flex gap-2 text-zinc-400">
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                              </svg>
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                              </svg>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Option 2: Digital Wallets (SSLCommerz) */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "paypal"
                        ? "border-blue-600 bg-white dark:bg-zinc-950"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-955 dark:hover:bg-zinc-900"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className="w-full flex items-center justify-between p-5 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <svg className="h-5.5 w-5.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                          </svg>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">Digital Wallets (SSLCommerz)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded text-[8px] font-black uppercase text-zinc-450 tracking-wider">Bk</span>
                          <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded text-[8px] font-black uppercase text-zinc-450 tracking-wider">Ng</span>
                        </div>
                      </button>
                    </div>

                    {/* Option 3: Cash on Delivery */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "applepay"
                        ? "border-blue-600 bg-white dark:bg-zinc-950"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("applepay")}
                        className="w-full flex items-center justify-between p-5 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <svg className="h-5.5 w-5.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">Cash on Delivery</span>
                        </div>
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: Review Order */}
              {activeStep === "review" && (
                <div className="space-y-6">
                  
                  {/* Header Title */}
                  <div>
                    <h2 className="text-2xl font-black text-zinc-955 dark:text-white">
                      Review Your Order
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5">
                      Please confirm your details before placing the order.
                    </p>
                  </div>

                  {/* Estimated Delivery Banner */}
                  <div className="flex items-center gap-4 rounded-2xl bg-blue-50/80 border border-blue-100 p-4 dark:bg-blue-955/10 dark:border-blue-900/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">Estimated Delivery</span>
                      <span className="text-xs text-zinc-500 font-bold mt-0.5">
                        {deliveryMethod === "standard" ? "Arriving by Thursday, October 26" : "Arriving Tomorrow"}
                      </span>
                    </div>
                  </div>

                  {/* Shipping and Payment cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Shipping Address */}
                    <div className="rounded-2xl border border-zinc-150 p-4 dark:border-zinc-850 bg-white">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          <span>Shipping Address</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveStep("shipping")}
                          className="text-xs font-extrabold text-blue-600 hover:text-blue-500 dark:text-blue-450 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs text-zinc-655 dark:text-zinc-455 leading-relaxed font-bold space-y-0.5">
                        <p className="text-zinc-900 dark:text-white font-extrabold">{fullName}</p>
                        <p>{addressLine1}</p>
                        {addressLine2 && <p>{addressLine2}</p>}
                        <p>{city}, {state} {zipCode}</p>
                        <p>United States</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="rounded-2xl border border-zinc-150 p-4 dark:border-zinc-855 bg-white">
                      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-5.25-6h18A2.25 2.25 0 0122.5 12v5.25A2.25 2.25 0 0120.25 19.5H3.75A2.25 2.25 0 011.5 17.25V12a2.25 2.25 0 012.25-2.25z" />
                          </svg>
                          <span>Payment Method</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveStep("payment")}
                          className="text-xs font-extrabold text-blue-600 hover:text-blue-500 dark:text-blue-450 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs text-zinc-650 dark:text-zinc-450 leading-relaxed font-bold space-y-2">
                        {paymentMethod === "card" ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[9px] font-black uppercase text-zinc-500 tracking-wider">Visa</span>
                            <span className="text-zinc-900 dark:text-white font-extrabold">Visa ending in 4242</span>
                          </div>
                        ) : (
                          <p className="text-zinc-900 dark:text-white font-extrabold capitalize">{paymentMethod === "paypal" ? "Digital Wallets (SSLCommerz)" : "Cash on Delivery"}</p>
                        )}
                        <p className="text-[10px] text-zinc-450">Billing address matches shipping</p>
                      </div>
                    </div>

                  </div>

                  {/* Order Details */}
                  <div className="rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-white overflow-hidden">
                    <div className="border-b border-zinc-100 dark:border-zinc-900 p-4">
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Order Details</h3>
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      
                      <div className="p-4 flex gap-4">
                        <div className="relative h-16 w-16 rounded-xl border border-zinc-150 dark:border-zinc-850 overflow-hidden bg-zinc-50 shrink-0">
                          <Image
                            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
                            alt="Aura Pro Headphones"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">Aura Pro Noise-Canceling Headphones</span>
                            <span className="text-[10px] text-zinc-400 font-bold mt-1">Color: Matte Black</span>
                            <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Qty: 1</span>
                          </div>
                          <span className="text-xs font-black text-zinc-950 dark:text-white">$299.00</span>
                        </div>
                      </div>

                      <div className="p-4 flex gap-4">
                        <div className="relative h-16 w-16 rounded-xl border border-zinc-150 dark:border-zinc-850 overflow-hidden bg-zinc-50 shrink-0">
                          <Image
                            src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
                            alt="Artisan Ceramic Pour-Over Set"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">Artisan Ceramic Pour-Over Set</span>
                            <span className="text-[10px] text-zinc-400 font-bold mt-1">Material: Matte White Ceramic</span>
                            <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Qty: 1</span>
                          </div>
                          <span className="text-xs font-black text-zinc-955 dark:text-white">$85.00</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Promo Code Accordion */}
                  <div className="rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-white overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsPromoOpen(!isPromoOpen)}
                      className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-xs font-extrabold text-zinc-850 dark:text-zinc-200">
                        <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.72-4.72a1.5 1.5 0 000-2.122L10.49 3.659A2.25 2.25 0 008.902 3H9.57zM6 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                        <span>Add Gift Card or Promo Code</span>
                      </span>
                      <svg className={`h-4.5 w-4.5 text-zinc-450 transition-transform ${isPromoOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {isPromoOpen && (
                      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 flex gap-3 animate-fade-in">
                        <input
                          type="text"
                          placeholder="Enter code..."
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-250 bg-white text-xs outline-none dark:border-zinc-800 dark:bg-zinc-900 placeholder:text-zinc-400"
                        />
                        <button
                          type="button"
                          disabled={isValidatingCoupon}
                          onClick={async () => {
                            const code = promoCode.trim().toUpperCase();
                            if (!code) return;
                            try {
                              const result = await validateCoupon({ code }).unwrap();
                              if (result.success && result.data) {
                                setAppliedCoupon(result.data);
                                sessionStorage.setItem("appliedCoupon", JSON.stringify(result.data));
                                toast.success(`Promo code "${result.data.code}" applied!`);
                                setPromoCode("");
                              }
                            } catch (err: any) {
                              toast.error(err?.data?.message || "Invalid promo code");
                            }
                          }}
                          className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isValidatingCoupon ? "Applying..." : "Apply"}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Order Summary Card (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-955 shadow-xs">
                <h2 className="text-base font-extrabold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
                  Order Summary
                </h2>

                {/* Items list thumbnail ONLY in payment stage */}
                {activeStep === "payment" && (
                  <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3.5 mb-3.5 pt-2.5 space-y-3">
                    
                    {/* Item 1 */}
                    <div className="flex gap-3">
                      <div className="relative h-12 w-12 rounded-lg border border-zinc-150 overflow-hidden bg-zinc-50 shrink-0">
                        <Image
                          src="https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop"
                          alt="Minimalist Smart Speaker"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex justify-between text-xs leading-normal">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-900 dark:text-white">Minimalist Smart Speaker</span>
                          <span className="text-[10px] text-zinc-450 font-bold">Qty: 1</span>
                        </div>
                        <span className="font-black text-zinc-850 dark:text-zinc-200">$120.00</span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex gap-3">
                      <div className="relative h-12 w-12 rounded-lg border border-zinc-150 overflow-hidden bg-zinc-50 shrink-0">
                        <Image
                          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
                          alt="AeroRun Pro"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex justify-between text-xs leading-normal">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-900 dark:text-white">AeroRun Pro</span>
                          <span className="text-[10px] text-zinc-455 font-bold">Qty: 1</span>
                        </div>
                        <span className="font-black text-zinc-850 dark:text-zinc-200">$150.00</span>
                      </div>
                    </div>

                  </div>
                )}

                <div className="space-y-3.5 py-4 text-xs">
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-zinc-500 font-semibold">
                    <span>{getSubtotalLabel()}</span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">${subtotal.toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center text-zinc-500 font-semibold">
                    <span>Shipping</span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {getShippingCostDisplay()}
                    </span>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between items-center text-zinc-500 font-semibold">
                    <span>{getTaxLabel()}</span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">${tax.toFixed(2)}</span>
                  </div>

                  {/* Discount */}
                  {appliedCoupon && (
                    <div className="flex justify-between items-center text-green-600 font-bold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3.5 mt-2 flex justify-between items-baseline">
                    <span className="text-sm font-black text-zinc-950 dark:text-white">Total</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-450">${getGrandTotal().toFixed(2)}</span>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-xs font-black shadow-md shadow-blue-500/10 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    {activeStep === "shipping" && <span>Continue to Delivery</span>}
                    {activeStep === "delivery" && <span>Continue to Payment</span>}
                    {activeStep === "payment" && (
                      <span className="flex items-center gap-1.5">
                        <span>Continue to Review</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    )}
                    {activeStep === "review" && (
                      <span className="flex items-center gap-1.5">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                        </svg>
                        <span>Place Order</span>
                      </span>
                    )}
                  </button>

                  {activeStep !== "shipping" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeStep === "delivery") setActiveStep("shipping");
                        else if (activeStep === "payment") setActiveStep("delivery");
                        else if (activeStep === "review") setActiveStep("payment");
                      }}
                      className="w-full flex items-center justify-center gap-2 border border-zinc-250 bg-white hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300 rounded-xl py-3.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {activeStep === "delivery" && <span>Back to Shipping</span>}
                      {activeStep === "payment" && <span>Back to Delivery</span>}
                      {activeStep === "review" && <span>Back to Payment</span>}
                    </button>
                  )}
                </div>

                {/* Padlock Secure Transaction indicator */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-555 mt-6 select-none">
                  <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                  </svg>
                  <span>{activeStep === "payment" ? "Secure SSL Checkout" : "Secure Transaction"}</span>
                </div>

                {/* Agreement notice */}
                {activeStep === "review" && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-555 text-center leading-relaxed mt-4">
                    By placing your order, you agree to our{" "}
                    <Link href="#" className="underline text-blue-600 hover:text-blue-500">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="#" className="underline text-blue-600 hover:text-blue-500">Privacy Policy</Link>.
                  </p>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Footer bar */}
      <footer className="border-t border-zinc-150 bg-white px-6 py-6 dark:border-zinc-900 dark:bg-zinc-950 mt-12 text-[11px] font-bold text-zinc-400">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-zinc-800 dark:text-zinc-300">Aura Marketplace</span>
          <span>© 2024 Aura Marketplace. All transactions are secure and encrypted.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-zinc-700">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-700">Terms of Service</Link>
            <Link href="#" className="hover:text-zinc-700">Security Standards</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
