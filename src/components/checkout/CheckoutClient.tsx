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
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { useClearDbCartMutation } from "@/lib/features/api/cartApi";
import { useCreateOrderMutation } from "@/lib/features/api/orderApi";
import { useCreatePaymentIntentMutation } from "@/lib/features/api/paymentApi";

const generateUniqueId = () => Date.now();

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [clearDbCart] = useClearDbCartMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  // Current active step: 'shipping' | 'delivery' | 'payment' | 'review' | 'confirmation'
  const [activeStep, setActiveStep] = useState<"shipping" | "delivery" | "payment" | "review" | "confirmation">("shipping");

  // Shipping Address Form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addToAddressBook, setAddToAddressBook] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  // Delivery Method Selection
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");

  // Payment Form Selection: 'card' (Stripe) | 'cod' (Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bkash" | "cod">("card");
  const [saveBkashForFuture, setSaveBkashForFuture] = useState(false);

  const [savedCards, setSavedCards] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxe_saved_cards");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxe_saved_cards");
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = parsed.find((c: any) => c.isDefault);
        if (def) return def.id;
      }
    }
    return null;
  });

  const [cardNumber, setCardNumber] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxe_saved_cards");
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = parsed.find((c: any) => c.isDefault);
        if (def) return `4242 4242 4242 ${def.last4}`;
      }
    }
    return "";
  });

  const [cardExpiry, setCardExpiry] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxe_saved_cards");
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = parsed.find((c: any) => c.isDefault);
        if (def) return def.expiry;
      }
    }
    return "";
  });

  const [cardCvv, setCardCvv] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luxe_saved_cards");
      if (saved) {
        const parsed = JSON.parse(saved);
        const def = parsed.find((c: any) => c.isDefault);
        if (def) return "123";
      }
    }
    return "";
  });

  const [savedBkash, setSavedBkash] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const savedB = localStorage.getItem("luxe_saved_bkash");
      if (savedB) return JSON.parse(savedB);
    }
    return [];
  });

  const [selectedBkashId, setSelectedBkashId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const savedB = localStorage.getItem("luxe_saved_bkash");
      if (savedB) {
        const parsed = JSON.parse(savedB);
        if (parsed.length > 0) return parsed[0].id;
      }
    }
    return null;
  });

  const [bkashNumber, setBkashNumber] = useState(() => {
    if (typeof window !== "undefined") {
      const savedB = localStorage.getItem("luxe_saved_bkash");
      if (savedB) {
        const parsed = JSON.parse(savedB);
        if (parsed.length > 0) return parsed[0].number;
      }
    }
    return "";
  });

  const handleSelectSavedCard = (card: any) => {
    setSelectedSavedCardId(card.id);
    setCardNumber(`4242 4242 4242 ${card.last4}`);
    setCardExpiry(card.expiry);
    setCardCvv("123");
  };

  const handleSelectBkash = (account: any) => {
    setSelectedBkashId(account.id);
    setBkashNumber(account.number);
  };

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const limited = clean.slice(0, 16);
    const parts = [];
    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = "";
    if (clean.length > 0) {
      const month = clean.slice(0, 2);
      formatted += month;
      if (clean.length > 2) {
        const year = clean.slice(2, 6);
        formatted += "/" + year;
      } else if (month.length === 2 && !val.endsWith("/")) {
        formatted += "/";
      }
    }
    setCardExpiry(formatted);
  };

  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setCardCvv(clean);
  };

  const [saveCardForFuture, setSaveCardForFuture] = useState(false);


  // Accordion state
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; type: string; value: string } | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [orderedItems, setOrderedItems] = useState<any[]>([]);
  const [confirmedDetails, setConfirmedDetails] = useState<{
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
    deliveryMethod: string;
    estimatedDelivery: string;
    paymentMethod: string;
    couponCode?: string;
    items: any[];
    shippingAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
    };
  } | null>(null);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeSuccess, setStripeSuccess] = useState(false);

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

  useEffect(() => {
    const loadDefaultAddress = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
        const res = await fetch(`${baseUrl}/addresses`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setSavedAddresses(data.data);
          const defaultAddr = data.data.find((addr: any) => addr.isDefault);
          if (defaultAddr) {
            setFullName(defaultAddr.fullName || "");
            setPhone(defaultAddr.phone || "");
            setAddressLine1(defaultAddr.addressLine1 || "");
            setAddressLine2(defaultAddr.addressLine2 || "");
            setCity(defaultAddr.city || "");
            setState(defaultAddr.state || "");
            setZipCode(defaultAddr.zipCode || "");
          } else if (data.data.length > 0) {
            // Select first address if none is default
            const firstAddr = data.data[0];
            setFullName(firstAddr.fullName || "");
            setPhone(firstAddr.phone || "");
            setAddressLine1(firstAddr.addressLine1 || "");
            setAddressLine2(firstAddr.addressLine2 || "");
            setCity(firstAddr.city || "");
            setState(firstAddr.state || "");
            setZipCode(firstAddr.zipCode || "");
          }
        }
      } catch (err) {
        console.error("Failed to load default address:", err);
      }
    };

    if (isAuthenticated) {
      loadDefaultAddress();
    }
  }, [isAuthenticated]);

  // Calculations: Dynamic based on cart items!
  const isPaymentStage = activeStep === "payment";
  const isReviewStage = activeStep === "review";
  const isConfirmStage = activeStep === "confirmation";

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.08;

  const subtotal = isConfirmStage && createdOrder ? (createdOrder.total / 1.08) : cartSubtotal;
  const tax = isConfirmStage && createdOrder ? (createdOrder.total - subtotal) : cartTax;

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
    
    switch (deliveryMethod) {
      case "express":
        return 25.00;
      default:
        return 0.00;
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

  const getEstimatedDeliveryRange = (selectedState: string) => {
    const today = new Date();
    let startDays = 5;
    let endDays = 7;
    if (selectedState && selectedState.toLowerCase() === "dhaka") {
      startDays = 2;
      endDays = 3;
    }
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + startDays);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + endDays);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const startStr = startDate.toLocaleDateString("en-US", options);
    const endStr = endDate.toLocaleDateString("en-US", options);
    const yearStr = endDate.getFullYear();
    return `${startStr} - ${endStr}, ${yearStr}`;
  };

  const getSubtotalLabel = () => {
    if (activeStep === "review") return `Items (${cartItems.length})`;
    if (activeStep === "payment") return "Subtotal";
    return `Subtotal (${cartItems.length} items)`;
  };

  const getTaxLabel = () => {
    if (activeStep === "payment") return "Tax (8%)";
    if (activeStep === "delivery") return "Taxes";
    return "Estimated Tax";
  };

  const submitOrder = async () => {
    try {
      const orderPayload = {
        customerName: fullName,
        customerEmail: user?.email || "guest@luxe.com",
        total: getGrandTotal(),
        paymentStatus: paymentMethod === "card" || paymentMethod === "bkash" ? "Paid" : "Pending",
        fulfillmentStatus: "Processing",
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        estimatedDelivery: deliveryMethod === "express" ? "1-2 Days (Express)" : getEstimatedDeliveryRange(state),
        phone: phone,
        addressLine1: addressLine1,
        addressLine2: addressLine2 || null,
        city: city,
        state: state,
        zipCode: zipCode,
        couponCode: appliedCoupon?.code || null,
        items: cartItems.map((item) => ({
          id: item.id || item?.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          specsText: item.specsText || null,
          image: item.image,
        })),
      };
      const orderResult = await createOrder(orderPayload).unwrap();

      if (orderResult.success && orderResult.data) {
        if (addToAddressBook && isAuthenticated) {
          try {
            const token = localStorage.getItem("accessToken");
            if (token) {
              const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
              await fetch(`${baseUrl}/addresses`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                  fullName: fullName,
                  phone: phone,
                  addressLine1: addressLine1,
                  addressLine2: addressLine2 || null,
                  city: city,
                  state: state,
                  zipCode: zipCode,
                  isDefault: false,
                  addressType: "Shipping",
                }),
              });
            }
          } catch (addrErr) {
            console.error("Failed to auto-save address to book:", addrErr);
          }
        }

        // Capture detailed confirmation values before clearing cart and coupon state
        const summarySubtotal = cartSubtotal;
        const summaryTax = cartTax;
        const summaryShipping = typeof getShippingCost() === "number" ? (getShippingCost() as number) : 0;
        const summaryDiscount = discountAmount;
        const summaryTotal = getGrandTotal();

        setConfirmedDetails({
          subtotal: summarySubtotal,
          shippingCost: summaryShipping,
          tax: summaryTax,
          discount: summaryDiscount,
          total: summaryTotal,
          deliveryMethod: deliveryMethod,
          estimatedDelivery: deliveryMethod === "express" ? "1-2 Days (Express)" : getEstimatedDeliveryRange(state),
          paymentMethod: paymentMethod,
          couponCode: appliedCoupon?.code,
          items: cartItems.map((item) => ({ ...item })),
          shippingAddress: {
            fullName,
            phone,
            addressLine1,
            addressLine2: addressLine2 || undefined,
            city,
            state,
            zipCode,
          },
        });

        setOrderedItems(cartItems);
        setCreatedOrder(orderResult.data);
        dispatch(clearCart());
        if (isAuthenticated) {
          try {
            await clearDbCart().unwrap();
          } catch (cartClearErr) {
            console.error("Failed to clear DB cart:", cartClearErr);
          }
        }
        sessionStorage.removeItem("appliedCoupon");
        
        if (paymentMethod === "card" && saveCardForFuture && !selectedSavedCardId) {
          const cleanNum = cardNumber.replace(/\s/g, "");
          const brand = cleanNum.startsWith("4") ? "Visa" : "Mastercard";
          const newCard = {
            id: generateUniqueId(),
            brand,
            last4: cleanNum.slice(-4),
            isDefault: savedCards.length === 0,
            expiry: cardExpiry,
          };
          const updatedCards = [...savedCards, newCard];
          localStorage.setItem("luxe_saved_cards", JSON.stringify(updatedCards));
          setSavedCards(updatedCards);
          setSelectedSavedCardId(newCard.id);
        }

        if (paymentMethod === "bkash" && saveBkashForFuture && !selectedBkashId) {
          const cleanNum = bkashNumber.replace(/\D/g, "");
          const formatted = cleanNum.startsWith("0") ? `+880 ${cleanNum.slice(1, 4)}XX XXXX ${cleanNum.slice(-2)}` : cleanNum;
          const newBkash = {
            id: generateUniqueId(),
            number: formatted,
            isVerified: true,
          };
          const updatedBkash = [...savedBkash, newBkash];
          localStorage.setItem("luxe_saved_bkash", JSON.stringify(updatedBkash));
          setSavedBkash(updatedBkash);
          setSelectedBkashId(newBkash.id);
        }

        toast.success("Order Placed Successfully!");
        setActiveStep("confirmation");
        return true;
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to place order. Please try again.");
      console.error("Order placement failure:", err);
    }
    return false;
  };

  const handleNextStep = async () => {
    if (activeStep === "shipping") {
      if (!fullName || !phone || !addressLine1 || !city || !state || !zipCode) {
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
      if (paymentMethod === "bkash" && !bkashNumber) {
        toast.error("Please fill in bKash mobile details!");
        return;
      }
      setActiveStep("review");
    } else if (activeStep === "review") {
      if (paymentMethod === "card") {
        setShowStripeModal(true);
      } else {
        await submitOrder();
      }
    }
  };

  const handleBackToStep = (step: "shipping" | "delivery" | "payment" | "review" | "confirmation") => {
    const stepOrder = ["shipping", "delivery", "payment", "review", "confirmation"];
    const targetIndex = stepOrder.indexOf(step);
    const currentIndex = stepOrder.indexOf(activeStep);
    
    if (targetIndex < currentIndex) {
      setActiveStep(step);
      return;
    }
    
    if (targetIndex > 0 && (!fullName || !phone || !addressLine1 || !city || !state || !zipCode)) {
      toast.error("Please complete the Shipping Address first!");
      return;
    }
    if (targetIndex > 1 && !deliveryMethod) {
      toast.error("Please choose a Delivery Method first!");
      return;
    }
    if (targetIndex > 2 && paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) {
      toast.error("Please complete Credit Card payment details first!");
      return;
    }
    if (step === "confirmation") return;
    
    setActiveStep(step);
  };

  // RENDER FOR ORDER CONFIRMATION SUCCESS PAGE
  if (activeStep === "confirmation") {
    // Fallbacks if confirmedDetails is not set yet
    const displaySubtotal = confirmedDetails ? confirmedDetails.subtotal : (createdOrder ? (createdOrder.total / 1.08) : 0);
    const displayTax = confirmedDetails ? confirmedDetails.tax : (createdOrder ? (createdOrder.total - displaySubtotal) : 0);
    const displayShipping = confirmedDetails ? confirmedDetails.shippingCost : 0;
    const displayDiscount = confirmedDetails ? confirmedDetails.discount : 0;
    const displayTotal = confirmedDetails ? confirmedDetails.total : (createdOrder ? createdOrder.total : 0);
    const displayItems = confirmedDetails ? confirmedDetails.items : (createdOrder?.items ? (createdOrder.items as any[]) : orderedItems);
    const displayAddress = confirmedDetails?.shippingAddress || {
      fullName: fullName || createdOrder?.customerName || "Customer",
      phone: phone || createdOrder?.phone || "",
      addressLine1: addressLine1 || createdOrder?.addressLine1 || "",
      addressLine2: addressLine2 || createdOrder?.addressLine2 || "",
      city: city || createdOrder?.city || "",
      state: state || createdOrder?.state || "",
      zipCode: zipCode || createdOrder?.zipCode || "",
    };
    const displayPaymentMethod = confirmedDetails ? confirmedDetails.paymentMethod : (createdOrder ? createdOrder.paymentMethod : paymentMethod);
    const displayDeliveryRange = confirmedDetails ? confirmedDetails.estimatedDelivery : (createdOrder ? "3-5 Days" : getEstimatedDeliveryRange(state));

    return (
      <div className="bg-zinc-50/50 dark:bg-zinc-950/20 transition-colors duration-300 min-h-screen flex flex-col justify-between animate-fade-in">
        
        {/* Top Header Bar */}
        <div>
          <header className="border-b border-zinc-150 bg-white px-6 py-4 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
            <div className="mx-auto max-w-7xl flex items-center justify-between relative">
              <Link href="/" className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5 select-none">
                <span className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">A</span>
                <span>Aura Marketplace</span>
              </Link>
              <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-900 px-3 py-1 rounded-full select-none">
                Secure Session
              </span>
            </div>
          </header>

          {/* Main Success Container */}
          <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            
            {/* Header Greeting Banner */}
            <div className="flex flex-col items-center text-center mb-10">
              {/* Pulse Animated Circle */}
              <div className="relative mb-6 flex items-center justify-center">
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-400 dark:bg-emerald-600 opacity-20 animate-ping"></span>
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-up">
                  <svg className="h-10 w-10 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold max-w-md mt-3 leading-relaxed">
                Thank you for your purchase. Your payment was processed successfully, and we have sent a confirmation email to <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{createdOrder?.customerEmail || user?.email || "your inbox"}</span>.
              </p>

              {/* Order ID Badge Copy Box */}
              <div className="mt-5 flex items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 px-4 py-2 rounded-2xl shadow-xs">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Order ID:</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">{createdOrder?.orderId || "#AUR-PLACEHOLDER"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdOrder?.orderId || "");
                    toast.success("Order ID copied to clipboard!");
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                  title="Copy Order ID"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.375c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125H7.875a1.125 1.125 0 01-1.125-1.125V7.375z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Grid container: 2 columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Receipt and Customer details (span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Ordered Items List */}
                <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
                  <h3 className="text-base font-extrabold text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span>Items Purchased</span>
                  </h3>

                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {displayItems && displayItems.length > 0 ? (
                      displayItems.map((item, idx) => (
                        <div key={idx} className="flex gap-4 py-3 border-b border-zinc-100 dark:border-zinc-900/50 last:border-b-0">
                          <div className="relative h-16 w-16 rounded-xl border border-zinc-150 dark:border-zinc-850 overflow-hidden bg-zinc-50 dark:bg-zinc-900 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 flex justify-between items-start text-xs leading-normal">
                            <div className="flex flex-col pr-2">
                              <span className="font-extrabold text-zinc-900 dark:text-white text-sm line-clamp-1">{item.name}</span>
                              <span className="text-[10px] text-zinc-400 font-bold mt-1 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md w-max">
                                {item.specsText || "Standard Edition"}
                              </span>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1 shrink-0">
                              <span className="font-black text-zinc-950 dark:text-white text-sm">${item.price.toFixed(2)}</span>
                              <span className="text-[10px] text-zinc-400 font-bold">Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-450 text-xs font-bold py-6 text-center">No items loaded.</div>
                    )}
                  </div>
                </div>

                {/* Customer / Payment / Address Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Shipping Address Box */}
                  <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3.5 flex items-center gap-1.5">
                      <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25z" />
                      </svg>
                      <span>Shipping Address</span>
                    </h4>
                    <div className="text-xs space-y-1 font-bold text-zinc-700 dark:text-zinc-300">
                      <p className="text-zinc-950 dark:text-white font-extrabold text-sm">{displayAddress.fullName}</p>
                      <p>{displayAddress.addressLine1}</p>
                      {displayAddress.addressLine2 && <p>{displayAddress.addressLine2}</p>}
                      <p>{displayAddress.city}, {displayAddress.state} {displayAddress.zipCode}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 01-7.108-7.108c-.155-.44.01-1.025.387-1.31l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span>{displayAddress.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Info Box */}
                  <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3.5 flex items-center gap-1.5">
                      <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 5.25h6m-6 2.25h3m-3.75-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V14" />
                      </svg>
                      <span>Payment & Invoicing</span>
                    </h4>
                    <div className="text-xs space-y-2 font-bold text-zinc-700 dark:text-zinc-300">
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-0.5">Method</span>
                        <div className="flex items-center gap-2">
                          {displayPaymentMethod === "card" && (
                            <>
                              <span className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded text-[10px] font-black uppercase text-blue-600">Card (Stripe)</span>
                              <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold">
                                {cardNumber ? `Visa ending in ${cardNumber.replace(/\s/g, "").slice(-4)}` : "Credit/Debit Card"}
                              </span>
                            </>
                          )}
                          {displayPaymentMethod === "bkash" && (
                            <>
                              <span className="bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900 px-2 py-0.5 rounded text-[10px] font-black uppercase text-pink-600">bKash</span>
                              <span className="text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold">{bkashNumber || "Mobile Wallet"}</span>
                            </>
                          )}
                          {displayPaymentMethod === "cod" && (
                            <span className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 px-2 py-0.5 rounded text-[10px] font-black uppercase text-orange-600">Cash on Delivery</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-0.5">Status</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          createdOrder?.paymentStatus === "Paid" || displayPaymentMethod === "card" || displayPaymentMethod === "bkash"
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-100 dark:border-emerald-900"
                            : "bg-amber-50 dark:bg-amber-950/15 text-amber-600 border border-amber-100 dark:border-amber-900"
                        }`}>
                          {createdOrder?.paymentStatus || (displayPaymentMethod === "card" || displayPaymentMethod === "bkash" ? "Paid" : "Pending")}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: Order timeline and Pricing breakdown (span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Live Order Tracker */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
                  <h3 className="text-base font-extrabold text-zinc-950 dark:text-white mb-5 flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Delivery Estimation & Progress</span>
                  </h3>

                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-900 p-4 rounded-2xl flex items-center gap-3.5 mb-6">
                    <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/15 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-xs font-bold leading-tight">
                      <span className="text-zinc-400 text-[10px] uppercase tracking-wider block mb-0.5">Estimated Arrival</span>
                      <span className="text-zinc-950 dark:text-white text-sm font-extrabold">{displayDeliveryRange}</span>
                    </div>
                  </div>

                  {/* Visual Tracker Timeline */}
                  <div className="relative pl-6 space-y-6">
                    {/* Verticle Connecting Line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800"></div>

                    {/* Step 1: Placed */}
                    <div className="relative flex gap-3 text-xs leading-normal">
                      <div className="absolute -left-6.5 mt-0.5 h-5 w-5 rounded-full border border-emerald-500 bg-white dark:bg-zinc-950 flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-500/10">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-zinc-950 dark:text-white">Order Placed</span>
                        <span className="text-[10px] text-zinc-400 font-medium">Successfully processed</span>
                      </div>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="relative flex gap-3 text-xs leading-normal">
                      <div className="absolute -left-6.5 mt-0.5 h-5 w-5 rounded-full border-2 border-blue-600 bg-white dark:bg-zinc-950 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 bg-blue-600 rounded-full animate-ping"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-zinc-950 dark:text-white">Processing</span>
                        <span className="text-[10px] text-zinc-500 font-semibold dark:text-zinc-400">Preparing package at warehouse</span>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="relative flex gap-3 text-xs leading-normal opacity-50">
                      <div className="absolute -left-6.5 mt-0.5 h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-500 dark:text-zinc-400">Shipped</span>
                        <span className="text-[10px] text-zinc-400">Not started yet</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Summary Receipt */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-850 dark:bg-zinc-950 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-zinc-950 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                    <span>Receipt Summary</span>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide">
                      Invoice details
                    </span>
                  </h3>

                  <div className="space-y-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">${displaySubtotal.toFixed(2)}</span>
                    </div>

                    {/* Shipping Row */}
                    <div className="flex justify-between items-center">
                      <span>Shipping</span>
                      <span className="text-zinc-850 dark:text-zinc-200 font-extrabold">
                        {displayShipping === 0 ? "Free" : `$${displayShipping.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Tax Row */}
                    <div className="flex justify-between items-center">
                      <span>Tax (8%)</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">${displayTax.toFixed(2)}</span>
                    </div>

                    {/* Coupon Discount Row if > 0 */}
                    {displayDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-500 font-bold bg-emerald-50/50 dark:bg-emerald-950/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l5.178-5.178a2.25 2.25 0 000-3.182l-9.581-9.581A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                          <span>Discount {confirmedDetails?.couponCode ? `(${confirmedDetails.couponCode})` : ""}</span>
                        </span>
                        <span>- ${displayDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Grand Total */}
                    <div className="border-t border-zinc-150 dark:border-zinc-900 pt-4 mt-2 flex justify-between items-baseline bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-2xl">
                      <span className="text-sm font-black text-zinc-950 dark:text-white">Amount Paid</span>
                      <span className="text-xl font-black text-blue-600 dark:text-blue-450">${displayTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions inside card */}
                  <div className="pt-2 flex flex-col gap-3">
                    {/* Invoice Download */}
                    <button
                      type="button"
                      onClick={() => {
                        if (createdOrder?.id) {
                          const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
                          const downloadUrl = `${baseUrl}/orders/${createdOrder.id}/invoice/download`;
                          
                          toast.success("Downloading invoice...");
                          
                          const link = document.createElement("a");
                          link.href = downloadUrl;
                          link.setAttribute("download", `invoice-${createdOrder.orderId || "order"}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } else {
                          toast.error("Order details not found. Cannot download invoice.");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-xl py-3 text-xs font-black shadow-md transition-all cursor-pointer select-none"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      <span>Download PDF Invoice</span>
                    </button>

                    {/* Continue Shopping button */}
                    <button
                      type="button"
                      onClick={() => router.push("/collections")}
                      className="w-full flex items-center justify-center gap-2 border border-zinc-250 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>Continue Shopping</span>
                    </button>
                  </div>
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

  // RENDER FOR NORMAL MULTI-STEP CHECKOUT
  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950/20 transition-colors duration-300 min-h-screen flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <div>
        <header className="border-b border-zinc-150 bg-white px-6 py-4 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
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
                    <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                      Shipping Address
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Please enter the details where you'd like your order delivered.
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-400">
                        Choose from Saved Addresses
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            const selected = savedAddresses.find((addr) => addr.id === e.target.value);
                            if (selected) {
                              setFullName(selected.fullName || "");
                              setPhone(selected.phone || "");
                              setAddressLine1(selected.addressLine1 || "");
                              setAddressLine2(selected.addressLine2 || "");
                              setCity(selected.city || "");
                              setState(selected.state || "");
                              setZipCode(selected.zipCode || "");
                            } else {
                              setFullName("");
                              setPhone("");
                              setAddressLine1("");
                              setAddressLine2("");
                              setCity("");
                              setState("");
                              setZipCode("");
                            }
                          }}
                          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-bold text-xs text-zinc-700 dark:text-zinc-300 appearance-none focus:outline-none cursor-pointer pr-10"
                        >
                          {savedAddresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.fullName} — {addr.addressLine1}, {addr.city} ({addr.addressType}{addr.isDefault ? " - Default" : ""})
                            </option>
                          ))}
                          <option value="">+ Enter a new address</option>
                        </select>
                        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  )}

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
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                        />
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Division / State
                        </label>
                        <div className="relative">
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
                          >
                            <option value="">Select Division</option>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Sylhet">Sylhet</option>
                            <option value="Rajshahi">Rajshahi</option>
                            <option value="Khulna">Khulna</option>
                            <option value="Barisal">Barisal</option>
                            <option value="Rangpur">Rangpur</option>
                            <option value="Mymensingh">Mymensingh</option>
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>

                      {/* Zip Code */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
                        />
                      </div>
                    </div>

                    {/* Add to address book checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addToAddressBook}
                          onChange={(e) => setAddToAddressBook(e.target.checked)}
                          className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
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
                    <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
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
                        ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/5"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
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
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold mt-0.5 block">3-5 business days</span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
                        <span className="text-sm font-black text-zinc-950 dark:text-white">Free</span>
                        <span className="text-[9px] font-bold text-zinc-400">Est. Arrival: {getEstimatedDeliveryRange(state)}</span>
                      </div>
                    </label>

                    {/* Express Delivery */}
                    <label className={`flex flex-col border rounded-3xl p-5 cursor-pointer transition-all relative ${
                      deliveryMethod === "express"
                        ? "border-blue-600 bg-blue-50/10 dark:bg-blue-950/5"
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
                        <span className="text-sm font-black text-zinc-950 dark:text-white">$25.00</span>
                        <span className="text-[9px] font-bold text-zinc-400">Est. Arrival: Tomorrow</span>
                      </div>
                    </label>

                  </div>
                </div>
              )}

              {activeStep === "payment" && (
                <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs min-h-[380px] space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Payment Method
                    </h2>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Option 1: Credit/Debit Card (Stripe) */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-white dark:bg-zinc-950"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
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
                          <span className="text-xs font-black text-zinc-900 dark:text-white">Credit/Debit Card (Stripe)</span>
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
                          
                          {/* Saved Cards List Option */}
                          {savedCards.length > 0 && (
                            <div className="space-y-2 mb-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                Saved Payment Cards
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                {savedCards.map((card) => (
                                  <button
                                    key={card.id}
                                    type="button"
                                    onClick={() => handleSelectSavedCard(card)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer text-left transition-all ${
                                      selectedSavedCardId === card.id
                                        ? "border-blue-600 bg-blue-50/5 dark:bg-blue-900/5"
                                        : "border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950/20"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-6 w-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-[9px] font-black italic text-zinc-500">
                                        {card.brand === "Visa" ? "VISA" : "MC"}
                                      </div>
                                      <div>
                                        <p className="text-zinc-800 dark:text-white font-black">
                                          {card.brand} ending in {card.last4}
                                        </p>
                                        <span className="text-[10px] text-zinc-400 block">Expires {card.expiry}</span>
                                      </div>
                                    </div>
                                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                      selectedSavedCardId === card.id
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-zinc-300 dark:border-zinc-700"
                                    }`}>
                                      {selectedSavedCardId === card.id && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSavedCardId(null);
                                    setCardNumber("");
                                    setCardExpiry("");
                                    setCardCvv("");
                                  }}
                                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer text-left transition-all ${
                                    selectedSavedCardId === null
                                      ? "border-blue-600 bg-blue-50/5 dark:bg-blue-900/5"
                                      : "border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-6 w-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-xs font-black text-zinc-500">
                                      +
                                    </div>
                                    <p className="text-zinc-800 dark:text-white font-black">Use another card</p>
                                  </div>
                                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                    selectedSavedCardId === null
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-zinc-300 dark:border-zinc-700"
                                  }`}>
                                    {selectedSavedCardId === null && (
                                      <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}

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
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                readOnly={selectedSavedCardId !== null}
                                className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all read-only:opacity-80"
                              />
                              <div className="absolute inset-y-0 right-3.5 flex items-center gap-1.5">
                                <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-zinc-400">VI</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-zinc-400">MC</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                Expiry Date (MM/YY)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                  <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => handleExpiryChange(e.target.value)}
                                  readOnly={selectedSavedCardId !== null}
                                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all read-only:opacity-80"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                                CVC
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                                  <svg className="h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  required
                                  placeholder="CVC"
                                  value={cardCvv}
                                  onChange={(e) => handleCvcChange(e.target.value)}
                                  readOnly={selectedSavedCardId !== null}
                                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all read-only:opacity-80"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-1.5">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={saveCardForFuture}
                                onChange={(e) => setSaveCardForFuture(e.target.checked)}
                                className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                              />
                              <span>Save this card for future purchases</span>
                            </label>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-2">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
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

                    {/* Option 2: bKash (Mobile Banking) */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "bkash"
                        ? "border-blue-600 bg-white dark:bg-zinc-950"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bkash")}
                        className="w-full flex items-center justify-between p-5 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="h-5.5 w-10 bg-pink-600 rounded flex items-center justify-center text-[7px] font-black text-white shrink-0">bKash</div>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">Mobile Banking (bKash)</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentMethod === "bkash"}
                          onChange={() => setPaymentMethod("bkash")}
                          className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </button>
                      {paymentMethod === "bkash" && (
                        <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-900 pt-5 space-y-4 animate-fade-in">
                          {savedBkash.length > 0 && (
                            <div className="space-y-2 mb-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                Saved bKash Accounts
                              </label>
                              <div className="grid grid-cols-1 gap-2">
                                {savedBkash.map((acc) => (
                                  <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => handleSelectBkash(acc)}
                                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer text-left transition-all ${
                                      selectedBkashId === acc.id
                                        ? "border-blue-600 bg-blue-50/5 dark:bg-blue-900/5"
                                        : "border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950/20"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-6 w-10 bg-pink-50 dark:bg-pink-950 border border-pink-100 dark:border-pink-900 rounded flex items-center justify-center text-[8px] font-black text-pink-600">
                                        BKASH
                                      </div>
                                      <div>
                                        <p className="text-zinc-800 dark:text-white font-black">
                                          {acc.number}
                                        </p>
                                        <span className="text-[10px] text-zinc-400 block">Verified Account</span>
                                      </div>
                                    </div>
                                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                      selectedBkashId === acc.id
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-zinc-300 dark:border-zinc-700"
                                    }`}>
                                      {selectedBkashId === acc.id && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBkashId(null);
                                    setBkashNumber("");
                                  }}
                                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer text-left transition-all ${
                                    selectedBkashId === null
                                      ? "border-blue-600 bg-blue-50/5 dark:bg-blue-900/5"
                                      : "border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-6 w-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded flex items-center justify-center text-xs font-black text-zinc-500">
                                      +
                                    </div>
                                    <p className="text-zinc-800 dark:text-white font-black">Use another bKash number</p>
                                  </div>
                                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                                    selectedBkashId === null
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-zinc-300 dark:border-zinc-700"
                                  }`}>
                                    {selectedBkashId === null && (
                                      <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                              bKash Mobile Number
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 017XXXXXXXX"
                              value={bkashNumber}
                              onChange={(e) => setBkashNumber(e.target.value)}
                              readOnly={selectedBkashId !== null}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all read-only:opacity-80"
                            />
                          </div>

                          <div className="pt-1.5">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={saveBkashForFuture}
                                onChange={(e) => setSaveBkashForFuture(e.target.checked)}
                                disabled={selectedBkashId !== null}
                                className="h-4.5 w-4.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950 disabled:opacity-50"
                              />
                              <span>Save this bKash account for future purchases</span>
                            </label>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Option 3: Cash on Delivery */}
                    <div className={`border rounded-3xl overflow-hidden transition-all ${
                      paymentMethod === "cod"
                        ? "border-blue-600 bg-white dark:bg-zinc-950"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                    }`}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className="w-full flex items-center justify-between p-5 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <svg className="h-5.5 w-5.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                          </svg>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">Cash on Delivery (COD)</span>
                        </div>
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4.5 w-4.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
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
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                      Review Your Order
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1.5">
                      Please confirm your details before placing the order.
                    </p>
                  </div>

                  {/* Estimated Delivery Banner */}
                  <div className="flex items-center gap-4 rounded-2xl bg-blue-50/80 border border-blue-100 p-4 dark:bg-blue-950/10 dark:border-blue-900/30">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V11.25M3 14.25h15m0 0V11.25m0 0h1.875c.621 0 1.125-.504 1.125-1.125V6.75H13.5v4.5M3.75 6.75h9.75M3 14.25v-7.5" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-900 dark:text-white">Estimated Delivery</span>
                      <span className="text-xs text-zinc-500 font-bold mt-0.5">
                        {deliveryMethod === "express" ? "Arriving in 1-2 Days (Express)" : `Arriving ${getEstimatedDeliveryRange(state)}`}
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
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-bold space-y-0.5">
                        <p className="text-zinc-900 dark:text-white font-extrabold">{fullName}</p>
                        <p>{addressLine1}</p>
                        {addressLine2 && <p>{addressLine2}</p>}
                        <p>{city}, {state} {zipCode}</p>
                        <p>Bangladesh</p>
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
                      <div className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-bold space-y-2">
                        {paymentMethod === "card" ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[9px] font-black uppercase text-zinc-500 tracking-wider">
                              {cardNumber.replace(/\s/g, "").startsWith("5") ? "Mastercard" : "Visa"}
                            </span>
                            <span className="text-zinc-900 dark:text-white font-extrabold">
                              Card ending in {cardNumber ? cardNumber.slice(-4) : "4242"}
                            </span>
                          </div>
                        ) : paymentMethod === "bkash" ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-pink-50 dark:bg-pink-950 border border-pink-100 dark:border-pink-900 px-2 py-0.5 rounded text-[9px] font-black uppercase text-pink-600 tracking-wider">bKash</span>
                            <span className="text-zinc-900 dark:text-white font-extrabold">
                              bKash: {bkashNumber || "Not Linked"}
                            </span>
                          </div>
                        ) : (
                          <p className="text-zinc-900 dark:text-white font-extrabold">Cash on Delivery (COD)</p>
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
                      
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="p-4 flex gap-4">
                          <div className="relative h-16 w-16 rounded-xl border border-zinc-150 dark:border-zinc-850 overflow-hidden bg-zinc-50 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 flex justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{item.name}</span>
                              <span className="text-[10px] text-zinc-400 font-bold mt-1">{item.specsText}</span>
                              <span className="text-[10px] text-zinc-400 font-bold mt-0.5">Qty: {item.quantity}</span>
                            </div>
                            <span className="text-xs font-black text-zinc-950 dark:text-white">${item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}

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
                              const result = await validateCoupon({ code, email: user?.email || undefined }).unwrap();
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
              <div className="rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-900 dark:bg-zinc-950 shadow-xs">
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
                          <span className="text-[10px] text-zinc-400 font-bold">Qty: 1</span>
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
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mt-6 select-none">
                  <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                  </svg>
                  <span>{activeStep === "payment" ? "Secure SSL Checkout" : "Secure Transaction"}</span>
                </div>

                {/* Agreement notice */}
                {activeStep === "review" && (
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed mt-4">
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

      {/* Stripe Payment Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-150 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-2xl space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                if (!stripeProcessing) {
                  setShowStripeModal(false);
                  setStripeSuccess(false);
                }
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 cursor-pointer"
              disabled={stripeProcessing}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2 mt-2">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/15 flex items-center justify-center text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">Stripe Secure Checkout</h3>
              <p className="text-xs text-zinc-450">Pay securely with Credit or Debit card via Stripe</p>
            </div>

            {/* Content: Form fields or processing state */}
            <div className="space-y-4 pt-1">
              
              {/* Order total info */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-150 dark:border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-500">Amount to Pay</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-450">${getGrandTotal().toFixed(2)}</span>
              </div>

              {stripeProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  {stripeSuccess ? (
                    <>
                      <div className="h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-up">
                        <svg className="h-7 w-7 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-500">Payment Authorized!</p>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-zinc-500 font-bold animate-pulse">Contacting card issuer & processing...</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450 mb-1">Card Number</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      value={cardNumber || "4242 •••• •••• 4242"}
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450 mb-1">Expiry</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                        value={cardExpiry || "12/28"}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">CVC</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                        value={cardCvv || "•••"}
                        readOnly
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setStripeProcessing(true);
                      try {
                        const totalAmount = getGrandTotal();
                        const intentResult = await createPaymentIntent({
                          amount: totalAmount,
                          email: user?.email || "guest@luxe.com",
                          name: fullName,
                          phone: phone,
                          address: {
                            line1: addressLine1,
                            line2: addressLine2 || "",
                            city: city,
                            state: state,
                            postal_code: zipCode,
                            country: "BD",
                          },
                        }).unwrap();
                        if (intentResult.success && intentResult.data?.clientSecret) {
                          await new Promise((resolve) => setTimeout(resolve, 1500));
                          setStripeSuccess(true);
                          await new Promise((resolve) => setTimeout(resolve, 800));
                          const ok = await submitOrder();
                          if (ok) {
                            setShowStripeModal(false);
                          }
                        }
                      } catch (err: any) {
                        toast.error(err?.data?.message || "Stripe Payment Intent creation failed.");
                        console.error("Stripe Intent generation error:", err);
                      } finally {
                        setStripeProcessing(false);
                        setStripeSuccess(false);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3.5 text-xs font-black shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                  >
                    <span>Authorize & Pay Securely</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
