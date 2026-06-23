"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBlocker from "@/components/MobileBlocker";

export default function SettingsPage() {
  const supabase = createClient();
  const [userType, setUserType] = useState("freelancer");
  const [gstRegistered, setGstRegistered] = useState(false);
  const [taxRegime, setTaxRegime] = useState("new");
  const [taxMethod, setTaxMethod] = useState("normal");
  const [monthlyExpenseEstimate, setMonthlyExpenseEstimate] = useState("20000");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [companyAddress, setCompanyAddress] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      if (data) {
        setUserType(data.user_type || "freelancer");
        setGstRegistered(data.gst_registered || false);
        setTaxRegime(data.tax_regime || "new");
        setTaxMethod(data.tax_method || "normal");
        setMonthlyExpenseEstimate(
          String(data.monthly_expense_estimate || 20000),
        );
        setFullName(data.full_name || "");
        setGstNumber(data.gst_number || "");
        setCompanyAddress(data.company_address || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id: userData.user.id,
      full_name: fullName,
      user_type: userType,
      gst_registered: gstRegistered,
      tax_regime: taxRegime,
      tax_method: taxMethod,
      monthly_expense_estimate: Number(monthlyExpenseEstimate),
      gst_number: gstNumber,

      company_address: companyAddress,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      return;
    }

    try {
      setDeleting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }
      setDeleteModalOpen(false);
      setDeleteConfirm("");

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error(error);

      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return <MobileBlocker />;
  }

  if (loading) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-10">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Manage your tax preferences, GST information and business profile.
        </p>

        <form
          onSubmit={handleSave}
          className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-6
space-y-6
"
        >
          <div>
            <div className="pb-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your profile information.
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="
      w-full
      bg-white dark:bg-zinc-950
      border border-gray-300 dark:border-zinc-700
      text-gray-900 dark:text-white
      rounded-xl
      px-4 py-3
      focus:outline-none
      focus:ring-2
      focus:ring-emerald-500
    "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("freelancer")}
                className={`border rounded-lg px-4 py-3 text-sm font-medium ${userType === "freelancer" ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400"}`}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => setUserType("business")}
                className={`border rounded-lg px-4 py-3 text-sm font-medium ${userType === "business" ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400"}`}
              >
                Business owner
              </button>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Information
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Information used on invoices and reports.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GST Number</label>

            <input
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4
py-3
"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Company Address
            </label>

            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4
py-3
"
            />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tax Preferences
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure GST and taxation settings.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax regime
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaxRegime("new")}
                className={`border rounded-lg px-4 py-3 text-sm font-medium ${taxRegime === "new" ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400"}`}
              >
                New regime
              </button>
              <button
                type="button"
                onClick={() => setTaxRegime("old")}
                className={`border rounded-lg px-4 py-3 text-sm font-medium ${taxRegime === "old" ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400"}`}
              >
                Old regime
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              GST registered?
            </label>
            <button
              type="button"
              onClick={() => setGstRegistered(!gstRegistered)}
              className={`w-12 h-6 rounded-full relative transition ${gstRegistered ? "bg-emerald-600" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${gstRegistered ? "translate-x-6" : ""}`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax Method
            </label>

            <select
              value={taxMethod}
              onChange={(e) => setTaxMethod(e.target.value)}
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
            >
              <option value="normal">Normal Taxation</option>

              <option value="44ada">Section 44ADA (Professionals)</option>

              <option value="44ad">Section 44AD (Businesses)</option>
            </select>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Choose how your taxable income should be calculated.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated monthly expenses (₹)
            </label>
            <input
              type="text"
              value={monthlyExpenseEstimate}
              onChange={(e) => setMonthlyExpenseEstimate(e.target.value)}
              className="
 w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-xl
px-4
py-3
"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Used to calculate your safe-to-spend amount.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Site Settings
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark Mode
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable dark appearance across FinWise.
                </p>
              </div>

              <ThemeToggle />
            </div>
          </div>
          <div
            className="
  mt-6
  pt-6

  border border-red-200
  dark:border-red-900/50

  bg-red-50/50
  dark:bg-red-950/20

  rounded-2xl
  p-6
  "
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Danger Zone
                </h2>

                <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-2">
                  Permanently delete your account and all associated financial
                  data. This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="
  bg-red-600
  hover:bg-red-700

  text-white

  px-5 py-3
  rounded-xl

  font-medium
  transition

  whitespace-nowrap
  "
              >
                Delete Account
              </button>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-200 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving}
              className="
    bg-emerald-600
    hover:bg-emerald-700
    text-white
    px-6
    py-3
    rounded-xl
    font-medium
    "
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>

            {saved && (
              <span className="ml-4 text-emerald-600 dark:text-emerald-400">
                ✓ Settings saved successfully
              </span>
            )}
          </div>
        </form>
        <TaxDisclaimer />
      </div>
      {deleteModalOpen && (
        <div
          className="
    fixed inset-0 z-[9999]

    bg-black/60
    backdrop-blur-sm

    flex items-center justify-center

    p-4
    "
        >
          <div
            className="
      w-full max-w-md

      bg-white dark:bg-zinc-900

      border border-gray-200 dark:border-zinc-800

      rounded-2xl

      p-6
      "
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Delete Account
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Deleting your account will permanently remove your profile,
              invoices, income records, expense records and all associated
              FinWise data.
            </p>

            <p className="text-sm text-red-500 mt-3 font-medium">
              This action cannot be undone.
            </p>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type DELETE to confirm
              </label>

              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="
          w-full

          bg-white dark:bg-zinc-950

          border border-gray-300 dark:border-zinc-700

          text-gray-900 dark:text-white

          rounded-xl

          px-4 py-3
          "
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirm("");
                }}
                className="
          px-4 py-2

          rounded-xl

          border border-gray-300 dark:border-zinc-700

          text-gray-900 dark:text-white
          "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="
          px-4 py-2

          rounded-xl

          bg-red-600
          hover:bg-red-700

          text-white

          disabled:opacity-50
          disabled:cursor-not-allowed
          "
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
