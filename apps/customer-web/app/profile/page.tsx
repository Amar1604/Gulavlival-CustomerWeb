"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Lock,
  ShoppingBag,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  Briefcase,
  Building,
  Save,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { BackButton } from "@/components/ui/back-button";
import { UserAddress } from "@/types";

type ActiveTab = "profile" | "addresses" | "security";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as ActiveTab) || "profile";

  const { user, isAuthenticated, updateUser, logout } = useAuthStore();
  const [currentTab, setCurrentTab] = useState<ActiveTab>(initialTab);

  // Profile details edit state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrLine, setAddrLine] = useState("");
  const [addrLandmark, setAddrLandmark] = useState("");
  const [addrCity, setAddrCity] = useState("Gulavlival");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("gg_access_token");
    if (!token && !isAuthenticated) {
      router.push("/login?redirect=/profile");
      return;
    }

    if (user) {
      setName(user.name || "");
      setMobile(user.mobile || "");
      setEmail(user.email || "");
    }
  }, [user, isAuthenticated, router]);

  // Load addresses when addresses tab is opened
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const data = await apiFetch<UserAddress[]>("/addresses");
      setAddresses(data);
    } catch {
      // Ignore or empty
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);

    try {
      const updated = await apiFetch<{
        id: string;
        name: string;
        mobile: string;
        email?: string;
        is_active: boolean;
      }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || null,
        }),
      });

      updateUser({
        name: updated.name,
        mobile: updated.mobile,
        email: updated.email,
      });

      setProfileSuccess("Your profile details have been saved successfully.");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Save Address (Create or Edit)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError(null);

    if (!addrLine.trim()) {
      setAddrError("Please enter your complete address line.");
      return;
    }

    setAddrSaving(true);

    try {
      if (editingAddressId) {
        await apiFetch(`/addresses/${editingAddressId}`, {
          method: "PUT",
          body: JSON.stringify({
            label: addrLabel,
            address_line: addrLine.trim(),
            landmark: addrLandmark.trim() || null,
            city: addrCity.trim(),
            pincode: addrPincode.trim() || null,
            is_default: addrIsDefault,
          }),
        });
      } else {
        await apiFetch("/addresses", {
          method: "POST",
          body: JSON.stringify({
            label: addrLabel,
            address_line: addrLine.trim(),
            landmark: addrLandmark.trim() || null,
            city: addrCity.trim(),
            pincode: addrPincode.trim() || null,
            is_default: addrIsDefault,
          }),
        });
      }

      await fetchAddresses();
      closeAddressModal();
    } catch (err: any) {
      setAddrError(err.message || "Failed to save address.");
    } finally {
      setAddrSaving(false);
    }
  };

  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddrLabel("Home");
    setAddrLine("");
    setAddrLandmark("");
    setAddrCity("Gulavlival");
    setAddrPincode("");
    setAddrIsDefault(addresses.length === 0);
    setAddrError(null);
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label || "Home");
    setAddrLine(addr.address_line);
    setAddrLandmark(addr.landmark || "");
    setAddrCity(addr.city || "Gulavlival");
    setAddrPincode(addr.pincode || "");
    setAddrIsDefault(addr.is_default);
    setAddrError(null);
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      await apiFetch(`/addresses/${id}`, { method: "DELETE" });
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || "Failed to delete address.");
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match. Please re-enter.");
      return;
    }

    setPwSaving(true);

    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      setPwSuccess("Your password has been successfully updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwError(err.message || "Failed to change password. Please verify your current password.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("home")) return <Home className="w-4 h-4 text-amber-600" />;
    if (l.includes("work") || l.includes("office")) return <Briefcase className="w-4 h-4 text-blue-600" />;
    return <Building className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton label="Back to Restaurant Menu" fallbackHref="/" />
        <Link
          href="/orders"
          className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/80 transition"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>View My Orders</span>
        </Link>
      </div>

      {/* Hero Customer Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-warm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "GG"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
                {user?.name || "Customer Account"}
              </h1>
              <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {user?.mobile || ""} {user?.email ? `• ${user.email}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 text-xs font-semibold transition self-end sm:self-center"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setCurrentTab("profile")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition ${
            currentTab === "profile"
              ? "border-amber-600 text-amber-900 dark:border-amber-500 dark:text-amber-400 font-bold"
              : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          onClick={() => setCurrentTab("addresses")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition ${
            currentTab === "addresses"
              ? "border-amber-600 text-amber-900 dark:border-amber-500 dark:text-amber-400 font-bold"
              : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setCurrentTab("security")}
          className={`pb-3 px-1 border-b-2 flex items-center gap-2 transition ${
            currentTab === "security"
              ? "border-amber-600 text-amber-900 dark:border-amber-500 dark:text-amber-400 font-bold"
              : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* TAB 1: Personal Details */}
      {currentTab === "profile" && (
        <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-2xs space-y-6 transition-colors">
          <div>
            <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Personal Information
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Update your contact details for ordering and reservation updates
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-warm flex items-center gap-2 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileSaving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Saved Addresses */}
      {currentTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
                Delivery Addresses
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Save your home, office, or hotel room for instant 1-click checkout
              </p>
            </div>

            <button
              onClick={openNewAddressModal}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-warm flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {addressesLoading ? (
            <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
              Loading saved addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 text-center space-y-3">
              <MapPin className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h3 className="font-display font-bold text-base text-neutral-800 dark:text-neutral-200">
                No addresses saved yet
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Add your home or hotel address now so your food can be delivered without typing each time.
              </p>
              <button
                onClick={openNewAddressModal}
                className="inline-block bg-amber-600 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-warm"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white dark:bg-neutral-900 p-5 rounded-2xl border transition relative ${
                    addr.is_default
                      ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-100 dark:ring-amber-950/60 shadow-sm"
                      : "border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        {getLabelIcon(addr.label)}
                      </div>
                      <span className="font-display font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {addr.label}
                      </span>
                    </div>

                    {addr.is_default && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                    {addr.address_line}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {addr.city} {addr.pincode ? `- ${addr.pincode}` : ""}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openEditAddressModal(addr)}
                      className="flex items-center gap-1 font-semibold text-neutral-600 dark:text-neutral-300 hover:text-amber-700 dark:hover:text-amber-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="flex items-center gap-1 font-semibold text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Security & Change Password */}
      {currentTab === "security" && (
        <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-2xs space-y-6 transition-colors">
          <div>
            <h2 className="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
              Change Account Password
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Ensure your account is protected with a secure password
            </p>
          </div>

          {pwSuccess && (
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 dark:text-green-400" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                New Password
              </label>
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={pwSaving}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-warm flex items-center gap-2 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{pwSaving ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Edit/Create Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
                {editingAddressId ? "Edit Address" : "Add Delivery Address"}
              </h3>
              <button
                onClick={closeAddressModal}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {addrError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{addrError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddrLabel(lbl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        addrLabel === lbl
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                  Flat / House / Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flat 302, Royal Palms, Rajpur Road"
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near Clock Tower"
                    value={addrLandmark}
                    onChange={(e) => setAddrLandmark(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="248001"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addrSaving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-warm disabled:opacity-60"
                >
                  {addrSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs">Loading profile hub...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
