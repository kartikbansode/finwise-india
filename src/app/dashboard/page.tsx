"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { calculate44ADA, calculate44AD } from "@/lib/presumptiveTax";
import { createClient } from "@/lib/supabase";
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
        setCheckingAuth(false);
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

      setCheckingAuth(false);
      setLoading(false);
    }

    load();
  }, []);
  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold">Loading your workspace...</h2>

          <p
            className="text-gray-500
dark:text-gray-400 mt-2"
          >
            Please wait a moment.
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-10">
        <p className="text-gray-700 dark:text-gray-300">
          Please complete your settings first.
        </p>
        <Link href="/settings" className="text-emerald-600 underline">
          Go to settings
        </Link>
      </main>
    );
  }

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

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  const taxReserve = breakdown.incomeTax;

  const savingsRate =
    monthlyIncome > 0 ? Math.round((monthlyProfit / monthlyIncome) * 100) : 0;

  const expenseRatio =
    monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;

  const nextDue = getNextAdvanceTaxDueDate();

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
          <div
            className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-2xl p-8 lg:max-w-2xl"
          >
            <p
              className="text-sm text-gray-500
dark:text-gray-400"
            >
              Financial Overview
            </p>

            <h2 className="text-4xl font-bold mt-3 text-gray-900 dark:text-white">
              ₹{Math.max(0, breakdown.safeToSpend).toLocaleString("en-IN")}
            </h2>

            <p
              className="text-gray-500
dark:text-gray-400 mt-2"
            >
              Available Balance
            </p>

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <p
                  className="text-xs text-gray-500
dark:text-gray-400"
                >
                  Income
                </p>

                <p className="font-semibold text-lg">
                  ₹{monthlyIncome.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p
                  className="text-xs text-gray-500
dark:text-gray-400"
                >
                  Expenses
                </p>

                <p className="font-semibold text-lg">
                  ₹{monthlyExpenses.toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p
                  className="text-xs text-gray-500
dark:text-gray-400"
                >
                  Profit
                </p>

                <p className="font-semibold text-lg">
                  ₹{monthlyProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <UserDropdown name={profile.full_name} userType={profile.user_type} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className="
    rounded-2xl
    border border-emerald-500/20
    bg-emerald-50
    dark:bg-emerald-950/30
    p-5
  "
          >
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Monthly Profit
            </p>

            <p className="text-3xl font-bold text-emerald-800 dark:text-emerald-300 mt-3">
              ₹{monthlyProfit.toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="
    rounded-2xl
    border border-blue-500/20
    bg-blue-50
    dark:bg-blue-950/30
    p-5
  "
          >
            <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-400">
              Savings Rate
            </p>

            <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-3">
              {savingsRate}%
            </p>
          </div>

          <div
            className="
    rounded-2xl
    border border-amber-500/20
    bg-amber-50
    dark:bg-amber-950/30
    p-5
  "
          >
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Tax Reserve
            </p>

            <p className="text-3xl font-bold text-amber-800 dark:text-amber-300 mt-3">
              ₹{taxReserve.toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className="
    rounded-2xl
    border border-violet-500/20
    bg-violet-50
    dark:bg-violet-950/30
    p-5
  "
          >
            <p className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-400">
              Expense Ratio
            </p>

            <p className="text-3xl font-bold text-violet-800 dark:text-violet-300 mt-3">
              {expenseRatio}%
            </p>
          </div>
        </div>

        {monthlyExpenses > monthlyIncome && (
          <div
            className="bg-red-50
dark:bg-red-900/20 border border-red-200 rounded-xl p-4 mb-6"
          >
            <p className="font-medium text-red-700">
              Expenses are higher than income this month.
            </p>
          </div>
        )}

        <div className="mb-6 w-full hiddenscrollbar">
          <IncomeTrendChart income={monthlyIncome} />
          <ExpensePieChart data={expenseData} />
        </div>

        {/* Tax Method */}
        <div
          className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-xl p-5 mb-6"
        >
          <h3 className="font-semibold mb-4">Tax Configuration</h3>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p
                className="text-xs text-gray-500
dark:text-gray-400"
              >
                Method
              </p>

              <p className="font-semibold">
                {profile.tax_method === "44ada"
                  ? "44ADA"
                  : profile.tax_method === "44ad"
                    ? "44AD"
                    : "Normal"}
              </p>
            </div>

            <div>
              <p
                className="text-xs text-gray-500
dark:text-gray-400"
              >
                Regime
              </p>

              <p className="font-semibold capitalize">{profile.tax_regime}</p>
            </div>

            <div>
              <p
                className="text-xs text-gray-500
dark:text-gray-400"
              >
                GST
              </p>

              <p className="font-semibold">
                {profile.gst_registered ? "Registered" : "Not Registered"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profile.gst_registered && (
            <div
              className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-xl border-gray-200 p-5"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GST collected this month
              </p>
              <p
                className="text-xl font-semibold text-gray-900
dark:text-white"
              >
                ₹{breakdown.gstAmount.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          <div
            className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-xl border-gray-200 p-5"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Next advance tax due
            </p>
            <p
              className="text-xl font-semibold text-gray-900
dark:text-white"
            >
              {nextDue}
            </p>
            <p
              className="text-xs text-gray-500
dark:text-gray-400 mt-1"
            >
              Est. ₹{breakdown.advanceTaxThisQuarter.toLocaleString("en-IN")}{" "}
              this installment
            </p>
          </div>
          {profile.user_type === "business" && (
            <div
              className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-xl border-gray-200 p-5"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expenses this month
              </p>
              <p className="text-xl font-semibold text-red-500 dark:text-red-400">
                ₹{monthlyExpenses.toLocaleString("en-IN")}
              </p>
            </div>
          )}
          <div
            className="bg-white
dark:bg-zinc-900
border
dark:border-zinc-800 rounded-xl border-gray-200 p-5"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Net profit this month
            </p>
            <p
              className="text-xl font-semibold text-gray-900
dark:text-white"
            >
              ₹{(monthlyIncome - monthlyExpenses).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <TaxDisclaimer />
      </div>
    </main>
  );
}
