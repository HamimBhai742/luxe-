/* eslint-disable react-hooks/purity */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreditCard {
  id: number;
  brand: "Visa" | "Mastercard";
  last4: string;
  isDefault: boolean;
  expiry: string;
}

interface BkashAccount {
  id: number;
  number: string;
  isVerified: boolean;
}

const INITIAL_CARDS: CreditCard[] = [
  { id: 1, brand: "Visa", last4: "4242", isDefault: true, expiry: "12/2025" },
  { id: 2, brand: "Mastercard", last4: "8888", isDefault: false, expiry: "08/2026" },
];

const INITIAL_BKASH: BkashAccount[] = [
  { id: 101, number: "+880 17XX XXXX 99", isVerified: true },
];

export default function DashboardPaymentsClient() {
  const [cards, setCards] = useState<CreditCard[]>(() => {
    if (typeof window !== "undefined") {
      const savedCards = localStorage.getItem("luxe_saved_cards");
      if (savedCards) return JSON.parse(savedCards);
      localStorage.setItem("luxe_saved_cards", JSON.stringify(INITIAL_CARDS));
    }
    return INITIAL_CARDS;
  });

  const [bkashAccounts, setBkashAccounts] = useState<BkashAccount[]>(() => {
    if (typeof window !== "undefined") {
      const savedBkash = localStorage.getItem("luxe_saved_bkash");
      if (savedBkash) return JSON.parse(savedBkash);
      localStorage.setItem("luxe_saved_bkash", JSON.stringify(INITIAL_BKASH));
    }
    return INITIAL_BKASH;
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"card" | "bkash" | "select">("select");

  // Form states
  const [cardBrand, setCardBrand] = useState<"Visa" | "Mastercard">("Visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");

  const handleSetDefault = (cardId: number) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    setCards(updated);
    localStorage.setItem("luxe_saved_cards", JSON.stringify(updated));
    const selected = cards.find((c) => c.id === cardId);
    toast.success(`Set ${selected?.brand} ending in ${selected?.last4} as default payment method`);
  };

  const handleRemoveCard = (cardId: number, brand: string, last4: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    setCards(updated);
    localStorage.setItem("luxe_saved_cards", JSON.stringify(updated));
    toast.success(`Removed ${brand} ending in ${last4} from your account`);
  };

  const handleRemoveBkash = (id: number, num: string) => {
    const updated = bkashAccounts.filter((b) => b.id !== id);
    setBkashAccounts(updated);
    localStorage.setItem("luxe_saved_bkash", JSON.stringify(updated));
    toast.success(`Removed bKash number ${num} successfully`);
  };

  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const limited = clean.slice(0, 16);
    
    if (limited.startsWith("4")) {
      setCardBrand("Visa");
    } else if (limited.startsWith("5")) {
      setCardBrand("Mastercard");
    }

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
    setCardCvc(clean);
  };

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === "card") {
      if (cards.length >= 5) {
        toast.error("Limit exceeded: You can only save up to 5 credit/debit cards.");
        return;
      }

      const cleanNum = cardNumber.replace(/\s/g, "");
      if (cleanNum.length < 16) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }

      if (!cardExpiry || !cardExpiry.includes("/") || cardExpiry.split("/")[1]?.length < 4) {
        toast.error("Please enter a valid expiry date (MM/YYYY).");
        return;
      }

      if (!cardCvc || cardCvc.length < 3) {
        toast.error("Please enter a valid 3 or 4 digit CVC.");
        return;
      }

      const newCard: CreditCard = {
        id: Date.now(),
        brand: cardBrand,
        last4: cleanNum.slice(-4),
        isDefault: cards.length === 0,
        expiry: cardExpiry,
      };

      const updated = [...cards, newCard];
      setCards(updated);
      localStorage.setItem("luxe_saved_cards", JSON.stringify(updated));
      toast.success(`Linked ${cardBrand} card ending in ${newCard.last4} successfully!`);
    } else if (modalType === "bkash") {
      if (bkashAccounts.length >= 2) {
        toast.error("Limit exceeded: You can only save up to 2 bKash accounts.");
        return;
      }

      const cleanNum = bkashNumber.replace(/\D/g, "");
      if (cleanNum.length < 11) {
        toast.error("Please enter a valid 11-digit bKash mobile number.");
        return;
      }

      const formattedBkash = setWishlistMobileNumber(cleanNum);
      const newBkash: BkashAccount = {
        id: Date.now(),
        number: formattedBkash,
        isVerified: true,
      };

      const updated = [...bkashAccounts, newBkash];
      setBkashAccounts(updated);
      localStorage.setItem("luxe_saved_bkash", JSON.stringify(updated));
      toast.success(`Linked bKash account ${formattedBkash} successfully!`);
    }

    setIsModalOpen(false);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setBkashNumber("");
  };

  const setWishlistMobileNumber = (num: string) => {
    if (num.startsWith("0")) {
      return `+880 ${num.slice(1, 4)}XX XXXX ${num.slice(-2)}`;
    }
    return num;
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif uppercase">
            Payment Methods
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Manage your payment options for faster checkout.
          </p>
        </div>

        <button
          onClick={() => {
            setModalType("select");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Payment Method</span>
        </button>
      </div>

      {/* Grid side-by-side split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Cards and Mobile Listings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Credit & Debit Cards segment */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
            
            {/* Title header */}
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif flex items-center gap-2.5">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 8.25h12.75M2.25 5.25h16.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.12-1.125V6.375c0-.621.504-1.125 1.125-1.125z" />
              </svg>
              <span>Credit & Debit Cards</span>
            </h3>

            {/* Card stack list */}
            {cards.length === 0 ? (
              <p className="text-xs text-zinc-400 font-semibold pl-2">No linked credit cards found.</p>
            ) : (
              <div className="space-y-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4.5 flex justify-between items-center bg-white dark:bg-zinc-950/20 group shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    
                    {/* Brand details */}
                    <div className="flex gap-4 items-center">
                      
                      {/* Logo tag border box */}
                      <div className="h-10 w-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center p-1 font-black italic text-sm tracking-wide text-zinc-600">
                        {card.brand === "Visa" ? (
                          <span className="text-blue-700 font-serif">VISA</span>
                        ) : (
                          <span className="text-red-500 font-serif">MC</span>
                        )}
                      </div>

                      {/* Info stack */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-zinc-800 dark:text-white">
                            {card.brand} ending in {card.last4}
                          </span>
                          {card.isDefault && (
                            <span className="bg-blue-50 text-[9px] font-black uppercase text-blue-600 px-2 py-0.5 rounded-full tracking-wide border border-blue-100/30">
                              Default
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 block mt-1">
                          Expires {card.expiry}
                        </span>
                        
                        {/* Set default trigger link */}
                        {!card.isDefault && (
                          <button
                            onClick={() => handleSetDefault(card.id)}
                            className="text-[10px] font-extrabold text-blue-600 hover:text-blue-550 block mt-2 cursor-pointer transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Delete Card trigger */}
                    <button
                      onClick={() => handleRemoveCard(card.id, card.brand, card.last4)}
                      className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
                      title="Remove card"
                    >
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Mobile Banking (bKash) segment */}
          <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
            
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif flex items-center gap-2.5">
              <svg className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              <span>Mobile Banking (bKash)</span>
            </h3>

            {bkashAccounts.length === 0 ? (
              <p className="text-xs text-zinc-400 font-semibold pl-2">No linked bKash mobile banking accounts found.</p>
            ) : (
              <div className="space-y-4">
                {bkashAccounts.map((b) => (
                  <div
                    key={b.id}
                    className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4.5 flex flex-col sm:flex-row justify-between sm:items-center bg-white dark:bg-zinc-950/20 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors gap-4"
                  >
                    {/* logo and number details */}
                    <div className="flex gap-4 items-center">
                      
                      {/* bKash Round pink logo */}
                      <div className="h-11 w-11 rounded-full bg-pink-600 flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm border border-pink-700/10">
                        bKash
                      </div>

                      {/* info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-extrabold text-zinc-800 dark:text-white">
                            {b.number}
                          </span>
                          {b.isVerified && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-[9px] font-black uppercase text-emerald-700 px-2 py-0.5 rounded-full tracking-wide border border-emerald-100/30">
                              <svg className="h-2.5 w-2.5 text-emerald-650" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                              <span>Verified Account</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-400 block mt-1.5">
                          Manual payment verification required per transaction.
                        </span>
                      </div>

                    </div>

                    {/* Actions edit and remove */}
                    <div className="flex items-center gap-2 sm:self-center">
                      <button
                        onClick={() => toast.info(`Editing bKash number ${b.number}`)}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveBkash(b.id, b.number)}
                        className="text-xs font-bold text-red-600 hover:text-red-500 px-3 py-2 cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

        {/* Right Side: Dashed Outline Card & Security Badge */}
        <div className="space-y-6">
          
          {/* Dashed outline Link new payment method */}
          <div
            onClick={() => {
              setModalType("select");
              setIsModalOpen(true);
            }}
            className="border-2 border-dashed border-zinc-200 hover:border-blue-300 dark:border-zinc-800 dark:hover:border-blue-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white dark:bg-zinc-950/20 group hover:shadow-xs"
          >
            
            {/* Plus icon circle */}
            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>

            <h4 className="text-xs font-bold text-zinc-800 dark:text-white mt-4 tracking-wide group-hover:text-blue-600 transition-colors">
              Link new Payment Method
            </h4>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1 max-w-[200px] leading-relaxed">
              Add another card or bKash number
            </p>

          </div>

          {/* Secure transaction check box */}
          <div className="flex gap-4 items-start p-4">
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-2.5 text-emerald-650 shrink-0 shadow-xs border border-emerald-100/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-zinc-900 dark:text-white">
                Secure Transactions
              </h5>
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Your payment information is encrypted and securely stored. We never share your full card details with sellers.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADD PAYMENT METHOD MODAL OVERLAY */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4">
          
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          {/* Modal Container */}
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-55 space-y-6">
            
            {/* 1. Selector Mode */}
            {modalType === "select" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                    Select Payment Type
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">Choose a method to link to your account.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setModalType("card")}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-blue-500 hover:bg-blue-50/10 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
                  >
                    <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 8.25h12.75M2.25 5.25h16.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.12-1.125V6.375c0-.621.504-1.125 1.125-1.125z" />
                    </svg>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Credit / Debit Card</span>
                  </button>
                  <button
                    onClick={() => setModalType("bkash")}
                    className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-pink-500 hover:bg-pink-50/10 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-full bg-pink-600 flex items-center justify-center text-[8px] font-bold text-white">bKash</div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Mobile Banking</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Add Credit Card form */}
            {modalType === "card" && (
              <form onSubmit={handleAddPaymentSubmit} className="space-y-5 text-xs font-bold">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                    Link Credit / Debit Card
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Specify your card details below.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-600 dark:text-zinc-400">Card Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-600 dark:text-zinc-400">Expiry Date (MM/YYYY) *</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YYYY"
                        value={cardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-600 dark:text-zinc-400">CVC *</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => handleCvcChange(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-600 dark:text-zinc-400">Card Provider (Auto-detected)</label>
                    <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 px-3.5 py-2.5 font-bold text-zinc-700 dark:text-zinc-300">
                      {cardBrand}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setModalType("select")}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-55 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer"
                  >
                    Link Card
                  </button>
                </div>
              </form>
            )}

            {/* 3. Add bKash Account form */}
            {modalType === "bkash" && (
              <form onSubmit={handleAddPaymentSubmit} className="space-y-5 text-xs font-bold">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                    Link bKash Account
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Specify your bKash mobile details below.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-zinc-600 dark:text-zinc-400">bKash Account Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712345699"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setModalType("select")}
                    className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-55 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer"
                  >
                    Verify & Link
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
