"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { calculate44ADA, calculate44AD } from "@/lib/presumptiveTax";
import { createClient } from "@/lib/supabase";
import UserMenu from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import UserDropdown from "@/components/UserDropdown";
import { calculateHealthScore } from "@/lib/healthScore";
import IncomeTrendChart from "@/components/charts/IncomeTrendChart";
import ExpensePieChart from "@/components/charts/ExpensePieChart";

import {
  calculateFullTaxBreakdown,
  getNextAdvanceTaxDueDate,
  TaxRegime,
} from "@/lib/taxLogic";
import TaxDisclaimer from "@/components/TaxDisclaimer";

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        setLoading(false);
        return;
      }
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      setProfile(profileData);

      if (!profileData?.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }

      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const { data: incomeData } = await supabase
        .from("income_entries")
        .select("amount")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startOfMonth);
      const incomeTotal = (incomeData || []).reduce(
        (s, e) => s + Number(e.amount),
        0,
      );
      setMonthlyIncome(incomeTotal);

      const { data: expenses } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startOfMonth);

      const expenseTotal = (expenses || []).reduce(
        (s, e) => s + Number(e.amount),
        0,
      );

      setMonthlyExpenses(expenseTotal);

      const grouped = (expenses || []).reduce((acc: any, item: any) => {
        const category = item.category || "Other";

        acc[category] = (acc[category] || 0) + Number(item.amount);

        return acc;
      }, {});

      setExpenseData(
        Object.entries(grouped).map(([name, value]) => ({
          name,
          value,
        })),
      );

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-50 p-10">
        <p className="text-gray-700">Please complete your settings first.</p>
        <Link href="/settings" className="text-emerald-600 underline">
          Go to settings
        </Link>
      </main>
    );
  }
  setCheckingAuth(false);

  const annualProjected = monthlyIncome * 12;

  let taxableIncome = annualProjected;

  if (profile.tax_method === "44ada") {
    taxableIncome = calculate44ADA(annualProjected).taxableIncome;
  }

  if (profile.tax_method === "44ad") {
    taxableIncome = calculate44AD(annualProjected).taxableIncome;
  }

  const breakdown = calculateFullTaxBreakdown(
    monthlyIncome,
    taxableIncome,
    profile.tax_regime as TaxRegime,
    profile.gst_registered,
    profile.monthly_expense_estimate || 0,
  );

  const healthScore = calculateHealthScore(
    monthlyIncome,
    monthlyExpenses,
    profile.gst_registered,
    profile.onboarding_completed,
  );

  const nextDue = getNextAdvanceTaxDueDate();

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold">Loading your workspace...</h2>

          <p className="text-gray-500 mt-2">Please wait a moment.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="w-full px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{profile.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="text-gray-500 text-sm mt-1 capitalize">
              {profile.user_type}
            </p>
          </div>

          <UserDropdown name={profile.full_name} userType={profile.user_type} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Financial Health
          </p>

          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {healthScore.score}/100
          </p>

          <p className="text-sm text-gray-500 mt-1">{healthScore.status}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Income this month
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₹{monthlyIncome.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Tax to set aside
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ₹{breakdown.incomeTax.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-emerald-600 rounded-xl p-5">
            <p className="text-xs text-emerald-100 uppercase tracking-wide">
              Safe to spend
            </p>
            <p className="text-2xl font-bold text-white mt-1">
              ₹{Math.max(0, breakdown.safeToSpend).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Tax Method */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Tax Method
          </p>

          <p className="text-xl font-bold mt-2">
            {profile.tax_method === "44ada"
              ? "44ADA"
              : profile.tax_method === "44ad"
                ? "44AD"
                : "Normal"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profile.gst_registered && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-700 mb-1">
                GST collected this month
              </p>
              <p className="text-xl font-semibold text-gray-900">
                ₹{breakdown.gstAmount.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Next advance tax due
            </p>
            <p className="text-xl font-semibold text-gray-900">{nextDue}</p>
            <p className="text-xs text-gray-500 mt-1">
              Est. ₹{breakdown.advanceTaxThisQuarter.toLocaleString("en-IN")}{" "}
              this installment
            </p>
          </div>
          {profile.user_type === "business" && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Expenses this month
              </p>
              <p className="text-xl font-semibold text-red-600">
                ₹{monthlyExpenses.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Net profit this month
            </p>
            <p className="text-xl font-semibold text-gray-900">
              ₹{(monthlyIncome - monthlyExpenses).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <Link
            href="/income"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700"
          >
            Add income
          </Link>
          {profile.user_type === "business" && (
            <Link
              href="/expenses"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Add expense
            </Link>
          )}
        </div>

        <div className="mb-6 w-full hiddenscrollbar">
          <IncomeTrendChart income={monthlyIncome} />
          <ExpensePieChart data={expenseData} />
        </div>

        <TaxDisclaimer />
      </div>
    </main>
  );
}
