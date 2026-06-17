"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const [userType, setUserType] = useState("freelancer");
  const [gstRegistered, setGstRegistered] = useState(false);
  const [taxRegime, setTaxRegime] = useState("new");
  const [taxMethod, setTaxMethod] = useState("normal");
  const [monthlyExpenseEstimate, setMonthlyExpenseEstimate] = useState("20000");

  const [error, setError] = useState("");

  async function loadProfile() {
    try {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      setCheckingProfile(false);

      if (data) {
        setFullName(data.full_name || "");

        setCompanyName(data.company_name || "");

        setPhone(data.phone || "");

        setCity(data.city || "");

        setStateName(data.state || "");

        setUserType(data.user_type || "freelancer");

        setGstRegistered(data.gst_registered || false);

        setTaxRegime(data.tax_regime || "new");

        setTaxMethod(data.tax_method || "normal");

        setMonthlyExpenseEstimate(
          String(data.monthly_expense_estimate || 20000),
        );
      }
    } finally {
      setCheckingProfile(false);
    }
  }
  useEffect(() => {
    async function init() {
      await loadProfile();
    }

    init();
  }, []);

  async function handleContinue() {
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: userData.user.id,

      full_name: fullName,

      company_name: companyName,

      phone,

      city,

      state: stateName,

      user_type: userType,

      gst_registered: gstRegistered,

      tax_regime: taxRegime,

      tax_method: taxMethod,

      monthly_expense_estimate: Number(monthlyExpenseEstimate),

      onboarding_completed: true,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  }

  if (checkingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (checkingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading your workspace...</h2>

          <p className="text-gray-500 mt-2">Please wait...</p>
        </div>
      </main>
    );
  }

  if (checkingProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading your dashboard...</h2>

          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome to FinWise</h1>

          <p className="text-gray-500 mt-2">
            Let's personalize your finance workspace.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>

            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Expenses (₹)
            </label>

            <input
              type="number"
              value={monthlyExpenseEstimate}
              onChange={(e) => setMonthlyExpenseEstimate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">State</label>

            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">User Type</label>

          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="freelancer">Freelancer</option>

            <option value="business">Business Owner</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Tax Regime</label>

          <select
            value={taxRegime}
            onChange={(e) => setTaxRegime(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="new">New Regime</option>

            <option value="old">Old Regime</option>
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Tax Method</label>

          <select
            value={taxMethod}
            onChange={(e) => setTaxMethod(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          >
            <option value="normal">Normal Taxation</option>

            <option value="44ada">Section 44ADA</option>

            <option value="44ad">Section 44AD</option>
          </select>
        </div>

        <div className="mt-6 flex items-center justify-between border rounded-xl p-4">
          <span className="font-medium">GST Registered</span>

          <input
            type="checkbox"
            checked={gstRegistered}
            onChange={() => setGstRegistered(!gstRegistered)}
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full mt-8 bg-emerald-600 text-white py-4 rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue to Dashboard"}
        </button>
      </div>
    </main>
  );
}
