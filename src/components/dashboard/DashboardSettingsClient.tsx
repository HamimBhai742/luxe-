"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function DashboardSettingsClient() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile Form States
  const [name, setName] = useState("Alex Morgan");
  const [username, setUsername] = useState("alexmorgan");
  const [email] = useState("alex.morgan@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [location, setLocation] = useState("New York, USA");
  const [website, setWebsite] = useState("https://alexmorgan.design");
  const [twitter, setTwitter] = useState("https://twitter.com/alexmorgan");
  const [bio, setBio] = useState("Minimalist designer, tech enthusiast, and Premium Member.");
  const [workspaceStyle, setWorkspaceStyle] = useState("Minimalist / Dark");
  const [avatarUrl, setAvatarUrl] = useState(
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  );

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Security & Notification Toggles
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Profile picture updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !username.trim()) {
      toast.error("Name, Username, and Phone fields are required.");
      return;
    }
    toast.success("Profile details updated successfully!");
    setIsEditing(false);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    toast.success("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactor;
    setTwoFactor(nextVal);
    if (nextVal) {
      toast.success("Two-Factor Authentication (2FA) enabled successfully!");
    } else {
      toast.info("Two-Factor Authentication (2FA) disabled.");
    }
  };

  const handleToggleAlerts = () => {
    setLoginAlerts(!loginAlerts);
    toast.success("Alert preferences updated successfully.");
  };

  const handleToggleMarketing = () => {
    setMarketingEmails(!marketingEmails);
    toast.success("Newsletter preferences updated successfully.");
  };

  return (
    <div className="space-y-8 pb-16 select-none">
      
      {/* Title Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-serif uppercase">
          Account Settings
        </h1>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your profile, password credentials, and security preferences.
        </p>
      </div>

      {/* Grid Layout Container */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Tab Menu Selector */}
        <div className="w-full md:w-64 flex flex-col gap-1 shrink-0 bg-white dark:bg-zinc-900/50 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          
          {/* Tab 1: Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === "profile"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-l-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>Public Profile</span>
          </button>

          {/* Tab 2: Security */}
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === "security"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-l-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Security & Password</span>
          </button>

          {/* Tab 3: Notifications */}
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all cursor-pointer text-left ${
              activeTab === "notifications"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border-l-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span>Notifications</span>
          </button>

        </div>

        {/* Right Column: Settings Card Forms */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs relative">
          
          {/* TAB CONTENT: PROFILE */}
          {activeTab === "profile" && (
            <div className="relative">
              {/* Graphic Banner */}
              <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-650 relative" />

              {/* Hidden File Input */}
              <input
                type="file"
                id="settings-avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={!isEditing}
                className="hidden"
              />

              {/* Avatar Floating Overhang with Camera Overlay and Badge */}
              <div className="absolute top-16 left-8 flex items-end gap-4">
                
                {/* Photo hover camera block */}
                <div
                  onClick={() => {
                    if (!isEditing) {
                      toast.info("Please click the Edit Profile button to modify your photo");
                    }
                  }}
                  className="relative group cursor-pointer h-20 w-20 rounded-full shrink-0 shadow-md"
                >
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-full w-full rounded-full object-cover border-4 border-white dark:border-zinc-900 shrink-0"
                  />
                  
                  {/* Camera overlay */}
                  {isEditing && (
                    <label
                      htmlFor="settings-avatar-input"
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </label>
                  )}

                  {/* Corner Badge Camera */}
                  {isEditing && (
                    <label
                      htmlFor="settings-avatar-input"
                      className="absolute bottom-0 right-0 h-6.5 w-6.5 rounded-full bg-blue-600 border border-white dark:border-zinc-900 flex items-center justify-center text-white cursor-pointer shadow-sm hover:bg-blue-500 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                    </label>
                  )}

                </div>

                {isEditing && (
                  <div className="pb-1">
                    <label
                      htmlFor="settings-avatar-input"
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-xs inline-block"
                    >
                      Upload Photo
                    </label>
                  </div>
                )}

              </div>

              {/* Grid split inside profile panel: 2 columns left, 1 column right profile completion */}
              <div className="pt-12 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Side: General Profile & Socials Form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase">
                        Profile details
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1">Configure your personal public setup.</p>
                    </div>
                    
                    {/* EDIT PROFILE TOGGLE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[10px] font-black uppercase tracking-wider shadow-xs cursor-pointer transition-all ${
                        isEditing
                          ? "bg-red-50 text-red-600 border-red-200/50 hover:bg-red-100/30 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-55 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-850"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Cancel Edit</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                          <span>Edit Profile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs font-bold text-left">
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Full Name *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          <input
                            type="text"
                            required
                            disabled={!isEditing}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-550 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Username *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-zinc-400 font-bold text-sm">@</span>
                          <input
                            type="text"
                            required
                            disabled={!isEditing}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full rounded-xl border pl-9 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Email address */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Email Address</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          <input
                            type="email"
                            disabled
                            value={email}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-150/50 dark:bg-zinc-950/50 pl-10 pr-20 py-2.5 font-semibold text-zinc-400 cursor-not-allowed outline-none"
                          />
                          <span className="absolute right-3.5 top-3 flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                            &#8226; Verified
                          </span>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Phone Number *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.557-5.183-3.916-6.74-6.74l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.628a1.125 1.125 0 00-1.091-.852H4.25a2.25 2.25 0 00-2.25 2.25v2.25z" />
                          </svg>
                          <input
                            type="text"
                            required
                            disabled={!isEditing}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-550 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Location *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
                          </svg>
                          <input
                            type="text"
                            required
                            disabled={!isEditing}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Website url */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Website / Portfolio</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                          </svg>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Twitter X profile */}
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Twitter / X handle</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <input
                            type="text"
                            disabled={!isEditing}
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-semibold outline-none transition-colors ${
                              isEditing
                                ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                                : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Bio info */}
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Bio Summary</label>
                        <textarea
                          rows={3}
                          disabled={!isEditing}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className={`w-full rounded-xl border px-3.5 py-2.5 font-semibold outline-none resize-none transition-colors ${
                            isEditing
                              ? "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:border-blue-500 dark:focus:border-blue-500"
                              : "border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                        >
                          Save Profile
                        </button>
                      </div>
                    )}
                  </form>

                </div>

                {/* Right Side: Profile Completion Box & Workspace Aesthetic Preference */}
                <div className="space-y-6 lg:border-l lg:border-zinc-200 dark:lg:border-zinc-800 lg:pl-8">
                  
                  {/* Card: Profile Completion */}
                  <div className="rounded-2xl border border-zinc-250 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-950/20 text-left space-y-4">
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Setup Completion
                    </h4>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-600 dark:text-zinc-400">
                        <span>Overall Progress</span>
                        <span className="text-blue-600 dark:text-blue-400">85%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-blue-600 rounded-full" />
                      </div>
                    </div>

                    {/* Task checklist */}
                    <div className="space-y-2.5 pt-2 text-[10px] font-bold text-zinc-500">
                      <div className="flex items-center gap-2">
                        <svg className="h-4.5 w-4.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="line-through text-zinc-400 dark:text-zinc-600">Verify email address</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4.5 w-4.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span className="line-through text-zinc-400 dark:text-zinc-600">Provide phone number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4.5 w-4.5 text-blue-600 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span className="text-zinc-700 dark:text-zinc-300">Link default billing card</span>
                      </div>
                    </div>
                  </div>

                  {/* Card: Workspace Setup Aesthetic Selector */}
                  <div className="rounded-2xl border border-zinc-250 dark:border-zinc-800 p-5 bg-zinc-50/50 dark:bg-zinc-950/20 text-left space-y-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">
                        Workspace Aesthetic
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-semibold mt-0.5 leading-relaxed">
                        Customize recommendations matching your design taste.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {["Minimalist / Dark", "RGB Gaming setup", "Studio Producer Studio"].map((pref) => (
                        <div
                          key={pref}
                          onClick={() => {
                            if (!isEditing) {
                              toast.info("Please click the Edit Profile button to modify your workspace style preference");
                              return;
                            }
                            setWorkspaceStyle(pref);
                            toast.info(`Updated aesthetic preference to: ${pref}`);
                          }}
                          className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                            isEditing ? "cursor-pointer" : "cursor-not-allowed opacity-80"
                          } ${
                            workspaceStyle === pref
                              ? "border-blue-600 bg-blue-50/10 text-blue-600"
                              : "border-zinc-200 hover:border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-750 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <span className="text-[10px] font-bold">{pref}</span>
                          {workspaceStyle === pref && (
                            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: SECURITY */}
          {activeTab === "security" && (
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Change password details */}
              <div className="space-y-6">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase">
                    Change Password
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Verify credentials to update your password details.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5 text-xs font-bold text-left">
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-600 dark:text-zinc-400">Current Password *</label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                        </svg>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">New Password *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                          </svg>
                          <input
                            type="password"
                            required
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <label className="text-zinc-600 dark:text-zinc-400">Confirm New Password *</label>
                        <div className="relative">
                          <svg className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5m-3.75 3h15.75m-15.75 0a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h15.75a2.25 2.25 0 002.25-2.25v-3a2.25 2.25 0 00-2.25-2.25M3 10.5h18" />
                          </svg>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 pl-10 pr-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 px-5 py-2.5 text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Two factor check card layout */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50/40 dark:bg-zinc-900/30 flex justify-between items-center gap-6 shadow-xs">
                  <div className="flex gap-4 items-start">
                    <span className="rounded-xl bg-blue-50 dark:bg-blue-950/20 p-2 text-blue-600 shrink-0 border border-blue-100/30">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                    </span>
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 leading-relaxed">
                        Add an extra layer of protection to your account by requesting passcodes upon logins.
                      </p>
                    </div>
                  </div>
                  
                  {/* Slider Toggle */}
                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className={`w-9.5 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer shrink-0 ${
                      twoFactor ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        twoFactor ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB CONTENT: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white font-serif uppercase">
                  Notification settings
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-1">Configure when and how we contact you.</p>
              </div>

              {/* Toggles List */}
              <div className="space-y-5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                
                {/* 1. Security alerts */}
                <div className="flex justify-between items-center gap-4 text-left">
                  <div className="space-y-1 pr-2">
                    <h4 className="text-zinc-900 dark:text-white font-serif">Security Alerts</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                      Notify me of unrecognized login attempts or passcode adjustments instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAlerts}
                    className={`w-9.5 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer shrink-0 ${
                      loginAlerts ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        loginAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                {/* 2. Marketing alerts */}
                <div className="flex justify-between items-center gap-4 text-left">
                  <div className="space-y-1 pr-2">
                    <h4 className="text-zinc-900 dark:text-white font-serif">Marketing Newsletters</h4>
                    <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                      Receive discount codes, seasonal collections news, and tech setup upgrade suggestions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleMarketing}
                    className={`w-9.5 h-5.5 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer shrink-0 ${
                      marketingEmails ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        marketingEmails ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
