"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import MobileBlocker from "@/components/MobileBlocker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Wallet, TrendingUp, TrendingDown, Shield, Calendar, ArrowUpRight, X } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExpenseEntry {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  entry_date: string;
  created_at: string;
  vendor: string | null;
  expense_type: string | null;
  gst_paid: boolean | null;
  payment_method: string | null;
  recurring: boolean;
  business_personal: string | null;
  notes: string | null;
  recurring_frequency: string | null;
  next_due_date: string | null;
  recurrence_end_date: string | null;
  auto_generated: boolean;
  parent_recurring_id: string | null;
}

interface ExpenseFormData {
  description: string;
  vendor: string;
  amount: string;
  category: string;
  expense_type: string;
  payment_method: string;
  gst_paid: boolean;
  business_personal: string;
  notes: string;
  entry_date: string;
  recurring: boolean;
  recurring_frequency: string;
  next_due_date: string | null;
  recurrence_end_date: string | null;
}

const EXPENSE_CATEGORIES = [
  "rent",
  "salary",
  "utilities",
  "marketing",
  "software",
  "travel",
  "other",
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

const EXPENSE_TYPES = [
  { value: "fixed", label: "Fixed Expense" },
  { value: "variable", label: "Variable Expense" },
];

const RECURRENCE_FREQUENCIES = [
  { value: "one_time", label: "One-time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "yearly", label: "Yearly" },
];

const CURRENCY_FORMAT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatMonth(dateString: string) {
  return new Date(dateString).toLocaleString("en-IN", {
    month: "short",
    year: "2-digit",
  });
}

function calculateNextDueDate(currentDate: string, frequency: string | null) {
  if (!frequency || frequency === "one_time") {
    return null;
  }

  const date = new Date(currentDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "half_yearly":
      date.setMonth(date.getMonth() + 6);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return date.toISOString().split("T")[0];
}

export default function ExpensesPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExpenseEntry | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"amount" | "date" | "vendor">("amount");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("this_month");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: "",
    vendor: "",
    amount: "",
    category: "other",
    expense_type: "variable",
    payment_method: "bank_transfer",
    gst_paid: false,
    business_personal: "business",
    notes: "",
    entry_date: new Date().toISOString().split("T")[0],
    recurring: false,
    recurring_frequency: "one_time",
    next_due_date: null,
    recurrence_end_date: null,
  });

  useEffect(() => {
    async function initialize() {
      await processRecurringExpenses();
      await loadEntries();
    }

    initialize();
  }, []);

  async function loadEntries() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("expense_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setEntries(data as ExpenseEntry[]);
    }

    setLoading(false);
  }

  async function processRecurringExpenses() {
    try {
      await import("@/lib/processRecurringExpenses").then((mod) => mod.processRecurringExpenses());
    } catch (error) {
      console.error("Recurring expense processor failed:", error);
    }
  }

  const resetForm = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setError("");
    setFormData({
      description: "",
      vendor: "",
      amount: "",
      category: "other",
      expense_type: "variable",
      payment_method: "bank_transfer",
      gst_paid: false,
      business_personal: "business",
      notes: "",
      entry_date: new Date().toISOString().split("T")[0],
      recurring: false,
      recurring_frequency: "one_time",
      next_due_date: null,
      recurrence_end_date: null,
    });
  };

  const handleEdit = (entry: ExpenseEntry) => {
    setEditingEntry(entry);
    setFormData({
      description: entry.description,
      vendor: entry.vendor || "",
      amount: entry.amount.toString(),
      category: entry.category,
      expense_type: entry.expense_type || "variable",
      payment_method: entry.payment_method || "bank_transfer",
      gst_paid: Boolean(entry.gst_paid),
      business_personal: entry.business_personal || "business",
      notes: entry.notes || "",
      entry_date: entry.entry_date,
      recurring: entry.recurring,
      recurring_frequency: entry.recurring_frequency || "one_time",
      next_due_date: entry.next_due_date ?? null,
      recurrence_end_date: entry.recurrence_end_date ?? null,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("expense_entries").delete().eq("id", id);
    await loadEntries();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.description.trim() || !formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid description and amount.");
      return;
    }

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const nextDueDate = formData.recurring
      ? formData.next_due_date || calculateNextDueDate(formData.entry_date, formData.recurring_frequency)
      : null;

    const payload = {
      user_id: userData.user.id,
      description: formData.description.trim(),
      vendor: formData.vendor || null,
      amount: Number(formData.amount),
      category: formData.category,
      expense_type: formData.expense_type,
      payment_method: formData.payment_method,
      gst_paid: formData.gst_paid,
      business_personal: formData.business_personal,
      notes: formData.notes || null,
      entry_date: formData.entry_date,
      recurring: formData.recurring,
      recurring_frequency: formData.recurring ? formData.recurring_frequency : "one_time",
      next_due_date: nextDueDate,
      recurrence_end_date: formData.recurring ? formData.recurrence_end_date : null,
      auto_generated: false,
      parent_recurring_id: null,
    };

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from("expense_entries")
          .update(payload)
          .eq("id", editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("expense_entries").insert(payload);
        if (error) throw error;
      }

      resetForm();
      await loadEntries();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const dateFilteredEntries = useMemo(() => {
    const now = new Date();
    return entries.filter((entry) => {
      const entryDate = new Date(entry.entry_date);

      switch (dateFilter) {
        case "this_month":
          return (
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear()
          );
        case "last_month": {
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return (
            entryDate.getMonth() === lastMonth.getMonth() &&
            entryDate.getFullYear() === lastMonth.getFullYear()
          );
        }
        case "last_3_months": {
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return entryDate >= threeMonthsAgo;
        }
        case "this_year":
          return entryDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [entries, dateFilter]);

  const filteredEntries = useMemo(() => {
    let filtered = [...dateFilteredEntries];

    if (filterCategory !== "all") {
      filtered = filtered.filter((entry) => entry.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        [
          entry.description,
          entry.vendor,
          entry.category,
          entry.payment_method,
          entry.expense_type,
          entry.business_personal,
        ]
          .filter(Boolean)
          .some((value) =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    switch (sortBy) {
      case "amount":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "vendor":
        filtered.sort((a, b) =>
          (a.vendor || "").localeCompare(b.vendor || ""),
        );
        break;
      case "date":
        filtered.sort(
          (a, b) =>
            new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime(),
        );
        break;
    }

    return filtered;
  }, [dateFilteredEntries, filterCategory, searchQuery, sortBy]);

  const totalExpenses = useMemo(
    () =>
      dateFilteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0),
    [dateFilteredEntries],
  );

  const averageExpense = useMemo(
    () =>
      dateFilteredEntries.length > 0
        ?
            dateFilteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0) /
            dateFilteredEntries.length
        : 0,
    [dateFilteredEntries],
  );

  const totalTransactions = dateFilteredEntries.length;

  const categoryTotals = useMemo(
    () =>
      dateFilteredEntries.reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + Number(entry.amount);
        return acc;
      }, {} as Record<string, number>),
    [dateFilteredEntries],
  );

  const topCategory = useMemo(
    () =>
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-",
    [categoryTotals],
  );

  const expenseByMonth = useMemo(
    () =>
      dateFilteredEntries.reduce((acc, entry) => {
        const month = formatMonth(entry.entry_date);
        acc[month] = (acc[month] || 0) + Number(entry.amount);
        return acc;
      }, {} as Record<string, number>),
    [dateFilteredEntries],
  );

  const chartData = useMemo(
    () =>
      Object.entries(expenseByMonth).map(([month, amount]) => ({ month, amount })),
    [expenseByMonth],
  );

  const topVendors = useMemo(
    () =>
      Object.entries(
        dateFilteredEntries.reduce((acc, entry) => {
          const vendor = entry.vendor || "Unknown";
          acc[vendor] = (acc[vendor] || 0) + Number(entry.amount);
          return acc;
        }, {} as Record<string, number>),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [dateFilteredEntries],
  );

  const recurringExpenses = useMemo(
    () => dateFilteredEntries.filter((entry) => entry.recurring),
    [dateFilteredEntries],
  );

  const recurringAmount = useMemo(
    () =>
      recurringExpenses.reduce((sum, entry) => sum + Number(entry.amount), 0),
    [recurringExpenses],
  );

  const businessExpense = useMemo(
    () =>
      dateFilteredEntries
        .filter((entry) => entry.business_personal === "business")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [dateFilteredEntries],
  );

  const personalExpense = useMemo(
    () =>
      dateFilteredEntries
        .filter((entry) => entry.business_personal === "personal")
        .reduce((sum, entry) => sum + Number(entry.amount), 0),
    [dateFilteredEntries],
  );

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

  if (loading || isMobile === null) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading Expense Center</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Preparing expense analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Expense Tracker</h1>
          <p className="text-muted-foreground">Track and manage your expense entries</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Based on selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(Math.round(averageExpense))}</div>
            <p className="text-xs text-muted-foreground">Average per entry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{topCategory}</div>
            <p className="text-xs text-muted-foreground">Highest spend category</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Entries in view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Spend</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(recurringAmount)}</div>
            <p className="text-xs text-muted-foreground">Ongoing recurring expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Category distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(categoryTotals).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {Object.entries(categoryTotals).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"][index % 6]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const rawValue = Array.isArray(value) ? value[0] : value;
                          const numericValue = Number(rawValue);
                          return isNaN(numericValue) ? "" : CURRENCY_FORMAT.format(numericValue);
                        }}
                      />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-72 text-muted-foreground">
                    No expense categories to display
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>Highest expense payees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVendors.length > 0 ? (
                    topVendors.map(([vendor, amount], index) => (
                      <div key={`${vendor}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{vendor}</p>
                            <p className="text-xs text-muted-foreground">{Math.round((amount / totalExpenses) * 100)}% of spend</p>
                          </div>
                        </div>
                        <p className="font-semibold">{CURRENCY_FORMAT.format(amount)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No vendor expense data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="amount">Sort by Amount</option>
                  <option value="date">Sort by Date</option>
                  <option value="vendor">Sort by Vendor</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Payment Method</th>
                  <th className="px-4 py-3 font-medium">Expense Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[18rem] truncate">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.vendor || "-"}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 dark:text-gray-400">{entry.category}</td>
                    <td className="px-4 py-3 capitalize text-gray-500 dark:text-gray-400">{entry.payment_method?.replace("_", " ") || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(entry.entry_date).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{CURRENCY_FORMAT.format(entry.amount)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setDeleteId(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No expense entries match your search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Expense Trend</CardTitle>
              <CardDescription>Spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value) => {
                          const rawValue = Array.isArray(value) ? value[0] : value;
                          const numericValue = Number(rawValue);
                          return isNaN(numericValue) ? "" : CURRENCY_FORMAT.format(numericValue);
                        }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#ef4444" fill="url(#expenseGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-75 text-muted-foreground">
                  Add more expenses to see performance chart
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>GST Paid</CardTitle>
                <CardDescription>Expenses with GST paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {CURRENCY_FORMAT.format(
                    dateFilteredEntries
                      .filter((entry) => entry.gst_paid)
                      .reduce((sum, entry) => sum + Number(entry.amount), 0),
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Total GST paid expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business vs Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">Business</span>
                    <span className="font-semibold">{CURRENCY_FORMAT.format(businessExpense)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">Personal</span>
                    <span className="font-semibold">{CURRENCY_FORMAT.format(personalExpense)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest expense entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries
                    .slice()
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                        <p className="font-semibold">{CURRENCY_FORMAT.format(entry.amount)}</p>
                      </div>
                    ))}
                  {entries.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent expense activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Calendar</CardTitle>
                <CardDescription>Important dates and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Monthly Reconciliation</p>
                      <p className="text-sm text-muted-foreground">Review vendor bills before month-end</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Recurring Expense Review</p>
                      <p className="text-sm text-muted-foreground">Confirm recurring entries are accurate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TaxDisclaimer />

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{editingEntry ? "Edit Expense" : "Add Expense"}</CardTitle>
                      <CardDescription>
                        {editingEntry ? "Update expense details" : "Log a new expense"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-2 block">Expense Description *</label>
                        <Input
                          required
                          placeholder="e.g. Office rent"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Vendor</label>
                        <Input
                          placeholder="Google, Adobe, Hostinger..."
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Amount (₹) *</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="15000"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {EXPENSE_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Expense Type</label>
                        <select
                          value={formData.expense_type}
                          onChange={(e) => setFormData({ ...formData, expense_type: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {EXPENSE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Payment Method</label>
                        <select
                          value={formData.payment_method}
                          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {PAYMENT_METHODS.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Expense Date</label>
                        <Input
                          type="date"
                          value={formData.entry_date}
                          onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                        />
                      </div>

                      <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GST Paid</label>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, gst_paid: !prev.gst_paid }))}
                            className={`w-12 h-6 rounded-full relative transition ${
                              formData.gst_paid ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                                formData.gst_paid ? "translate-x-6" : ""
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Business / Personal</label>
                          <select
                            value={formData.business_personal}
                            onChange={(e) => setFormData({ ...formData, business_personal: e.target.value })}
                            className="w-36 px-3 py-2 rounded-md border border-input bg-background text-sm"
                          >
                            <option value="business">Business</option>
                            <option value="personal">Personal</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Recurring Expense</label>
                            <p className="text-xs text-muted-foreground">Enable recurrence schedule</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, recurring: !prev.recurring }))}
                            className={`w-12 h-6 rounded-full relative transition ${
                              formData.recurring ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                                formData.recurring ? "translate-x-6" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {formData.recurring && (
                        <>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Recurrence</label>
                            <select
                              value={formData.recurring_frequency}
                              onChange={(e) => setFormData({ ...formData, recurring_frequency: e.target.value })}
                              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                              {RECURRENCE_FREQUENCIES.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Recurrence End</label>
                            <Input
                              type="date"
                              value={formData.recurrence_end_date || ""}
                              onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value ? e.target.value : null })}
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-2 block">Notes</label>
                        <textarea
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-20"
                          placeholder="Optional notes..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {editingEntry ? "Update" : "Add"} Expense
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Delete Expense Entry</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">This expense record will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await handleDelete(deleteId);
                    setDeleteId(null);
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
