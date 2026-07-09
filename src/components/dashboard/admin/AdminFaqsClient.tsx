/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  TFaq,
} from "@/lib/features/api/faqApi";

const FAQ_CATEGORIES = ["General", "Products", "Shipping", "Payments", "Warranties"];

export default function AdminFaqsClient() {
  const { data, isLoading } = useGetFaqsQuery();
  const [createFaq] = useCreateFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const [searchVal, setSearchVal] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [order, setOrder] = useState(0);

  const rawFaqs = data?.success && data.data ? data.data : [];

  // Filter based on search query and category selector
  const filteredFaqs = rawFaqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchVal.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchVal.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" ||
      faq.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingFaqId(null);
    setQuestion("");
    setAnswer("");
    setCategory("General");
    setOrder(0);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: TFaq) => {
    setEditingFaqId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "General");
    setOrder(faq.order);
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Question is required");
      return;
    }
    if (!answer.trim()) {
      toast.error("Answer is required");
      return;
    }
    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }

    try {
      if (editingFaqId) {
        // Update Faq
        const res = await updateFaq({
          id: editingFaqId,
          question,
          answer,
          category,
          order,
        }).unwrap();
        if (res.success) {
          toast.success("FAQ updated successfully");
          setIsModalOpen(false);
        } else {
          toast.error(res.message || "Failed to update FAQ");
        }
      } else {
        // Create Faq
        const res = await createFaq({
          question,
          answer,
          category,
          order,
        }).unwrap();
        if (res.success) {
          toast.success("FAQ created successfully");
          setIsModalOpen(false);
        } else {
          toast.error(res.message || "Failed to create FAQ");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.data?.message || "An error occurred");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await deleteFaq(deleteConfirmId).unwrap();
      if (res.success) {
        toast.success("FAQ deleted successfully");
      } else {
        toast.error(res.message || "Failed to delete FAQ");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.data?.message || "An error occurred");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
            FAQ Console
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
            Create, update, and sort categorized questions displayed on the store front and homepage.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-blue-500/20 cursor-pointer select-none transition-all"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add FAQ</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SEARCH AND FILTERS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-4 rounded-2xl shadow-xs">
        
        {/* Keyword Search */}
        <div className="relative flex-1 max-w-sm flex items-center">
          <svg className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-55/30 dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none"
          >
            <option value="All">All Categories</option>
            {FAQ_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DATA TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 animate-pulse font-bold text-xs uppercase tracking-widest">
            Loading FAQ records...
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
            <svg className="mx-auto h-12 w-12 text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-350">No FAQs found</h3>
            <p className="text-xs text-zinc-400 mt-1">Try resetting the keyword filter or add a new FAQ card.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20">
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Order</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Category</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Question</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Answer</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest">Created At</th>
                  <th className="p-4 text-[10px] font-bold text-zinc-450 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/50">
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                    <td className="p-4 text-xs font-bold text-zinc-400">
                      #{faq.order}
                    </td>
                    <td className="p-4 text-xs">
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {faq.category || "General"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-zinc-900 dark:text-white max-w-xs truncate" title={faq.question}>
                      {faq.question}
                    </td>
                    <td className="p-4 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm truncate" title={faq.answer}>
                      {faq.answer}
                    </td>
                    <td className="p-4 text-xs text-zinc-400 font-medium">
                      {new Date(faq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs font-semibold text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-850 dark:hover:text-white transition-colors cursor-pointer"
                          title="Edit FAQ"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(faq.id)}
                          className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete FAQ"
                        >
                          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 animate-slide-up z-10 space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-full bg-zinc-50 dark:bg-zinc-800 p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                {editingFaqId ? "Edit FAQ" : "Add FAQ Item"}
              </h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">
                Insert a common query card with its answer, category selection, and layout index.
              </p>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4">
              
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Category Group
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-850 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700"
                >
                  {FAQ_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Question
                </label>
                <input
                  type="text"
                  placeholder="e.g. What is your hardware warranty period?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-850 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Answer */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Answer
                </label>
                <textarea
                  placeholder="Write a clear, thorough explanation here..."
                  rows={4}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-semibold text-zinc-850 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400 resize-none"
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Sort Order
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-955 text-xs font-semibold text-zinc-850 dark:text-zinc-250 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 hover:bg-blue-550 text-white px-6 py-2.5 text-xs font-bold cursor-pointer shadow-sm shadow-blue-500/10 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOGUE */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteConfirmId(null)} />
          
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-8 animate-scale-up z-10 space-y-6">
            <div>
              <h3 className="font-serif text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Delete FAQ Item?
              </h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-2">
                This action is permanent and will remove this card from the store FAQ sections instantly.
              </p>
            </div>

            <div className="flex justify-end gap-3.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 text-xs font-bold cursor-pointer transition-all"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 hover:bg-red-550 text-white px-5 py-2.5 text-xs font-bold cursor-pointer shadow-sm shadow-red-550/15 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
