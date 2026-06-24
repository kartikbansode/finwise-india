"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { calculate44ADA, calculate44AD } from "@/lib/presumptiveTax";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { calculateHealthScore } from "@/lib/healthScore";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import MobileBlocker from "@/components/MobileBlocker";
import { AnimatePresence, motion } from "framer-motion";
import RevenueExpenseChart from "@/components/charts/RevenueExpenseChart";

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
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const loadingMessages = [
    "Organizing your financial data...",
    "Preparing your dashboard...",
    "Loading income analytics...",
    "Calculating tax insights...",
    "Syncing business metrics...",
    "Reviewing GST records...",
    "Checking cash flow trends...",
    "Building your financial command center...",
    "Almost ready...",
  ];
  const [insights, setInsights] = useState<string[]>([]);

  const [topClients, setTopClients] = useState<[string, number][]>([]);

  const [topVendors, setTopVendors] = useState<[string, number][]>([]);

  const [monthlyChartData, setMonthlyChartData] = useState<
    {
      month: string;
      income: number;
      expense: number;
      profit: number;
    }[]
  >([]);

  const [dateFilter, setDateFilter] = useState("this_month");

  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * loadingMessages.length),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        let next;

        do {
          next = Math.floor(Math.random() * loadingMessages.length);
        } while (next === prev);

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  function getStartDate(filter: string) {
    const now = new Date();

    switch (filter) {
      case "last_month": {
        return new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      }

      case "last_3_months": {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d.toISOString();
      }

      case "this_year":
        return new Date(now.getFullYear(), 0, 1).toISOString();

      case "all_time":
        return "2000-01-01";

      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  }

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
      const startDate = getStartDate(dateFilter);

      const { data: incomeData } = await supabase
        .from("income_entries")
        .select("amount")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate);
      const incomeTotal = (incomeData || []).reduce(
        (s, e) => s + Number(e.amount),
        0,
      );
      setMonthlyIncome(incomeTotal);

      const { data: clientData } = await supabase
        .from("income_entries")
        .select("client_name, amount")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate);

      const { data: expenses } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate);

      const expenseTotal = (expenses || []).reduce(
        (s, e) => s + Number(e.amount),
        0,
      );
      const clientTotals: Record<string, number> = (clientData || []).reduce(
        (acc: Record<string, number>, item: any) => {
          const client = item.client_name || "Unknown";

          acc[client] = (acc[client] || 0) + Number(item.amount);

          return acc;
        },
        {},
      );

      setTopClients(
        (Object.entries(clientTotals) as [string, number][])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
      );

      setMonthlyExpenses(expenseTotal);

      const vendorTotals: Record<string, number> = (expenses || []).reduce(
        (acc: Record<string, number>, item: any) => {
          const vendor = item.vendor || "Unknown";

          acc[vendor] = (acc[vendor] || 0) + Number(item.amount);

          return acc;
        },
        {},
      );

      setTopVendors(
        (Object.entries(vendorTotals) as [string, number][])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5),
      );
      const generatedInsights: string[] = [];
      if (monthlyIncome > 0) {
        generatedInsights.push(
          `Revenue recorded: ₹${monthlyIncome.toLocaleString("en-IN")}`,
        );
      }
      if (monthlyExpenses > 0) {
        generatedInsights.push(
          `Expenses recorded: ₹${monthlyExpenses.toLocaleString("en-IN")}`,
        );
      }
      if (monthlyIncome > monthlyExpenses) {
        generatedInsights.push("Business is currently profitable.");
      } else if (monthlyExpenses > monthlyIncome) {
        generatedInsights.push("Expenses currently exceed revenue.");
      }
      const biggestVendor = Object.entries(vendorTotals).sort(
        (a: any, b: any) => b[1] - a[1],
      )[0];
      const biggestClient = Object.entries(clientTotals).sort(
        (a: any, b: any) => b[1] - a[1],
      )[0];
      if (biggestClient) {
        generatedInsights.push(`${biggestClient[0]} is your largest client.`);
      }
      if (biggestVendor) {
        generatedInsights.push(
          `${biggestVendor[0]} is your largest expense source.`,
        );
      }

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

      const { data: allIncome } = await supabase
        .from("income_entries")
        .select("amount, entry_date")
        .eq("user_id", userData.user.id);

      const { data: allExpenses } = await supabase
        .from("expense_entries")
        .select("amount, entry_date")
        .eq("user_id", userData.user.id);

      const chartMap: Record<
        string,
        {
          income: number;
          expense: number;
        }
      > = {};

      for (let i = 11; i >= 0; i--) {
        const date = new Date();

        date.setMonth(date.getMonth() - i);

        const key = date.toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });

        chartMap[key] = {
          income: 0,
          expense: 0,
        };
      }

      (allIncome || []).forEach((item) => {
        const month = new Date(item.entry_date).toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });

        if (chartMap[month]) {
          chartMap[month].income += Number(item.amount);
        }
      });

      (allExpenses || []).forEach((item) => {
        const month = new Date(item.entry_date).toLocaleString("en-IN", {
          month: "short",
          year: "2-digit",
        });

        if (chartMap[month]) {
          chartMap[month].expense += Number(item.amount);
        }
      });
      setMonthlyChartData(
        Object.entries(chartMap).map(([month, values]) => ({
          month,
          income: values.income,
          expense: values.expense,
          profit: values.income - values.expense,
        })),
      );

      setCheckingAuth(false);
      setLoading(false);
      setInsights(generatedInsights);
    }

    load();
  }, [dateFilter]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  if (isMobile === null) {
    return null;
  }

  if (isMobile) {
    return <MobileBlocker />;
  }
  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold">Loading your workspace...</h2>

          <div className="h-8 mt-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-gray-500 dark:text-gray-400"
              >
                {loadingMessages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
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

  const healthResult = calculateHealthScore(
    monthlyIncome,
    monthlyExpenses,
    profile.gst_registered,
    profile.onboarding_completed,
  );

  const healthScore = healthResult.score;

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  const cashFlow = monthlyIncome - monthlyExpenses;

  const safeToSpend = Math.max(
    0,
    monthlyIncome - monthlyExpenses - breakdown.incomeTax - breakdown.gstAmount,
  );

  const profitMargin =
    monthlyIncome > 0 ? Math.round((monthlyProfit / monthlyIncome) * 100) : 0;

  const savingsRate =
    monthlyIncome > 0 ? Math.round((monthlyProfit / monthlyIncome) * 100) : 0;

  const expenseRatio =
    monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;

  const taxReserve = breakdown.incomeTax;

  const nextDue = getNextAdvanceTaxDueDate();

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Financial overview of your business.
            </p>
          </div>

          <select
            value={dateFilter}
            onChange={(e) => {
              setLoading(true);
              setDateFilter(e.target.value);
            }}
            className="
    bg-white dark:bg-zinc-900
    border border-gray-300 dark:border-zinc-700
    rounded-xl
    px-4 py-2
    "
          >
            <option value="this_month">This Month</option>

            <option value="last_month">Last Month</option>

            <option value="last_3_months">Last 3 Months</option>

            <option value="this_year">This Year</option>

            <option value="all_time">All Time</option>
          </select>
        </div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Revenue
            </p>

            <p className="text-2xl font-bold mt-3 text-emerald-800 dark:text-emerald-300">
              ₹{monthlyIncome.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-red-700 dark:text-red-400">
              Expenses
            </p>

            <p className="text-2xl font-bold mt-3 text-red-800 dark:text-red-300">
              ₹{monthlyExpenses.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-400">
              Profit
            </p>

            <p className="text-2xl font-bold mt-3 text-blue-800 dark:text-blue-300">
              ₹{monthlyProfit.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-50 dark:bg-violet-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-violet-700 dark:text-violet-400">
              Cash Flow
            </p>

            <p className="text-2xl font-bold mt-3 text-violet-800 dark:text-violet-300">
              ₹{cashFlow.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Tax Reserve
            </p>

            <p className="text-2xl font-bold mt-3 text-amber-800 dark:text-amber-300">
              ₹{taxReserve.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50 dark:bg-cyan-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-400">
              Safe To Spend
            </p>

            <p className="text-2xl font-bold mt-3 text-cyan-800 dark:text-cyan-300">
              ₹{safeToSpend.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div
          className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-2xl
  p-6
  mb-6
  "
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Health
            </h3>

            <div
              className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${
        healthScore >= 80
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : healthScore >= 60
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }
      `}
            >
              {healthScore}/100
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Profit Margin</span>

                <span className="font-medium">{profitMargin}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.min(profitMargin, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Savings Rate</span>

                <span className="font-medium">{savingsRate}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${Math.min(savingsRate, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Expense Ratio</span>

                <span className="font-medium">{expenseRatio}%</span>
              </div>

              <div className="h-2 rounded-full bg-gray-200 dark:bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{
                    width: `${Math.min(expenseRatio, 100)}%`,
                  }}
                />
              </div>
            </div>
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
          <RevenueExpenseChart data={monthlyChartData} />
          <ExpensePieChart data={expenseData} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top Clients */}
          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-2xl
    p-6
    "
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Top Clients
            </h3>

            {topClients.length === 0 ? (
              <p className="text-gray-500">No client data available.</p>
            ) : (
              <div className="space-y-4">
                {topClients.map(([client, amount]: any, index) => (
                  <div
                    key={`${client}-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                  w-8 h-8
                  rounded-full
                  bg-emerald-500/10
                  text-emerald-500
                  flex items-center justify-center
                  text-sm font-semibold
                  "
                      >
                        {index + 1}
                      </div>

                      <span className="font-medium">{client}</span>
                    </div>

                    <span className="font-semibold">
                      ₹{Number(amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Vendors */}
          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-2xl
    p-6
    "
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Top Vendors
            </h3>

            {topVendors.length === 0 ? (
              <p className="text-gray-500">No vendor data available.</p>
            ) : (
              <div className="space-y-4">
                {topVendors.map(([vendor, amount]: any, index) => (
                  <div
                    key={`${vendor}-${index}`}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                  w-8 h-8
                  rounded-full
                  bg-red-500/10
                  text-red-500
                  flex items-center justify-center
                  text-sm font-semibold
                  "
                      >
                        {index + 1}
                      </div>

                      <span className="font-medium">{vendor}</span>
                    </div>

                    <span className="font-semibold">
                      ₹{Number(amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-2xl
  p-6
  mb-6
  "
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Business Insights
          </h3>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="
        flex items-start gap-3
        text-gray-700 dark:text-gray-300
        "
              >
                <div
                  className="
          w-2 h-2
          rounded-full
          bg-emerald-500
          mt-2
          "
                />

                <p>{insight}</p>
              </div>
            ))}
          </div>
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
