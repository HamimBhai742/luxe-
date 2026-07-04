"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  updated: string;
  status: "Open" | "In-Progress" | "Resolved";
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "#TCK-8924",
    subject: "Defective item received in recent order",
    updated: "2 hours ago",
    status: "Open",
  },
  {
    id: "#TCK-8810",
    subject: "Update shipping address for pending order",
    updated: "1 day ago",
    status: "In-Progress",
  },
  {
    id: "#TCK-8501",
    subject: "Missing warranty documentation",
    updated: "3 days ago",
    status: "Resolved",
  },
];

export default function DashboardSupportClient() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVipNumber, setShowVipNumber] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("wishlist");

  // Ticket creation form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDetails, setTicketDetails] = useState("");

  const handleStartChat = () => {
    toast.success("Connecting to a live support agent... Average wait time is under 1 minute!");
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) {
      toast.error("Please fill in both the subject and description details.");
      return;
    }

    const newTicket: SupportTicket = {
      id: `#TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: ticketSubject,
      updated: "Just now",
      status: "Open",
    };

    setTickets((prev) => [newTicket, ...prev]);
    toast.success(`Ticket ${newTicket.id} created successfully! Our support agents will respond shortly.`);
    
    setIsModalOpen(false);
    setTicketSubject("");
    setTicketDetails("");
  };

  const handleViewTicket = (ticketId: string, subject: string) => {
    toast.info(`Opening details for ticket ${ticketId}: "${subject}"`);
  };

  const handleTopicClick = (topicName: string) => {
    toast.info(`Loading articles for topic: ${topicName}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching knowledge base for: "${searchQuery}"`);
    }
  };

  const renderStatusPill = (status: SupportTicket["status"]) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100/30">
            Open
          </span>
        );
      case "In-Progress":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-450 border border-blue-100/30">
            In-Progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/20">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* ========================================================================= */}
      {/* 1. TOP BANNER SEARCH */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-zinc-250/60 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 p-8 text-center space-y-6 shadow-xs max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white font-serif tracking-tight">
            How can we help you today?
          </h2>
          <p className="text-sm text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
            Search our knowledge base or get in touch with our premium support team.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="e.g., 'Track my order', 'Return policy'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 text-xs font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT CONTACT TILES */}
      {/* ========================================================================= */}
      <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        {/* Card 1: Live Chat */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2.5xl p-6 shadow-xs flex flex-col justify-between items-start gap-4">
          <div className="space-y-3">
            <span className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-2.5 text-blue-600 inline-block">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-3.658A7.452 7.452 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </span>
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              Live Chat <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle ml-1" />
            </h4>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
              Connect with an agent now. Average wait time: &lt; 2 mins.
            </p>
          </div>
          <button
            onClick={handleStartChat}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Chat</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Card 2: Create Ticket */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2.5xl p-6 shadow-xs flex flex-col justify-between items-start gap-4">
          <div className="space-y-3">
            <span className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2.5 text-zinc-600 dark:text-zinc-450 inline-block border border-zinc-100 dark:border-zinc-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </span>
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              Create Ticket
            </h4>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
              Submit a formal request for complex issues or detailed inquiries.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Submit Request</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Card 3: Call Us VIP */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2.5xl p-6 shadow-xs flex flex-col justify-between items-start gap-4">
          <div className="space-y-3">
            <span className="rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2.5 text-zinc-650 dark:text-zinc-400 inline-block border border-zinc-100 dark:border-zinc-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.557-5.183-3.916-6.74-6.74l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.628a1.125 1.125 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
              </svg>
            </span>
            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Call Us</span>
              <span className="bg-blue-600 text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-md tracking-wider">
                VIP
              </span>
            </h4>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
              Direct line for premium members. Available 24/7.
            </p>
          </div>
          <button
            onClick={() => {
              setShowVipNumber(!showVipNumber);
              if (!showVipNumber) {
                toast.success("VIP Number visible! Dial to call support team.");
              }
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showVipNumber ? "+1 (800) 123-AURA" : "Show Number"}</span>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT RECENT TICKETS */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-5xl mx-auto bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-extrabold text-zinc-905 dark:text-white font-serif uppercase tracking-wide">
              Recent Tickets
            </h3>
            <p className="text-[11px] font-semibold text-zinc-400 mt-1">Track the status of your recent inquiries.</p>
          </div>
          <button
            onClick={() => toast.info("Viewing complete support ticket catalog")}
            className="rounded-xl border border-zinc-200 hover:bg-zinc-55 px-4.5 py-2 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 cursor-pointer shadow-xs"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
            <thead>
              <tr className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <th className="pb-3.5 pl-3">Ticket ID</th>
                <th className="pb-3.5">Subject</th>
                <th className="pb-3.5">Last Update</th>
                <th className="pb-3.5">Status</th>
                <th className="pb-3.5 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                  <td className="py-4.5 pl-3 font-bold text-zinc-900 dark:text-white">{t.id}</td>
                  <td className="py-4.5 text-zinc-850 dark:text-zinc-200">{t.subject}</td>
                  <td className="py-4.5 text-zinc-450 dark:text-zinc-500">{t.updated}</td>
                  <td className="py-4.5">{renderStatusPill(t.status)}</td>
                  <td className="py-4.5 text-right pr-3">
                    <button
                      onClick={() => handleViewTicket(t.id, t.subject)}
                      className="text-xs font-bold text-blue-650 hover:underline cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEWPORT COMMON QUESTIONS */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-zinc-905 dark:text-white font-serif uppercase tracking-wide">
            Common Questions
          </h3>
          <p className="text-[11px] font-semibold text-zinc-400 mt-1">Quick answers to frequently asked questions.</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            {
              title: "Shipping & Delivery",
              text: "Tracking, delivery times, and shipping issues.",
              icon: (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
                </svg>
              ),
            },
            {
              title: "Returns & Refunds",
              text: "Policies, process, and refund timelines.",
              icon: (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              ),
            },
            {
              title: "Payments & Billing",
              text: "Invoices, payment methods, and charges.",
              icon: (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 8.25h12.75M2.25 5.25h16.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.12-1.125V6.375c0-.621.504-1.125 1.125-1.125z" />
                </svg>
              ),
            },
            {
              title: "Account Security",
              text: "Passwords, 2FA, and account access.",
              icon: (
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
            },
          ].map((topic) => (
            <div
              key={topic.title}
              onClick={() => handleTopicClick(topic.title)}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col gap-4 text-left group hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <span className="rounded-xl bg-zinc-55 dark:bg-zinc-950/40 p-2.5 text-zinc-550 dark:text-zinc-400 inline-block self-start">
                {topic.icon}
              </span>
              <div>
                <h4 className="text-xs font-bold text-zinc-850 dark:text-white group-hover:text-blue-600 transition-colors">
                  {topic.title}
                </h4>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-1 leading-relaxed">
                  {topic.text}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE VIEWPORT LAYOUT */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col bg-zinc-50/40 dark:bg-zinc-950/20 pb-20">
        
        {/* Mobile Header search */}
        <div className="px-4 pt-4 pb-2 space-y-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white font-serif">
            How can we help you?
          </h1>
          <div className="relative">
            <svg className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Contact Support stacked list */}
        <div className="px-4 py-3 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Contact Support
          </h3>

          <div className="space-y-2">
            
            {/* Live Chat */}
            <div
              onClick={handleStartChat}
              className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850 rounded-xl p-3 shadow-xs cursor-pointer active:bg-zinc-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-zinc-850 dark:text-white">Live Chat</h4>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Est. wait: <span className="text-blue-600 font-bold">2 mins</span></span>
                </div>
              </div>
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>

            {/* Create Ticket */}
            <div
              onClick={() => setIsModalOpen(true)}
              className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850 rounded-xl p-3 shadow-xs cursor-pointer active:bg-zinc-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-850 dark:text-white">Create Ticket</h4>
                    <span className="bg-blue-50 text-[7px] font-black uppercase text-blue-600 px-1 rounded border border-blue-100/30">VIP</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Response in ~4 hours</span>
                </div>
              </div>
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>

            {/* Call Us */}
            <div
              onClick={() => {
                setShowVipNumber(!showVipNumber);
                if (!showVipNumber) {
                  toast.success("VIP Number visible!");
                }
              }}
              className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850 rounded-xl p-3 shadow-xs cursor-pointer active:bg-zinc-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="h-9 w-9 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.557-5.183-3.916-6.74-6.74l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.628a1.125 1.125 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-zinc-850 dark:text-white">Call Us</h4>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {showVipNumber ? "+1 (800) 123-AURA" : "Available 9am - 5pm EST"}
                  </span>
                </div>
              </div>
              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>

          </div>
        </div>

        {/* Recent Tickets list */}
        <div className="px-4 py-3 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Recent Tickets
            </h3>
            <button
              onClick={() => toast.info("Viewing all tickets")}
              className="text-[10px] font-bold text-blue-600"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => handleViewTicket(t.id, t.subject)}
                className={`bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850 rounded-xl p-3.5 shadow-xs space-y-2 ${
                  t.status === "In-Progress" ? "border-l-4 border-l-blue-600" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-zinc-800 dark:text-white">{t.id}</span>
                  {t.status === "Resolved" ? (
                    <span className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-650">
                      &#8226; Resolved
                    </span>
                  ) : t.status === "In-Progress" ? (
                    <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                      &#8226; In-Progress
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      &#8226; Open
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 line-clamp-1">
                  {t.subject}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-1">Updated {t.updated}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browse Topics */}
        <div className="px-4 py-3 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Browse Topics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                title: "Shipping",
                icon: (
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.02-1.66l1.049-2.223a.75.75 0 00.07-.312V5.58c0-.98.79-1.78 1.78-1.78h10.375c.99 0 1.78.8 1.78 1.78v8.622a.75.75 0 00.07.312l1.049 2.222a1.125 1.125 0 01-1.02 1.66H17.25m-11.25 0a1.5 1.5 0 00-3 0m3 0a1.5 1.5 0 01-3 0m11.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-1.5-12.75h.007v.008H12v-.008z" />
                  </svg>
                ),
              },
              {
                title: "Returns",
                icon: (
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                ),
              },
              {
                title: "Payments",
                icon: (
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-19.5 8.25h12.75M2.25 5.25h16.5c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125H3.375a1.125 1.125 0 01-1.12-1.125V6.375c0-.621.504-1.125 1.125-1.125z" />
                  </svg>
                ),
              },
              {
                title: "Security",
                icon: (
                  <svg className="h-4.5 w-4.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
            ].map((topic) => (
              <div
                key={topic.title}
                onClick={() => handleTopicClick(topic.title)}
                className="bg-white border border-zinc-150/60 rounded-xl p-3 flex flex-col gap-2.5 shadow-xs cursor-pointer active:bg-zinc-50"
              >
                <span className="h-8.5 w-8.5 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 self-start">
                  {topic.icon}
                </span>
                <span className="text-[10px] font-bold text-zinc-800">{topic.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dock */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-150 px-6 py-2 shadow-lg">
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
                activeMobileTab === "wishlist" ? "bg-blue-600 text-white" : "text-zinc-450 hover:bg-zinc-55"
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

      {/* ========================================================================= */}
      {/* CREATE SUPPORT TICKET MODAL OVERLAY */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4">
          
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          {/* Modal Container */}
          <form
            onSubmit={handleCreateTicketSubmit}
            className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-55 space-y-5"
          >
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                Submit Support Ticket
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">Submit a detailed inquiry for our support agents.</p>
            </div>

            <div className="space-y-4 text-xs font-bold text-left">
              <div className="space-y-1.5">
                <label className="text-zinc-650 dark:text-zinc-400">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Return label not generating"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-650 dark:text-zinc-400">Describe the Issue in Detail *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please provide order numbers, tracking info, or symptoms..."
                  value={ticketDetails}
                  onChange={(e) => setTicketDetails(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-55 px-4 py-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-350 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
