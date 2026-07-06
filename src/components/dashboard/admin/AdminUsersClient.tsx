/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Customer" | "Seller";
  joinedDate: string;
  lastLogin: string;
  status: "Active" | "Pending" | "Suspended";
}

const INITIAL_USERS: UserItem[] = [
  {
    id: "user-1",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    role: "Admin",
    joinedDate: "Oct 24, 2024",
    lastLogin: "2 hours ago",
    status: "Active",
  },
  {
    id: "user-2",
    name: "Marcus Reed",
    email: "m.reed@agency.co",
    role: "Customer",
    joinedDate: "Sep 12, 2024",
    lastLogin: "1 day ago",
    status: "Active",
  },
  {
    id: "user-3",
    name: "David Chen",
    email: "david@techcorp.net",
    role: "Seller",
    joinedDate: "Nov 01, 2024",
    lastLogin: "Never",
    status: "Pending",
  },
  {
    id: "user-4",
    name: "Elena Lopez",
    email: "elena.l@demo.com",
    role: "Customer",
    joinedDate: "Jul 15, 2023",
    lastLogin: "2 months ago",
    status: "Suspended",
  },
];

export default function AdminUsersClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:5001/api/v1";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirmation modal states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const [filterSearch, setFilterSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"All Users" | "Customers" | "Sellers" | "Admins">("All Users");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Invite/Edit Modal States
  const [localIsModalOpen, setLocalIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Admin" | "Customer" | "Seller">("Customer");
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");

  // Edit states
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/users`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.data);
        } else {
          toast.error(data.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users from backend.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [API_URL]);

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
      router.replace("/admin/dashboard/users");
    }
    // Clear form inputs
    setName("");
    setEmail("");
    setRole("Customer");
    setStatus("Active");
    setFormErrors({});
    setEditingUserId(null);
  };

  const handleInviteUser = () => {
    setLocalIsModalOpen(true);
  };

  const handleStartEdit = (user: UserItem) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setLocalIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("User deleted successfully!");
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user from server.");
    } finally {
      setDeleteConfirmId(null);
      setDeleteConfirmName("");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    try {
      let successCount = 0;
      for (const id of selectedUsers) {
        const res = await fetch(`${API_URL}/users/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
        }
      }
      setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
      toast.success(`Successfully deleted ${successCount} user(s)!`);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      toast.error("Failed to complete bulk delete operations.");
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick checks
    const clientErrors: Record<string, string> = {};
    if (!name.trim()) clientErrors.name = "Full name is required.";
    if (!email.trim()) {
      clientErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      clientErrors.email = "Please provide a valid email address.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      toast.error("Please fix all form validation errors!");
      return;
    }

    const toastId = toast.loading(editingUserId ? "Updating user details..." : "Inviting user...");

    try {
      const payload = {
        name,
        email,
        role,
        status,
      };

      let res;
      if (editingUserId) {
        res = await fetch(`${API_URL}/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const responseData = await res.json();

      if (res.ok && responseData.success) {
        if (editingUserId) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUserId ? responseData.data : u))
          );
          toast.success("User updated successfully!", { id: toastId });
        } else {
          setUsers((prev) => [responseData.data, ...prev]);
          toast.success("User invited successfully!", { id: toastId });
        }
        closeModal();
      } else {
        if (responseData.errors) {
          setFormErrors(responseData.errors);
          toast.error(responseData.message || "Server validation failed.", { id: toastId });
        } else {
          toast.error(responseData.message || "Failed to submit user details.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Error submitting user details:", error);
      toast.error("An error occurred while saving the user profile.", { id: toastId });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Tabs + Role select filter logic
  const filteredUsers = users.filter((u) => {
    // 1. Search Query
    const matchesSearch =
      u.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(filterSearch.toLowerCase());

    // 2. Tabs selection (All Users, Customers, Sellers, Admins)
    let matchesTab = true;
    if (activeTab === "Customers") matchesTab = u.role === "Customer";
    else if (activeTab === "Sellers") matchesTab = u.role === "Seller";
    else if (activeTab === "Admins") matchesTab = u.role === "Admin";

    // 3. Role selector
    let matchesRole = true;
    if (selectedRoleFilter !== "All") matchesRole = u.role === selectedRoleFilter;

    return matchesSearch && matchesTab && matchesRole;
  });

  const renderRoleBadge = (r: string) => {
    switch (r) {
      case "Admin":
        return (
          <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-150 px-2 py-0.5 text-[10px] font-bold text-indigo-650 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400">
            Admin
          </span>
        );
      case "Seller":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-150 px-2 py-0.5 text-[10px] font-bold text-amber-705 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400">
            Seller
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-650 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-350">
            Customer
          </span>
        );
    }
  };

  const renderStatusBadge = (s: string) => {
    switch (s) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-750 dark:bg-red-950/20 dark:text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Suspended
          </span>
        );
    }
  };

  const renderUserAvatar = (name: string) => {
    const initial = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "US";
    const bgColors = [
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-450",
      "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
      "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    ];
    const colorIndex = name.charCodeAt(0) % bgColors.length;

    return (
      <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-zinc-150 dark:border-zinc-800 font-extrabold text-[11px] uppercase tracking-wider ${bgColors[colorIndex]}`}>
        {initial}
      </div>
    );
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
            <span className="text-zinc-650 dark:text-zinc-350">User Management</span>
          </nav>
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-1">User Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage and monitor customer accounts and administrative roles.</p>
        </div>

        <button
          onClick={handleInviteUser}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer transition-colors self-start sm:self-center"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          <span>Invite User</span>
        </button>
      </div>

      {/* Main Console Box */}
      <div className="rounded-3xl border border-zinc-150 bg-white dark:border-zinc-900 dark:bg-zinc-955 overflow-hidden shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="border-b border-zinc-100 dark:border-zinc-900 px-5 flex items-center overflow-x-auto whitespace-nowrap gap-6">
          {(["All Users", "Customers", "Sellers", "Admins"] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedUsers([]);
                }}
                className={`py-4 text-xs font-extrabold tracking-wide border-b-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Filters Bar */}
        <div className="border-b border-zinc-100 dark:border-zinc-900 p-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          
          {/* Search Field */}
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
            </svg>
            <input
              type="text"
              placeholder="Search users by name, email..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-medium text-zinc-800 outline-none focus:border-zinc-350 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-700 transition-all placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Roles selector dropdown */}
            <div className="relative min-w-32">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-750 appearance-none focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
                <option value="Seller">Seller</option>
              </select>
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Mock button matching screenshot */}
            <button
              onClick={() => toast.info("Advanced filters toggled!")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A50.06 50.06 0 0112 3z" />
              </svg>
              <span>More Filters</span>
            </button>
          </div>

        </div>

        {/* User list representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-0">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <th className="py-4 pl-6 w-12 border-0">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleToggleSelectAll}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-905"
                  />
                </th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">User</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Role</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Joined Date</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Last Login</th>
                <th className="py-4 px-4 font-bold text-[10px] border-0">Status</th>
                <th className="py-4 pr-6 text-right font-bold text-[10px] border-0">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold border-0">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-blue-650" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Fetching users database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-550 font-bold border-0">
                    No users found. Click "Invite User" to add one.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUsers.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-850/10 transition-colors border-b border-zinc-100 dark:border-zinc-900/50 last:border-0 ${
                        isSelected ? "bg-blue-50/20 dark:bg-blue-950/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 pl-6 border-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer dark:border-zinc-800 dark:bg-zinc-950"
                        />
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-4 border-0">
                        <div className="flex items-center gap-3">
                          {renderUserAvatar(u.name)}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-zinc-900 dark:text-white leading-tight">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 border-0">
                        {renderRoleBadge(u.role)}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-500 border-0">
                        {u.joinedDate}
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-500 border-0">
                        {u.lastLogin}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 border-0">
                        {renderStatusBadge(u.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right relative border-0">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-650 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === u.id ? null : u.id));
                            }}
                            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-655 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          >
                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                            </svg>
                          </button>
                        </div>

                        {/* Dropdown overlay */}
                        {activeMenuId === u.id && (
                          <div className="absolute right-6 mt-1.5 w-28 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50 text-left">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(u)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                              <span>Update</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmId(u.id);
                                setDeleteConfirmName(u.name);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-650 hover:bg-red-50 dark:text-red-455 dark:hover:bg-red-955/20 transition-colors cursor-pointer text-left"
                            >
                              <svg className="h-4 w-4 text-red-455" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
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
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-550">
            Showing 1-{filteredUsers.length} of {users.length} users
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            {/* Prev */}
            <button
              onClick={() => toast.info("Opening previous page...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              &lt;
            </button>

            {/* 1 */}
            <button className="rounded-xl bg-blue-600 text-white px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs shadow-blue-500/10">
              1
            </button>

            {/* 2 */}
            <button
              onClick={() => toast.info("Opening page 2...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              2
            </button>

            <span className="text-xs font-bold text-zinc-400 px-1 select-none">...</span>

            {/* Next */}
            <button
              onClick={() => toast.info("Opening next page...")}
              className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-3.5 py-2 text-xs font-extrabold text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* Invite / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <svg className="h-5.5 w-5.5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  {editingUserId ? "Update User Details" : "Invite New User"}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {editingUserId ? "Modify the user's role, login clearance, or profile details." : "Invite a customer, seller, or admin to register an account."}
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
            <form onSubmit={handleSubmitUser} noValidate className="space-y-4">
              
              {/* User Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1.5">
                  User Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.name ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all placeholder:text-zinc-400`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="sarah.j@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${formErrors.email ? "border-red-500 focus:border-red-500" : "border-zinc-250 dark:border-zinc-800"} bg-zinc-50/50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-955 transition-all placeholder:text-zinc-400`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-[10px] mt-1 font-bold">{formErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    User Role *
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-955 transition-all cursor-pointer"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Seller">Seller</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                    Clearance Status *
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 appearance-none focus:outline-none focus:bg-white dark:focus:bg-zinc-955 transition-all cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
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
                  className="flex-1 rounded-xl border border-zinc-250 py-2.5 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-905 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/10 transition-colors cursor-pointer"
                >
                  {editingUserId ? "Save Changes" : "Invite User"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 transition-all scale-100 duration-300 flex flex-col">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirm Delete
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-2.5 leading-relaxed">
              Are you sure you want to delete user account <span className="font-extrabold text-zinc-900 dark:text-white">"{deleteConfirmName}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-5">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName("");
                }}
                className="flex-1 rounded-xl border border-zinc-250 py-2 text-xs font-extrabold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmId)}
                className="flex-1 rounded-xl bg-red-655 hover:bg-red-550 py-2 text-xs font-extrabold text-white shadow-sm shadow-red-500/10 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedUsers.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-955 px-6 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-slide-up">
          <span className="text-xs font-bold text-zinc-305 dark:text-zinc-600">
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300" />
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs font-black text-red-400 hover:text-red-300 dark:text-red-655 dark:hover:text-red-500 transition-colors cursor-pointer"
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
