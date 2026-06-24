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
import { processRecurringExpenses } from "@/lib/processRecurringExpenses";

import { calculateFullTaxBreakdown, TaxRegime } from "@/lib/taxLogic";
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

  const [upcomingExpenses, setUpcomingExpenses] = useState<any[]>([]);

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

  useEffect(() => {
    async function load() {
      await processRecurringExpenses();
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

      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: incomeData } = await supabase
        .from("income_entries")
        .select("amount")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());
      const incomeTotal = (incomeData || []).reduce(
        (s, e) => s + Number(e.amount),
        0,
      );
      setMonthlyIncome(incomeTotal);

      const { data: clientData } = await supabase
        .from("income_entries")
        .select("client_name, amount")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

      const { data: expenses } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

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

      const today = new Date().toISOString().split("T")[0];

      const { data: upcoming } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("recurring", true)
        .gte("next_due_date", today)
        .order("next_due_date", {
          ascending: true,
        })
        .limit(5);

      const upcomingExpensesData = upcoming ?? [];

      setUpcomingExpenses(upcomingExpensesData);
      const generatedInsights: string[] = [];
      if (incomeTotal > expenseTotal) {
        generatedInsights.push("Business is currently profitable.");
      } else if (expenseTotal > incomeTotal) {
        generatedInsights.unshift("Expenses are higher than income.");
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
      if (upcomingExpensesData.length > 0) {
        generatedInsights.push(
          `${upcomingExpensesData.length} recurring obligations are scheduled.`,
        );
      }
      const calculatedHealth = calculateHealthScore(
        incomeTotal,
        expenseTotal,
        profileData?.gst_registered ?? false,
        profileData?.onboarding_completed ?? false,
      );

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
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

      const { data: allExpenses } = await supabase
        .from("expense_entries")
        .select("amount, entry_date")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

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
      generatedInsights.unshift(
        `Financial Health: ${calculatedHealth.score}/100 (${calculatedHealth.status})`,
      );
      setInsights(generatedInsights.slice(0, 3));
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
  if (isMobile === null) {
    return null;
  }
  function getDaysUntil(dateString: string) {
    const today = new Date();

    const target = new Date(dateString);

    const diff = target.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

  const monthlyProfit = monthlyIncome - monthlyExpenses;

  const safeToSpend = Math.max(
    0,
    monthlyIncome - monthlyExpenses - breakdown.incomeTax - breakdown.gstAmount,
  );
  Math.max(0, breakdown.safeToSpend);

  const taxReserve = breakdown.incomeTax;

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="w-full">
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Financial overview of your business.
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
          <div className="grid lg:grid-cols-2 gap-6 mb-6 items-start">
            <div
              className="
  bg-white dark:bg-zinc-900
  border dark:border-zinc-800
  rounded-2xl
  p-8
  "
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available Balance
              </p>

              <h2 className="text-4xl font-bold mt-3 text-gray-900 dark:text-white">
                ₹{safeToSpend.toLocaleString("en-IN")}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                After expenses, tax reserve and GST obligations.
              </p>
            </div>

            <div
              className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-2xl
    p-6
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

                    <p
                      className={
                        insight.includes("Financial Health")
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : ""
                      }
                    >
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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

          <div className="rounded-2xl border border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-5">
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Recommended Tax Reserve
            </p>

            <p className="text-2xl font-bold mt-3 text-amber-800 dark:text-amber-300">
              ₹{taxReserve.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

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
            Upcoming Obligations
          </h3>

          {upcomingExpenses.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No recurring expenses scheduled.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="
          flex items-center
          justify-between
          border-b border-gray-100
          dark:border-zinc-800
          pb-3
          "
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {expense.description}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ₹{Number(expense.amount).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-emerald-600">
                      {getDaysUntil(expense.next_due_date)} days
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due{" "}
                      {new Date(expense.next_due_date).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <TaxDisclaimer />
      </div>
    </main>
  );
}
