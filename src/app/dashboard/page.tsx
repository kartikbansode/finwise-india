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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("this_month");
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
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
  const [insights, setInsights] = useState<string[]>([]);
  const router = useRouter();
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
      const chartStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

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
        .gte("entry_date", chartStartDate.toISOString());

      const { data: allExpenses } = await supabase
        .from("expense_entries")
        .select("amount, entry_date")
        .eq("user_id", userData.user.id)
        .gte("entry_date", chartStartDate.toISOString());

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
  const safeToSpend = Math.max(0, monthlyIncome - monthlyExpenses - breakdown.incomeTax - breakdown.gstAmount);
  const taxReserve = breakdown.incomeTax;
  const cashFlowIn = monthlyIncome;
  const cashFlowOut = monthlyExpenses;
  const netProfit = monthlyProfit;
  const budgetUsed = monthlyIncome ? Math.min(100, (monthlyExpenses / monthlyIncome) * 100) : 0;
  const budgetRemaining = Math.max(0, 100 - budgetUsed);
  const savingsRate = monthlyIncome ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const safeSpendPercent = monthlyIncome ? Math.round((safeToSpend / monthlyIncome) * 100) : 0;
  const topClient = topClients[0];
  const topVendor = topVendors[0];
  const filterOptions = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_quarter", label: "This Quarter" },
    { value: "this_year", label: "This Year" },
    { value: "all_time", label: "All Time" },
  ];
  const activeFilterLabel = filterOptions.find((option) => option.value === activeFilter)?.label || "This Month";

  return (
    <main className="ml-64 min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="space-y-8">
        <section className="grid gap-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Business Dashboard</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Premium financial snapshot</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Review cash flow, reserves, and upcoming obligations in a clean, modern view.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto_auto] items-center">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" placeholder="Search dashboard..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Button variant="secondary" size="sm" onClick={() => router.push("/income")}>Add Income</Button>
              <Button size="sm" onClick={() => router.push("/expenses")}>Add Expense</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Revenue</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">₹{cashFlowIn.toLocaleString("en-IN")}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Income recorded this month.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Expenses</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">₹{cashFlowOut.toLocaleString("en-IN")}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Total expenses this month.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Net Profit</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">₹{netProfit.toLocaleString("en-IN")}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Revenue minus expenses.</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Available Cash</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">₹{safeToSpend.toLocaleString("en-IN")}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">After tax and GST reserve.</p>
            </div>
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="overflow-hidden rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
                <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Revenue vs Expenses</CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">Monthly comparison for the selected period.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs uppercase tracking-[0.2em]">{activeFilterLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-80 pt-6"><RevenueExpenseChart data={monthlyChartData} /></CardContent>
              </Card>
              <Card className="overflow-hidden rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
                <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Financial Health</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Cash flow, tax readiness, and profitability score.</CardDescription>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">{`${Math.round(breakdown.safeToSpend / Math.max(monthlyIncome, 1) * 100)}%`}</div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Cash Flow</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">₹{cashFlowIn.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tax Ready</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">₹{taxReserve.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Profitability</span>
                      <span>{monthlyProfit >= 0 ? "Positive" : "Negative"}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Savings Rate</span>
                      <span>{savingsRate.toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
                <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Cash Flow Overview</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Money in, money out, and net profit.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Money In</span>
                      <span className="font-semibold text-slate-950 dark:text-white">₹{cashFlowIn.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Money Out</span>
                      <span className="font-semibold text-slate-950 dark:text-white">₹{cashFlowOut.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Net Profit</span>
                      <span className="font-semibold text-slate-950 dark:text-white">₹{netProfit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
                <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Jump directly to common workflows.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 pt-6">
                  <Button variant="outline" size="sm" onClick={() => router.push("/income")}>Record Income</Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/expenses")}>Log Expense</Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/invoices/new")}>Create Invoice</Button>
                  <Button variant="outline" size="sm" onClick={() => router.push("/investments")}>View Investments</Button>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Upcoming Obligations</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Recurring expenses due soon and near-term obligations.</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs uppercase tracking-[0.2em]">{upcomingExpenses.length} items</Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {upcomingExpenses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-zinc-800 dark:text-slate-400">No recurring expenses scheduled.</div>
                ) : (
                  <div className="space-y-3">
                    {upcomingExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950 dark:text-white">{expense.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(expense.next_due_date).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">{getDaysUntil(expense.next_due_date)}d</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">₹{Number(expense.amount).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
              <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Budget Overview</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">Monthly budget allocation and spend.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Budget</span>
                    <span>₹{monthlyIncome.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Spent</span>
                    <span>₹{monthlyExpenses.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Remaining</span>
                    <span>₹{Math.max(0, monthlyIncome - monthlyExpenses).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${100 - budgetUsed}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="grid gap-6 xl:grid-cols-3">
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
            <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Expense Breakdown</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Top categories by spend.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6"><div className="h-72"><ExpensePieChart data={expenseData} /></div></CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
            <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Top Clients</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Highest paying clients this period.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {topClients.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">No client data available.</p>
              ) : (
                <div className="space-y-3">
                  {topClients.map(([client, amount]: any, index) => (
                    <div key={`${client}-${index}`} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-white">{client}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Rank {index + 1}</p>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">₹{Number(amount).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white/95 shadow-sm shadow-slate-200/40 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none p-6">
            <CardHeader className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-zinc-800">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">Latest Activity</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Recent income, expense, and recurring updates.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Largest client</p>
                    <Badge variant="secondary" className="text-xs">Client</Badge>
                  </div>
                  <p className="mt-2 font-medium text-slate-950 dark:text-white">{topClient ? `${topClient[0]} • ₹${topClient[1].toLocaleString("en-IN")}` : "No client data"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Largest vendor</p>
                    <Badge variant="secondary" className="text-xs">Vendor</Badge>
                  </div>
                  <p className="mt-2 font-medium text-slate-950 dark:text-white">{topVendor ? `${topVendor[0]} • ₹${topVendor[1].toLocaleString("en-IN")}` : "No vendor data"}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-zinc-900">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Next recurring due</p>
                    <Badge variant="secondary" className="text-xs">Schedule</Badge>
                  </div>
                  <p className="mt-2 font-medium text-slate-950 dark:text-white">{upcomingExpenses[0] ? `${upcomingExpenses[0].description} in ${getDaysUntil(upcomingExpenses[0].next_due_date)}d` : "No upcoming obligations"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <TaxDisclaimer />
      </div>
    </main>
  );
}
