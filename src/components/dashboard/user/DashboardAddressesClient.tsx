"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Address {
  id: number;
  name: string;
  type: string; // Home, Work, Family
  isPrimary: boolean;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    name: "Alex Morgan",
    type: "Primary Default",
    isPrimary: true,
    line1: "123 Luxury Lane",
    line2: "Apt 4B, The Spire",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    name: "Alex Morgan",
    type: "Work",
    isPrimary: false,
    line1: "Tech Hub Plaza",
    line2: "Suite 800, Building B",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
    phone: "+1 (555) 987-6543",
  },
  {
    id: 3,
    name: "Jordan Lee",
    type: "Family",
    isPrimary: false,
    line1: "456 Oakwood Drive",
    line2: "Subdivision South",
    city: "Seattle",
    state: "WA",
    zip: "98104",
    country: "United States",
    phone: "+1 (555) 246-8101",
  },
];

export default function DashboardAddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentAddressId, setCurrentAddressId] = useState<number | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState("Home");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setName("");
    setType("Home");
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setZip("");
    setCountry("United States");
    setPhone("");
    setIsPrimary(false);
    setCurrentAddressId(null);
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setModalMode("edit");
    setCurrentAddressId(addr.id);
    setName(addr.name);
    setType(addr.type);
    setLine1(addr.line1);
    setLine2(addr.line2 || "");
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.zip);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsPrimary(addr.isPrimary);
    setIsModalOpen(true);
  };

  const handleRemove = (id: number, typeName: string) => {
    setAddresses((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Removed ${typeName} address successfully`);
  };

  const handleSetPrimary = (id: number, typeName: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isPrimary: addr.id === id,
        type: addr.id === id ? "Primary Default" : addr.type === "Primary Default" ? "Home" : addr.type,
      }))
    );
    toast.success(`Set ${typeName} address as your primary default`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !line1 || !city || !state || !zip || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (modalMode === "add") {
      const newAddress: Address = {
        id: Date.now(),
        name,
        type: isPrimary ? "Primary Default" : type,
        isPrimary,
        line1,
        line2,
        city,
        state,
        zip,
        country,
        phone,
      };

      setAddresses((prev) => {
        let updated = [...prev];
        if (isPrimary) {
          // Reset other primary default settings
          updated = updated.map((addr) => ({
            ...addr,
            isPrimary: false,
            type: addr.type === "Primary Default" ? "Home" : addr.type,
          }));
          return [newAddress, ...updated];
        }
        return [...updated, newAddress];
      });

      toast.success("New address added successfully!");
    } else if (modalMode === "edit" && currentAddressId !== null) {
      setAddresses((prev) => {
        let updated = prev.map((addr) => {
          if (addr.id === currentAddressId) {
            return {
              ...addr,
              name,
              type: isPrimary ? "Primary Default" : type === "Primary Default" ? "Home" : type,
              isPrimary,
              line1,
              line2,
              city,
              state,
              zip,
              country,
              phone,
            };
          }
          return addr;
        });

        if (isPrimary) {
          updated = updated.map((addr) => ({
            ...addr,
            isPrimary: addr.id === currentAddressId,
            type: addr.id === currentAddressId ? "Primary Default" : addr.type === "Primary Default" ? "Home" : addr.type,
          }));
        }
        return updated;
      });

      toast.success("Address updated successfully!");
    }

    setIsModalOpen(false);
    resetForm();
  };

  const renderIcon = (type: string) => {
    const normType = type.toLowerCase();
    if (normType.includes("primary") || normType.includes("home") || normType.includes("default")) {
      return (
        <svg className="h-5 w-5 text-zinc-350" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    }
    if (normType.includes("work") || normType.includes("office")) {
      return (
        <svg className="h-5 w-5 text-zinc-350" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5M13.5 16.5H15" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5 text-zinc-350" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 21c-2.24 0-4.367-.64-6.173-1.763A11.37 11.37 0 0110 18c2.23 0 4.29.64 6 1.73M13.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM18 10a2.499 2.499 0 11-5 0 2.499 2.499 0 015 0z" />
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Overview page header segment */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-zinc-100 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif uppercase">
            My Addresses
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Manage your shipping and billing addresses for a faster checkout.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Grid listing addresses cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-2xl border bg-white dark:bg-zinc-900/50 p-5 shadow-xs transition-all relative flex flex-col justify-between ${
              addr.isPrimary
                ? "border-blue-200 dark:border-blue-900 shadow-sm ring-1 ring-blue-50 dark:ring-blue-950/20"
                : "border-zinc-200/80 dark:border-zinc-800 hover:shadow-sm"
            }`}
          >
            {/* Header badges & indicators */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-extrabold text-zinc-905 dark:text-white font-serif">
                  {addr.name}
                </h4>
                <span className={`inline-block text-[9px] font-black uppercase mt-1 px-2.5 py-0.5 rounded-full tracking-wide ${
                  addr.isPrimary
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {addr.type}
                </span>
              </div>
              <span className="shrink-0">{renderIcon(addr.type)}</span>
            </div>

            {/* Address body fields */}
            <div className="space-y-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1 pt-2">
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city}, {addr.state} {addr.zip}</p>
              <p>{addr.country}</p>
              <div className="flex items-center gap-2 mt-4 text-zinc-650 dark:text-zinc-300 font-bold">
                <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.557-5.183-3.916-6.74-6.74l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.628a1.125 1.125 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
                </svg>
                <span>{addr.phone}</span>
              </div>
            </div>

            {/* Footer border split links */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4.5 mt-5 flex items-center justify-between text-xs font-bold">
              <button
                onClick={() => handleOpenEdit(addr)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 20.082a4.5 4.5 0 01-2.052 1.243l-2.793.682.682-2.793a4.5 4.5 0 011.243-2.052L16.862 4.487z" />
                </svg>
                <span>Edit</span>
              </button>

              {addr.isPrimary ? (
                <button
                  onClick={() => handleRemove(addr.id, addr.type)}
                  className="flex items-center gap-1.5 text-red-650 hover:text-red-500 cursor-pointer transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  <span>Remove</span>
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSetPrimary(addr.id, addr.type)}
                    className="flex items-center gap-1.5 text-blue-650 hover:text-blue-550 cursor-pointer transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                    <span>Set Primary</span>
                  </button>
                  <button
                    onClick={() => handleRemove(addr.id, addr.type)}
                    className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors"
                    title="Remove address"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* FORM OVERLAY MODAL (ADD / EDIT) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4 sm:p-6">
          
          {/* Backdrop Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />

          {/* Form wrapper */}
          <form
            onSubmit={handleSubmit}
            className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-55 space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-serif uppercase tracking-wide">
                {modalMode === "add" ? "Add New Address" : "Edit Address"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Specify your delivery details below.</p>
            </div>

            {/* Inputs grid layout */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              
              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Address Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                >
                  <option>Home</option>
                  <option>Work</option>
                  <option>Family</option>
                  <option>Shipping</option>
                  <option>Billing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="Street address or P.O. Box"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apt, Suite, Unit, Building, Floor, etc."
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">City *</label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">State / Province *</label>
                <input
                  type="text"
                  required
                  placeholder="State/Province"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">ZIP / Postal Code *</label>
                <input
                  type="text"
                  required
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-600 dark:text-zinc-400">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 px-3.5 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

            </div>

            {/* Set as Primary Default selection */}
            <div className="flex items-center gap-2 pt-2 select-none">
              <input
                type="checkbox"
                id="isPrimaryCheckbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-200 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
              />
              <label htmlFor="isPrimaryCheckbox" className="text-xs font-bold text-zinc-650 dark:text-zinc-400 cursor-pointer">
                Set as primary default address
              </label>
            </div>

            {/* Footer Buttons Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-350 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {modalMode === "add" ? "Save Address" : "Save Changes"}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
