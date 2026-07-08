/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGetAllTicketsQuery, useUpdateTicketStatusMutation } from "@/lib/features/api/supportApi";

export default function AdminReportsClient() {
  const { data: ticketsData, isLoading } = useGetAllTicketsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Open" | "In-Progress" | "Resolved">("All");

  // Selected ticket for status edit / details view modals
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"Open" | "In-Progress" | "Resolved">("Open");

  const ticketsList = ticketsData?.success && ticketsData.data ? ticketsData.data : [];

  // Filter tickets by tab and search query
  const filteredTickets = ticketsList.filter((t) => {
    const matchesTab = activeTab === "All" || t.status === activeTab;
    
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      t.ticketId.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.user.name.toLowerCase().includes(term) ||
      t.user.email.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  // Calculate ticket counts
  const totalCount = ticketsList.length;
  const openCount = ticketsList.filter((t) => t.status === "Open").length;
  const inProgressCount = ticketsList.filter((t) => t.status === "In-Progress").length;
  const resolvedCount = ticketsList.filter((t) => t.status === "Resolved").length;

  const handleOpenEditModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setIsEditModalOpen(true);
  };

  const handleOpenDetailsModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      await updateStatus({
        id: selectedTicket.id,
        status: newStatus,
      }).unwrap();

      toast.success(`Ticket ${selectedTicket.ticketId} updated to ${newStatus} successfully! Customer has been notified via email.`);
      setIsEditModalOpen(false);
      setSelectedTicket(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update ticket status.");
    }
  };

  const formatTicketDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const renderStatusBadge = (status: string) => {
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
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider font-sans">
          Customer Support Reports
        </h1>
        <p className="text-[11px] font-semibold text-zinc-400">
          Review, manage, and update statuses of customer queries.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* METRICS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Inquiries", count: totalCount, color: "text-zinc-900 dark:text-white" },
          { label: "Open Tickets", count: openCount, color: "text-emerald-600" },
          { label: "In Progress", count: inProgressCount, color: "text-blue-600" },
          { label: "Resolved Issues", count: resolvedCount, color: "text-zinc-550 dark:text-zinc-400" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">{card.label}</span>
              {isLoading ? (
                <div className="h-7 w-12 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
              ) : (
                <span className={`text-2xl font-black ${card.color}`}>{card.count}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* FILTERS & SEARCH CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-4">
        
        {/* Tab switcher */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-zinc-55 dark:bg-zinc-950 border border-zinc-150/40 dark:border-zinc-900 overflow-x-auto w-full sm:w-auto">
          {(["All", "Open", "In-Progress", "Resolved"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-100 dark:border-zinc-850"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <input
            type="text"
            placeholder="Search ID, customer, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors placeholder:text-zinc-450"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TICKETS TABLE CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2.5xl p-6 shadow-xs overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-850">
          <thead>
            <tr className="text-left text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              <th className="pb-3.5 pl-3">Ticket ID</th>
              <th className="pb-3.5">Customer details</th>
              <th className="pb-3.5">Subject Summary</th>
              <th className="pb-3.5">Date Filed</th>
              <th className="pb-3.5">Status</th>
              <th className="pb-3.5 text-right pr-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4.5 pl-3"><div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded"></div></td>
                  <td className="py-4.5">
                    <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded mb-1"></div>
                    <div className="h-3 w-40 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                  </td>
                  <td className="py-4.5"><div className="h-4 w-52 bg-zinc-100 dark:bg-zinc-800 rounded"></div></td>
                  <td className="py-4.5"><div className="h-4 w-28 bg-zinc-100 dark:bg-zinc-800 rounded"></div></td>
                  <td className="py-4.5"><div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full"></div></td>
                  <td className="py-4.5 text-right pr-3"><div className="h-7 w-20 bg-zinc-100 dark:bg-zinc-800 rounded ml-auto"></div></td>
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-450 font-bold uppercase tracking-wider">
                  No support tickets found matching current filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-55/30 dark:hover:bg-zinc-850/20 transition-colors">
                  <td className="py-4.5 pl-3 font-extrabold text-zinc-900 dark:text-white shrink-0">{t.ticketId}</td>
                  <td className="py-4.5">
                    <span className="block text-zinc-900 dark:text-white font-extrabold">{t.user.name}</span>
                    <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">{t.user.email}</span>
                  </td>
                  <td className="py-4.5 max-w-xs truncate text-zinc-800 dark:text-zinc-200">{t.subject}</td>
                  <td className="py-4.5 text-zinc-450 dark:text-zinc-500 font-semibold">{formatTicketDate(t.createdAt)}</td>
                  <td className="py-4.5">{renderStatusBadge(t.status)}</td>
                  <td className="py-4.5 text-right pr-3 space-x-2">
                    <button
                      onClick={() => handleOpenDetailsModal(t)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 hover:dark:bg-zinc-850 cursor-pointer shadow-xs"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-[10px] font-bold cursor-pointer shadow-xs"
                    >
                      Solve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* TICKET DETAILS VIEW MODAL */}
      {/* ========================================================================= */}
      {isDetailsModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-55 space-y-5">
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Support Query details</span>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide mt-1">
                  Ticket {selectedTicket.ticketId}
                </h3>
              </div>
              {renderStatusBadge(selectedTicket.status)}
            </div>

            <div className="space-y-4 text-xs font-semibold text-left">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Filed By</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-extrabold mt-1">
                  {selectedTicket.user.name} ({selectedTicket.user.email})
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Date Filed</span>
                <p className="text-zinc-800 dark:text-zinc-200 font-semibold mt-1">
                  {formatTicketDate(selectedTicket.createdAt)}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Subject / Issue Summary</span>
                <p className="text-zinc-900 dark:text-white font-extrabold mt-1 text-sm">
                  {selectedTicket.subject}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Detailed Description</span>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150/60 dark:border-zinc-850 p-4 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed mt-1.5 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedTicket.description}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 text-xs font-bold cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TICKET STATUS SOLVE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
          <form
            onSubmit={handleUpdateStatusSubmit}
            className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-55 space-y-5"
          >
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                Solve Ticket: {selectedTicket.ticketId}
              </h3>
              <p className="text-[10px] text-zinc-400 font-semibold mt-1">Updating status sends an automated notification email to customer.</p>
            </div>

            <div className="space-y-4 text-xs font-bold text-left">
              <div className="space-y-1.5">
                <label className="text-zinc-650 dark:text-zinc-400">Select Resolution Status *</label>
                <select
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="Open">Open</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-55 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-350 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
