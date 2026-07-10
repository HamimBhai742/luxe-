"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetFaqsQuery } from "@/lib/features/api/faqApi";

const FAQ_CATEGORIES = ["All", "General", "Products", "Shipping", "Payments", "Warranties"];

export default function FAQPage() {
  const { data, isLoading } = useGetFaqsQuery();
  const [searchVal, setSearchVal] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  const rawFaqs = data?.success && data.data ? data.data : [];

  // Fallback defaults for visual richness if database is empty
  const fallbackFaqs = [
    {
      id: "mock-1",
      question: "What makes LUXE peripherals different from regular electronics?",
      answer: "LUXE components prioritize minimalist, distraction-free aesthetics. We source high-grade mechanical parts, matte aluminum shells, and Swiss movement designs that are built to look premium and outlast ordinary plastic devices.",
      category: "Products",
    },
    {
      id: "mock-2",
      question: "Are these gadgets compatible with macOS, Windows, and Linux?",
      answer: "Yes. All of our workspace electronics, keyboards, and audio docks support universal plug-and-play protocols and connect seamlessly across macOS, Windows, Linux, and mobile operating systems.",
      category: "Products",
    },
    {
      id: "mock-3",
      question: "How long does shipping take, and do you ship worldwide?",
      answer: "We ship to over 85 countries worldwide. Standard shipping takes 5-7 business days, while express courier pathways take 2-3 business days. All shipments include carbon-offset transport pathways.",
      category: "Shipping",
    },
    {
      id: "mock-4",
      question: "What is your warranty and refund policy?",
      answer: "We offer a 2-year comprehensive hardware warranty on all workspace items. Return requests can be initiated within 14 calendar days of receipt, provided the items remain in their original glassmorphic packaging.",
      category: "Warranties",
    },
    {
      id: "mock-5",
      question: "What payment gateways are supported during checkout?",
      answer: "We accept all major international credit cards, Apple Pay, Google Pay, Stripe, and Paypal. All transaction information is encrypted and secured.",
      category: "Payments",
    },
  ];

  const faqsToDisplay = rawFaqs.length > 0 ? rawFaqs : fallbackFaqs;

  // Filter based on search keywords and tab categories
  const filteredFaqs = faqsToDisplay.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchVal.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      faq.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: string) => {
    setActiveFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 transition-colors duration-500 min-h-screen pb-20">
      
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20">
            Help Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            How can we help you?
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative flex items-center">
              <svg className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
              <input
                type="text"
                placeholder="Search for questions, terms, features..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-11 pr-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-sm font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CATEGORIES TAB NAVIGATION */}
      {/* ========================================================================= */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-zinc-100 dark:border-zinc-900">
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveFaqId(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                    : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQS ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-900 rounded-2xl" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50/30 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
            <svg className="mx-auto h-12 w-12 text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">No matching FAQs found</h3>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">Try switching categories or searching for different keywords.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = activeFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-zinc-50/30 dark:bg-zinc-900/10 border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-serif text-sm sm:text-base font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span>{faq.question}</span>
                      {activeCategory === "All" && (
                        <span className="inline-flex self-start sm:self-auto items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                          {faq.category || "General"}
                        </span>
                      )}
                    </div>
                    <span className={`ml-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out border-zinc-200 dark:border-zinc-800 ${
                      isOpen ? "max-h-[500px] border-t p-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <p className="text-xs sm:text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SUPPORT CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-linear-to-br from-zinc-50/50 via-white to-blue-50/10 dark:from-zinc-900/30 dark:via-zinc-950 dark:to-blue-950/10 p-8 text-center space-y-4 shadow-xs">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Still have questions?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Can&apos;t find the answers you are looking for? Reach out to our technical support team in the Customer Portal.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/support"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
            >
              <span>Submit a Ticket</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
