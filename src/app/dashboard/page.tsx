"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { calculateFullTaxBreakdown, TaxRegime } from "@/lib/taxLogic";
import TaxDisclaimer from "@/components/TaxDisclaimer";

interface DashboardDataItem {
  type: "income" | "expense" | "investment" | "client" | "category" | "activity";
  id: string;
  label: string;
  amount?: number;
  date?: string;
  category?: string;
  description?: string;
}

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
  const [allDataItems, setAllDataItems] = useState<DashboardDataItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
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

  // Compute filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allDataItems.filter((item) => {
      const label = item.label?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const category = item.category?.toLowerCase() || "";

      return label.includes(query) || description.includes(query) || category.includes(query);
    });
  }, [searchQuery, allDataItems]);

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

      // Fetch income data
      const { data: incomeData } = await supabase
        .from("income_entries")
        .select("amount, entry_date, client_name, id")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

      const incomeTotal = (incomeData || []).reduce((s, e) => s + Number(e.amount), 0);
      setMonthlyIncome(incomeTotal);

      // Fetch expense data
      const { data: expenses } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .gte("entry_date", startDate.toISOString());

      const expenseTotal = (expenses || []).reduce((s, e) => s + Number(e.amount), 0);
      setMonthlyExpenses(expenseTotal);

      // Process top clients
      const clientTotals: Record<string, number> = (incomeData || []).reduce(
        (acc: Record<string, number>, item: any) => {
          const client = item.client_name || "Unknown";
          acc[client] = (acc[client] || 0) + Number(item.amount);
          return acc;
        },
        {},
      );

      const topClientsList = (Object.entries(clientTotals) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setTopClients(topClientsList);

      // Process top vendors
      const vendorTotals: Record<string, number> = (expenses || []).reduce(
        (acc: Record<string, number>, item: any) => {
          const vendor = item.vendor || "Unknown";
          acc[vendor] = (acc[vendor] || 0) + Number(item.amount);
          return acc;
        },
        {},
      );

      const topVendorsList = (Object.entries(vendorTotals) as [string, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setTopVendors(topVendorsList);

      // Fetch upcoming expenses
      const today = new Date().toISOString().split("T")[0];
      const { data: upcoming } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("recurring", true)
        .gte("next_due_date", today)
        .order("next_due_date", { ascending: true })
        .limit(5);

      const upcomingExpensesData = upcoming ?? [];
      setUpcomingExpenses(upcomingExpensesData);

      // Fetch recent transactions (last 10)
      const { data: recentIncomeData } = await supabase
        .from("income_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("entry_date", { ascending: false })
        .limit(5);

      const { data: recentExpenseData } = await supabase
        .from("expense_entries")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("entry_date", { ascending: false })
        .limit(5);

      const combined = [
        ...(recentIncomeData || []).map((item: any) => ({
          ...item,
          type: "income",
          direction: "in",
        })),
        ...(recentExpenseData || []).map((item: any) => ({
          ...item,
          type: "expense",
          direction: "out",
        })),
      ].sort((a, b) => new Date(b.entry_date || b.created_at).getTime() - new Date(a.entry_date || a.created_at).getTime()).slice(0, 8);

      setRecentTransactions(combined);

      // Build searchable data index
      const dataIndex: DashboardDataItem[] = [
        ...(incomeData || []).map((item: any) => ({
          type: "income" as const,
          id: item.id,
          label: item.client_name || "Income",
          amount: item.amount,
          date: item.entry_date,
          description: `Income from ${item.client_name}`,
        })),
        ...(expenses || []).map((item: any) => ({
          type: "expense" as const,
          id: item.id,
          label: item.description || item.vendor || "Expense",
          amount: item.amount,
          date: item.entry_date,
          category: item.category,
          description: `${item.category} expense`,
        })),
      ];
      setAllDataItems(dataIndex);

      // Generate insights
      const generatedInsights: string[] = [];

      if (incomeTotal > expenseTotal) {
        generatedInsights.push(
          `📈 Healthy cash flow: ₹${(incomeTotal - expenseTotal).toLocaleString("en-IN")} surplus this month`,
        );
      } else if (expenseTotal > incomeTotal) {
        generatedInsights.unshift(
          `⚠️ Expenses exceed income by ₹${(expenseTotal - incomeTotal).toLocaleString("en-IN")}`,
        );
      }

      const biggestVendor = Object.entries(vendorTotals).sort((a: any, b: any) => b[1] - a[1])[0];
      const biggestClient = Object.entries(clientTotals).sort((a: any, b: any) => b[1] - a[1])[0];

      if (biggestClient) {
        generatedInsights.push(`🎯 Top client: ${biggestClient[0]} (₹${Number(biggestClient[1]).toLocaleString("en-IN")})`);
      }

      if (biggestVendor) {
        generatedInsights.push(`💸 Largest expense: ${biggestVendor[0]} (₹${Number(biggestVendor[1]).toLocaleString("en-IN")})`);
      }

      if (upcomingExpensesData.length > 0) {
        generatedInsights.push(
          `📅 ${upcomingExpensesData.length} recurring payments due this month`,
        );
      }

      const calculatedHealth = calculateHealthScore(
        incomeTotal,
        expenseTotal,
        profileData?.gst_registered ?? false,
        profileData?.onboarding_completed ?? false,
      );

      // Process expense categories
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

      // Fetch chart data (12-month history)
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

      const chartMap: Record<string, { income: number; expense: number }> = {};

      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
        chartMap[key] = { income: 0, expense: 0 };
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
        `Health Score: ${calculatedHealth.score}/100 (${calculatedHealth.status})`,
      );
      setInsights(generatedInsights.slice(0, 4));
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

  if (isMobile) {
    return <MobileBlocker />;
  }

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Loading your workspace...</h2>
          <div className="h-8 mt-3 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-slate-600 dark:text-slate-400"
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
      <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-10">
        <p className="text-slate-700 dark:text-slate-300">
          Please complete your settings first.
        </p>
        <Link href="/settings" className="text-emerald-600 underline">
          Go to settings
        </Link>
      </main>
    );
  }

  function getDaysUntil(dateString: string) {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

  const profitTrend = monthlyChartData.length >= 2 
    ? monthlyChartData[monthlyChartData.length - 1].profit > monthlyChartData[monthlyChartData.length - 2].profit
    : null;

  const incomeChange = monthlyChartData.length >= 2 
    ? monthlyChartData[monthlyChartData.length - 1].income - monthlyChartData[monthlyChartData.length - 2].income
    : 0;

  const expenseChange = monthlyChartData.length >= 2 
    ? monthlyChartData[monthlyChartData.length - 1].expense - monthlyChartData[monthlyChartData.length - 2].expense
    : 0;

  return (
    <main className="ml-64 min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
      <div className="space-y-8 max-w-7xl">
        {/* Header Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
              Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Financial Overview
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete snapshot of your cash flow, reserves, and financial health.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <Input
                  className="pl-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                  placeholder="Search income, expenses, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg p-2 z-50 max-h-64 overflow-y-auto">
                    {searchResults.slice(0, 8).map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">{result.label}</span>
                          <Badge variant="secondary" className="text-xs">{result.type}</Badge>
                        </div>
                        {result.amount && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            ₹{result.amount.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    ))}
                    {searchResults.length > 8 && (
                      <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                        +{searchResults.length - 8} more results
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => router.push("/income")}>
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  Add Income
                </Button>
                <Button size="sm" onClick={() => router.push("/expenses")}>
                  <ArrowDownLeft className="w-4 h-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={activeFilter === option.value ? "default" : "outline"}
                  onClick={() => setActiveFilter(option.value)}
                  className="whitespace-nowrap"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* KPI Cards - Premium Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0 }}
            className="group"
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Revenue
                    </p>
                    <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                      <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-950 dark:text-white">
                      ₹{cashFlowIn.toLocaleString("en-IN")}
                    </p>
                    {incomeChange !== 0 && (
                      <p className={`text-xs mt-2 font-medium ${incomeChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {incomeChange > 0 ? '+' : ''}₹{Math.abs(incomeChange).toLocaleString("en-IN")} from last month
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expenses Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="group"
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Expenses
                    </p>
                    <div className="rounded-lg bg-red-50 p-2 dark:bg-red-950/30">
                      <ArrowDownLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-950 dark:text-white">
                      ₹{cashFlowOut.toLocaleString("en-IN")}
                    </p>
                    {expenseChange !== 0 && (
                      <p className={`text-xs mt-2 font-medium ${expenseChange > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {expenseChange > 0 ? '+' : ''}₹{Math.abs(expenseChange).toLocaleString("en-IN")} from last month
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Net Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="group"
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Net Profit
                    </p>
                    <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
                      {profitTrend ? (
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ₹{Math.abs(netProfit).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                      {netProfit >= 0 ? 'Profitable month' : 'Operating at loss'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Available Cash Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="group"
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Available Cash
                    </p>
                    <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-950/30">
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-950 dark:text-white">
                      ₹{safeToSpend.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                      After tax & GST
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Business Insights Section */}
        {insights.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-950 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Business Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((insight, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 dark:border-zinc-800 dark:from-zinc-900/50 dark:to-zinc-800/30"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{insight}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Charts Section */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Revenue vs Expenses Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
              <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                      Revenue vs Expenses
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      12-month trend comparison
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider">
                    {activeFilterLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <RevenueExpenseChart data={monthlyChartData} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Health Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
              <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                      Financial Health
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Key metrics summary
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 dark:from-zinc-800 dark:to-zinc-700/50">
                    <p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Monthly Profit Margin
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-950 dark:text-white">
                        {savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Budget Utilization</span>
                      <span className="font-medium text-slate-950 dark:text-white">
                        {budgetUsed.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, budgetUsed)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/20">
                    <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Tax reserve: ₹{taxReserve.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Spending by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {expenseData.length > 0 ? (
                    <div className="h-72">
                      <ExpensePieChart data={expenseData} />
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      No expense data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Latest income and expense entries
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {recentTransactions.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`rounded-lg p-2 ${
                                transaction.type === "income"
                                  ? "bg-emerald-50 dark:bg-emerald-950/30"
                                  : "bg-red-50 dark:bg-red-950/30"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className={`w-4 h-4 ${transaction.type === "income" ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                              ) : (
                                <ArrowDownLeft className={`w-4 h-4 ${transaction.type === "income" ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {transaction.client_name || transaction.vendor || transaction.description || 'Transaction'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(transaction.entry_date || transaction.created_at).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${transaction.type === "income" ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {transaction.type === "income" ? '+' : '-'}₹{Number(transaction.amount).toLocaleString("en-IN")}
                            </p>
                            {transaction.category && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-slate-500 dark:text-slate-400">
                      No transactions yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Obligations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                        Upcoming Obligations
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Due soon
                      </CardDescription>
                    </div>
                    <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {upcomingExpenses.length > 0 ? (
                    upcomingExpenses.map((expense, idx) => {
                      const daysUntil = getDaysUntil(expense.next_due_date);
                      const isUrgent = daysUntil <= 3;

                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border p-3 ${
                            isUrgent
                              ? 'border-red-200/80 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20'
                              : 'border-slate-200/50 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-white truncate">
                                {expense.description}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Due {new Date(expense.next_due_date).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                {daysUntil}d
                              </p>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                ₹{Number(expense.amount).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 text-sm">
                      No upcoming obligations
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Clients */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                    Top Clients
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Highest income sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-6">
                  {topClients.length > 0 ? (
                    topClients.map(([client, amount], idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-slate-50/50 p-3 dark:bg-zinc-800/30 hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {client}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            #{idx + 1} client
                          </p>
                        </div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{Number(amount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400 text-sm">
                      No client data
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                <CardHeader className="border-b border-slate-200/80 pb-4 dark:border-zinc-800">
                  <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
                    Budget Status
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    This month allocation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Allocated</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{monthlyIncome.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Spent</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{monthlyExpenses.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{Math.max(0, monthlyIncome - monthlyExpenses).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, budgetUsed)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {budgetUsed.toFixed(0)}% utilized
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Tax Disclaimer */}
        <TaxDisclaimer />
      </div>
    </main>
  );
}