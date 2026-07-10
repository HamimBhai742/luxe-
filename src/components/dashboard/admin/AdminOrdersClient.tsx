/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import JSZip from "jszip";
interface OrderItem {
  id: string;
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  paymentMethod?: "card" | "bkash" | "cod";
  fulfillmentStatus: "Shipped" | "Processing" | "Delivered" | "Canceled" | "Returned" | "Confirmed" | "Packed";
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: "order-1",
    orderId: "ORD-001",
    date: "Oct 24, 2024",
    customerName: "Alex Thompson",
    customerEmail: "alex.t@example.com",
    total: 249.0,
    paymentStatus: "Paid",
    fulfillmentStatus: "Shipped",
  },
  {
    id: "order-2",
    orderId: "ORD-002",
    date: "Oct 23, 2024",
    customerName: "Sarah Jenkins",
    customerEmail: "s.jenkins@provider.net",
    total: 1120.5,
    paymentStatus: "Pending",
    fulfillmentStatus: "Processing",
  },
  {
    id: "order-3",
    orderId: "ORD-003",
    date: "Oct 22, 2024",
    customerName: "Michael Chen",
    customerEmail: "m.chen@example.com",
    total: 85.0,
    paymentStatus: "Paid",
    fulfillmentStatus: "Delivered",
  },
  {
    id: "order-4",
    orderId: "ORD-004",
    date: "Oct 21, 2024",
    customerName: "Emily Davis",
    customerEmail: "emily.d@provider.net",
    total: 430.0,
    paymentStatus: "Paid",
    fulfillmentStatus: "Canceled",
  },
  {
    id: "order-5",
    orderId: "ORD-005",
    date: "Oct 20, 2024",
    customerName: "James Wilson",
    customerEmail: "j.wilson@tech.com",
    total: 150.0,
    paymentStatus: "Refunded",
    fulfillmentStatus: "Returned",
  },
];

export default function AdminOrdersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All"); // Fulfillment filter
  const [selectedPayment, setSelectedPayment] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("All");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

  // Fetch orders from API on dependencies change
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          search: filterSearch,
          status: selectedStatus,
          payment: selectedPayment,
          dateRange: selectedDateRange,
        });

        const res = await fetch(`${API_URL}/orders?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
          setTotalPages(data.meta.totalPages);
          setTotalItems(data.meta.total);
        } else {
          toast.error(data.message || "Failed to fetch orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [API_URL, currentPage, itemsPerPage, filterSearch, selectedStatus, selectedPayment, selectedDateRange, refreshTrigger]);


  // Create/Edit modal states
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [total, setTotal] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending" | "Refunded">("Paid");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bkash" | "cod">("card");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"Shipped" | "Processing" | "Delivered" | "Canceled" | "Returned" | "Confirmed" | "Packed">("Processing");

  // View detail modal states
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  // Edit states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Derived state to check if modal should be open (either triggered locally or via URL params)
  const isModalOpen = localIsModalOpen || searchParams.get("create") === "true";

  // Close menus on click outside
  useEffect(() => {
    if (!activeMenuId) return;
    const handleCloseMenus = () => setActiveMenuId(null);
    document.addEventListener("click", handleCloseMenus);
    return () => document.removeEventListener("click", handleCloseMenus);
  }, [activeMenuId]);

  const closeModal = () => {
    setLocalIsModalOpen(false);
    // Clear query parameter
    if (searchParams.get("create") === "true") {
      router.replace("/admin/dashboard/orders");
    }
    // Clear form inputs
    setCustomerName("");
    setCustomerEmail("");
    setTotal("");
    setPaymentStatus("Paid");
    setPaymentMethod("card");
    setFulfillmentStatus("Processing");
    setEditingOrderId(null);
  };

  const handleCreateOrder = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (order: OrderItem) => {
    setEditingOrderId(order.id);
    setCustomerName(order.customerName);
    setCustomerEmail(order.customerEmail);
    setTotal(String(order.total));
    setPaymentStatus(order.paymentStatus);
    setPaymentMethod((order.paymentMethod as any) || "card");
    setFulfillmentStatus(order.fulfillmentStatus);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteOrder = async (id: string, orderId: string) => {
    const toastId = toast.loading(`Deleting order "${orderId}"...`);
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
      });
      const responseData = await res.json();
      if (res.ok && responseData.success) {
        toast.success(`Order "${orderId}" deleted successfully!`, { id: toastId });
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(responseData.message || "Failed to delete order.", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.", { id: toastId });
    }
    setActiveMenuId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    const toastId = toast.loading(`Deleting ${selectedOrders.length} order(s)...`);
    try {
      for (const id of selectedOrders) {
        await fetch(`${API_URL}/orders/${id}`, {
          method: "DELETE",
        });
      }
      toast.success(`Successfully deleted ${selectedOrders.length} order(s)!`, { id: toastId });
      setSelectedOrders([]);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error bulk deleting orders:", error);
      toast.error("Failed to delete all selected orders.", { id: toastId });
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !total) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const toastId = toast.loading(editingOrderId ? "Updating order..." : "Creating order...");

    try {
      const payload = {
        customerName,
        customerEmail,
        total: Number(total),
        paymentStatus,
        paymentMethod,
        fulfillmentStatus,
      };

      let res;
      if (editingOrderId) {
        res = await fetch(`${API_URL}/orders/${editingOrderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        toast.success(editingOrderId ? "Order updated successfully!" : "Order created successfully!", { id: toastId });
        setRefreshTrigger((prev) => prev + 1);
        closeModal();
      } else {
        let errMsg = responseData.message || "Failed to save order.";
        if (responseData.errors) {
          const firstErrKey = Object.keys(responseData.errors)[0];
          if (firstErrKey) {
            errMsg = responseData.errors[firstErrKey];
          }
        }
        toast.error(errMsg, { id: toastId });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order due to network error.", { id: toastId });
    }
  };

  const handleExport = async () => {
    if (selectedOrders.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";
      const toastId = toast.loading(`Preparing zip archive for ${selectedOrders.length} invoice(s)...`);

      try {
        const zip = new JSZip();

        // Fetch each PDF invoice as a blob and append to zip
        for (let i = 0; i < selectedOrders.length; i++) {
          const orderId = selectedOrders[i];
          const order = orders.find((o) => o.id === orderId);
          const orderIdName = order ? order.orderId : `order-${orderId}`;
          const cleanOrderIdName = orderIdName.replace(/#/g, ""); // Clean filename character
          const downloadUrl = `${baseUrl}/orders/${orderId}/invoice/download`;
          
          try {
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Failed to fetch");
            
            const blob = await response.blob();
            // Add file to ZIP folder structure
            zip.file(`invoice-${cleanOrderIdName}.pdf`, blob);
          } catch (err) {
            console.error(`Error adding invoice ${orderIdName} to zip:`, err);
            toast.error(`Could not add invoice for order ${orderIdName} to zip`, { id: toastId });
            return;
          }
        }

        // Generate the ZIP file
        toast.loading("Compiling files into ZIP folder...", { id: toastId });
        const content = await zip.generateAsync({ type: "blob" });

        // Trigger download of the compiled ZIP file
        const blobUrl = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `invoices-export-${new Date().toISOString().slice(0, 10)}.zip`);
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        toast.success("Invoices zip folder downloaded successfully!", { id: toastId });
      } catch (err) {
        console.error("ZIP Generation error:", err);
        toast.error("Failed to generate ZIP archive of invoices.", { id: toastId });
      }
    } else {
      // Export all orders to CSV
      try {
        toast.info("Exporting all orders to CSV...");
        
        const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Total", "Payment Status", "Payment Method", "Fulfillment Status"];
        
        const csvRows = orders.map((o) => [
          o.orderId,
          o.date,
          o.customerName,
          o.customerEmail,
          o.total,
          o.paymentStatus,
          o.paymentMethod,
          o.fulfillmentStatus
        ]);
        
        const csvContent = [headers.join(","), ...csvRows.map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV export downloaded successfully!");
      } catch (err) {
        console.error("CSV Export error:", err);
        toast.error("Failed to export CSV.");
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderPaymentBadge = (p: string) => {
    switch (p) {
      case "Paid":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
            Refunded
          </span>
        );
    }
  };

  const renderFulfillmentBadge = (f: string) => {
    switch (f) {
      case "Delivered":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            Delivered
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
            Shipped
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-700 dark:bg-purple-950/20 dark:text-purple-400">
            Confirmed
          </span>
        );
      case "Packed":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            Packed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50/50 border border-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-950/10 dark:border-blue-900/30 dark:text-blue-350">
            Processing
          </span>
        );
      case "Canceled":
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-700 dark:bg-red-950/20 dark:text-red-400">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
            Returned
          </span>
        );
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Admin</span>
            <svg className="h-3 w-3 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-zinc-600 dark:text-zinc-350">Orders</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">Orders</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage and track customer orders, fulfillment status, and payment processing.</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={handleExport}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold cursor-pointer shadow-xs transition-colors ${
              selectedOrders.length > 0
                ? "border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400"
                : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>{selectedOrders.length > 0 ? `Download Invoices (${selectedOrders.length})` : "Export"}</span>
          </button>
          
          <button
            onClick={handleCreateOrder}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Main Console Box */}
      <div className="rounded-3xl border border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="border-b border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 lg:flex-row lg:items-center">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search orders..."
              value={filterSearch}
              onChange={(e) => {
                setFilterSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative min-w-28">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Status</option>
                <option value="Processing">Processing</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Canceled">Canceled</option>
                <option value="Returned">Returned</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Payment Dropdown */}
            <div className="relative min-w-28">
              <select
                value={selectedPayment}
                onChange={(e) => {
                  setSelectedPayment(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Payment</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Date Range Dropdown */}
            <div className="relative min-w-32">
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-755 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">Date Range</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

        </div>

        {/* Order list representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 w-12 border-0">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-905"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Order ID</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Date</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Customer</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Total</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Payment</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Fulfillment</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px] border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-zinc-400 dark:text-zinc-500 font-bold border-0">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching orders database...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400 border-0">
                    No orders match your search criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isSelected = selectedOrders.includes(o.id);
                  return (
                    <tr
                      key={o.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10 transition-colors border-b border-zinc-100 dark:border-zinc-900/50 last:border-0 ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 border-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(o.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="py-4 px-4 border-0">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(o)}
                          className="text-xs font-black text-blue-600 hover:text-blue-500 dark:text-blue-450 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {o.orderId}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-500 border-0">
                        {o.date}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 border-0">
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-zinc-800 dark:text-white leading-tight">
                            {o.customerName}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                            {o.customerEmail}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-4 text-xs font-black text-zinc-800 dark:text-white border-0">
                        ${o.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 text-xs font-bold border-0 align-middle">
                        <div className="flex flex-col items-start gap-1">
                          {renderPaymentBadge(o.paymentStatus)}
                          <span className="text-[10px] text-zinc-400 capitalize">
                            {o.paymentMethod === "card" 
                              ? "Stripe (Card)" 
                              : o.paymentMethod === "bkash" 
                                ? "bKash" 
                                : o.paymentMethod === "cod"
                                  ? "Cash on Delivery"
                                  : o.paymentMethod || "Stripe (Card)"}
                          </span>
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="py-4 px-4 border-0">
                        {renderFulfillmentBadge(o.fulfillmentStatus)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right relative border-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(o)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleStartEdit(o)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-655 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Edit Order"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === o.id ? null : o.id));
                            }}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-655 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <svg className="h-4 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                        </div>

                        {/* Dropdown overlay */}
                        {activeMenuId === o.id && (
                          <div className="absolute right-6 mt-1.5 w-28 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(o)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Update</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o.id, o.orderId)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-450 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="border-t border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
            Showing {orders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            {/* Dynamic Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`rounded-xl px-3.5 py-2 text-xs font-black cursor-pointer transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-xs shadow-blue-500/10"
                    : "border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                } disabled:opacity-50`}
              >
                {page}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Add / Update Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <svg className="h-5.5 w-5.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5h6.75" />
                  </svg>
                  {editingOrderId ? "Update Order Record" : "Create New Order"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingOrderId ? "Modify fulfillment stages or payment structures." : "Manually log a product order into the admin console."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full bg-zinc-50 dark:bg-zinc-900 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Customer Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Customer Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Total */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Order Total ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 199.00"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all placeholder:text-zinc-400"
                  />
                </div>

                {/* Fulfillment Status */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Fulfillment Status *
                  </label>
                  <div className="relative">
                    <select
                      value={fulfillmentStatus}
                      onChange={(e) => setFulfillmentStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Canceled">Canceled</option>
                      <option value="Returned">Returned</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Payment Status *
                  </label>
                  <div className="relative">
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Payment Method *
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-950 transition-all cursor-pointer"
                    >
                      <option value="card">Stripe (Card)</option>
                      <option value="bkash">bKash</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  {editingOrderId ? "Save Changes" : "Save Order"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Order Summary Modal (READ-ONLY) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-zinc-950 dark:text-white flex items-center gap-2">
                  Order Details Summary
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{viewingOrder.orderId} &bull; {viewingOrder.date}</p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="rounded-full bg-zinc-50 dark:bg-zinc-900 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content summary */}
            <div className="space-y-4 py-2 text-xs">
              
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Customer</span>
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block mt-1">{viewingOrder.customerName}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-medium block mt-0.5">{viewingOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Transaction</span>
                  <span className="font-black text-zinc-800 dark:text-white block mt-1 text-sm">${viewingOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Payment Status</span>
                  {renderPaymentBadge(viewingOrder.paymentStatus)}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Payment Method</span>
                  <span className="text-xs font-black text-zinc-800 dark:text-zinc-300 block mt-1 capitalize">
                    {viewingOrder.paymentMethod === "card" 
                      ? "Stripe (Card)" 
                      : viewingOrder.paymentMethod === "bkash" 
                        ? "bKash" 
                        : viewingOrder.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : viewingOrder.paymentMethod || "Stripe (Card)"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Fulfillment Status</span>
                  {renderFulfillmentBadge(viewingOrder.fulfillmentStatus)}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Order Items (Mocked)</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/50">
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">1x Aura Wireless Earbuds</span>
                    <span className="font-black text-zinc-800 dark:text-zinc-200">${(viewingOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer close */}
            <button
              onClick={() => setViewingOrder(null)}
              className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-extrabold text-white shadow-xs transition-colors cursor-pointer"
            >
              Done / Close
            </button>

          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">
            {selectedOrders.length} order{selectedOrders.length > 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-black text-red-400 hover:text-red-300 dark:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span>Delete Selected</span>
          </button>
        </div>
      )}

    </div>
  );
}
