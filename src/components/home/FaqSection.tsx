"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetFaqsQuery } from "@/lib/features/api/faqApi";

export default function FaqSection() {
  const { data, isLoading } = useGetFaqsQuery();
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  const rawFaqs = data?.success && data.data ? data.data : [];

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
  ];

  const faqsToDisplay = rawFaqs.length > 0 ? rawFaqs.slice(0, 4) : fallbackFaqs;

  const toggleFaq = (id: string) => {
    setActiveFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 sm:py-28 bg-zinc-50/30 dark:bg-zinc-950/10 border-y border-zinc-100 dark:border-zinc-900 transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Column: Heading and CTA */}
          <div className="space-y-6 max-w-md">
            <span className="inline-flex items-center rounded-full bg-blue-500/10 dark:bg-blue-400/10 px-3.5 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase ring-1 ring-inset ring-blue-500/20">
              Help Center
            </span>
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Common Questions <span className="block text-blue-600 dark:text-blue-450 mt-1">Answered.</span>
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Find answers to core features, compatibility queries, and order procedures. Need further assistance? Our legal data officers are always on hand.
            </p>
            <div className="pt-2">
              <Link
                href="/faq"
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
              >
                <span>View Full FAQ page</span>
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column: Accordions list */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-200/50 dark:bg-zinc-900 rounded-2xl" />
                ))}
              </div>
            ) : (
              faqsToDisplay.map((faq) => {
                const isOpen = activeFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-850/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left font-serif text-sm sm:text-base font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span>{faq.question}</span>
                        <span className="inline-flex self-start sm:self-auto items-center rounded-full bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">
                          {faq.category || "General"}
                        </span>
                      </div>
                      <span className={`ml-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>

                    <div
                      className={`transition-all duration-300 ease-in-out border-zinc-150 dark:border-zinc-850 ${
                        isOpen ? "max-h-[300px] border-t p-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <p className="text-xs sm:text-[13px] text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
