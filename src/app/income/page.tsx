"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import MobileBlocker from "@/components/MobileBlocker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Wallet, TrendingUp, TrendingDown, Shield, Calendar, X } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface IncomeEntry {
  id: string;
  client_name: string | null;
  income_source: string | null;
  amount: number;
  category: string;
  gst_included: boolean;
  invoice_linked: boolean;
  payment_status: string;
  payment_method: string;
  notes: string | null;
  entry_date: string;
  created_at: string;
}

const CATEGORIES = [
  "design",
  "development",
  "consulting",
  "writing",
  "marketing",
  "other",
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
];

const PAYMENT_STATUS = [
  { value: "received", label: "Received" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const CURRENCY_FORMAT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function IncomePage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"amount" | "date" | "client">("amount");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("this_month");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    client_name: "",
    income_source: "",
    amount: "",
    category: "other",
    payment_method: "bank_transfer",
    payment_status: "received",
    entry_date: new Date().toISOString().split("T")[0],
    gst_included: false,
    invoice_linked: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("income_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  }

  const resetForm = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setError("");
    setFormData({
      client_name: "",
      income_source: "",
      amount: "",
      category: "other",
      payment_method: "bank_transfer",
      payment_status: "received",
      entry_date: new Date().toISOString().split("T")[0],
      gst_included: false,
      invoice_linked: false,
      notes: "",
    });
  };

  const handleEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setFormData({
      client_name: entry.client_name ?? "",
      income_source: entry.income_source ?? "",
      amount: entry.amount.toString(),
      category: entry.category,
      payment_method: entry.payment_method,
      payment_status: entry.payment_status,
      entry_date: entry.entry_date,
      gst_included: entry.gst_included,
      invoice_linked: entry.invoice_linked,
      notes: entry.notes ?? "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("income_entries").delete().eq("id", id);
    await loadEntries();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.client_name.trim() || !formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid client name and amount.");
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("You must be logged in.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: userData.user.id,
      client_name: formData.client_name,
      income_source: formData.income_source || null,
      amount: Number(formData.amount),
      category: formData.category,
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      entry_date: formData.entry_date,
      gst_included: formData.gst_included,
      invoice_linked: formData.invoice_linked,
      notes: formData.notes || null,
    };

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from("income_entries")
          .update(payload)
          .eq("id", editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("income_entries").insert(payload);
        if (error) throw error;
      }

      resetForm();
      await loadEntries();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  async function updateStatus(id: string, status: string) {
    await supabase
      .from("income_entries")
      .update({ payment_status: status })
      .eq("id", id);

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              payment_status: status,
            }
          : entry,
      ),
    );
  }

  const dateFilteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.entry_date);
    const now = new Date();

    switch (dateFilter) {
      case "this_month":
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      case "last_month": {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return (
          entryDate.getMonth() === lastMonth.getMonth() &&
          entryDate.getFullYear() === lastMonth.getFullYear()
        );
      }
      case "last_3_months": {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return entryDate >= threeMonthsAgo;
      }
      case "this_year":
        return entryDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  const filteredEntries = useMemo(() => {
    let filtered = [...dateFilteredEntries];

    if (filterCategory !== "all") {
      filtered = filtered.filter((entry) => entry.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        [entry.client_name, entry.income_source, entry.category]
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
      case "client":
        filtered.sort((a, b) =>
          (a.client_name || "").localeCompare(b.client_name || ""),
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

  const totalRevenue = dateFilteredEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );

  const averageIncome =
    dateFilteredEntries.length > 0
      ?
          dateFilteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0) /
          dateFilteredEntries.length
      : 0;

  const totalTransactions = dateFilteredEntries.length;

  const clientTotals = dateFilteredEntries.reduce((acc, entry) => {
    const client = entry.client_name || "Unknown";
    acc[client] = (acc[client] || 0) + Number(entry.amount);
    return acc;
  }, {} as Record<string, number>);

  const topClient =
    Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  const revenueByMonth = dateFilteredEntries.reduce(
    (acc, entry) => {
      const date = new Date(entry.entry_date);
      const month = date.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      acc[month] = (acc[month] || 0) + Number(entry.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  const monthlyEntries = Object.entries(revenueByMonth);

  const bestMonth =
    monthlyEntries.length > 0
      ? monthlyEntries.reduce((a, b) => (a[1] > b[1] ? a : b))
      : null;

  const weakestMonth =
    monthlyEntries.length > 0
      ? monthlyEntries.reduce((a, b) => (a[1] < b[1] ? a : b))
      : null;

  const topClients = Object.entries(clientTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const now = new Date();

  const currentMonthRevenue = entries
    .filter((entry) => {
      const date = new Date(entry.entry_date);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const previousMonthRevenue = entries
    .filter((entry) => {
      const date = new Date(entry.entry_date);
      return (
        date.getMonth() === previousMonth.getMonth() &&
        date.getFullYear() === previousMonth.getFullYear()
      );
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const revenueGrowth =
    previousMonthRevenue === 0
      ? 100
      : (
          ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100
        ).toFixed(1);

  const paymentSummary = entries.reduce(
    (acc, entry) => {
      acc[entry.payment_status] = (acc[entry.payment_status] || 0) + Number(entry.amount);
      return acc;
    },
    {} as Record<string, number>,
  );

  const gstIncludedTotal = entries
    .filter((entry) => entry.gst_included)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Income Center
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing financial data...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Income Tracker</h1>
          <p className="text-muted-foreground">Track and manage your income entries</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Income
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Based on selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(Math.round(averageIncome))}</div>
            <p className="text-xs text-muted-foreground">Average per entry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Client</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{topClient}</div>
            <p className="text-xs text-muted-foreground">Highest billed client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Entries in view</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              Number(revenueGrowth) >= 0 ? "text-emerald-500" : "text-red-500",
            )}>
              {Number(revenueGrowth) >= 0 ? "+" : ""}{revenueGrowth}%
            </div>
            <p className="text-xs text-muted-foreground">Vs last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Income</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income by Category</CardTitle>
                <CardDescription>Distribution of income categories</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(revenueByMonth).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={CATEGORIES.map((category) => ({
                          name: category.charAt(0).toUpperCase() + category.slice(1),
                          value: dateFilteredEntries
                            .filter((entry) => entry.category === category)
                            .reduce((sum, entry) => sum + Number(entry.amount), 0),
                        })).filter((item) => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {CATEGORIES.map((category, index) => (
                          <Cell
                            key={`cell-${category}`}
                            fill={["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6B7280"][index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => CURRENCY_FORMAT.format(value)}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-75 text-muted-foreground">
                    No income data to display
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>Highest revenue contributors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.length > 0 ? (
                    topClients.map(([client, amount], index) => (
                      <div key={client} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-semibold w-8 h-8 flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{client}</p>
                            <p className="text-xs text-muted-foreground">{Math.round((amount / totalRevenue) * 100)}% of revenue</p>
                          </div>
                        </div>
                        <p className="font-semibold">{CURRENCY_FORMAT.format(amount)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No clients available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search income entries..."
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
                  {CATEGORIES.map((category) => (
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
                  <option value="client">Sort by Client</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Income Source</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Payment Method</th>
                  <th className="px-4 py-3 font-medium">Payment Status</th>
                  <th className="px-4 py-3 font-medium">Entry Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{entry.client_name || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.income_source || "-"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.category}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{entry.payment_method.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          entry.payment_status === "received"
                            ? "secondary"
                            : entry.payment_status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {entry.payment_status.charAt(0).toUpperCase() + entry.payment_status.slice(1)}
                      </Badge>
                    </td>
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
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No income entries match your search and filters.
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
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Income growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => CURRENCY_FORMAT.format(value)} />
                      <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#incomeGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-75 text-muted-foreground">
                  Add more income entries to see performance chart
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Pending, overdue and received split</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PAYMENT_STATUS.map((status) => (
                    <div key={status.value} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-muted-foreground">{status.label}</span>
                      <span className="font-medium">{CURRENCY_FORMAT.format(paymentSummary[status.value] || 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GST Included</CardTitle>
                <CardDescription>Income with GST applied</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{CURRENCY_FORMAT.format(gstIncludedTotal)}</div>
                <p className="text-sm text-muted-foreground">Total amount tagged as GST included</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest income entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{entry.client_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString("en-IN")}</p>
                        </div>
                        <p className="font-semibold">{CURRENCY_FORMAT.format(entry.amount)}</p>
                      </div>
                    ))}
                  {entries.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent income activity yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Calendar</CardTitle>
                <CardDescription>Important dates and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Quarterly GST Filing</p>
                      <p className="text-sm text-muted-foreground">July 31, October 31, January 31, April 30</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Income Tax Return Filing</p>
                      <p className="text-sm text-muted-foreground">July 31 each year</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Invoice follow-up</p>
                      <p className="text-sm text-muted-foreground">Review pending payments weekly</p>
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
                      <CardTitle>{editingEntry ? "Edit Income" : "Add Income"}</CardTitle>
                      <CardDescription>
                        {editingEntry ? "Update income entry details" : "Log a new income entry"}
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
                        <label className="text-sm font-medium mb-2 block">Client Name *</label>
                        <Input
                          required
                          placeholder="e.g. Acme Corp"
                          value={formData.client_name}
                          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Income Source</label>
                        <Input
                          placeholder="Freelancing, Consulting, Retainer..."
                          value={formData.income_source}
                          onChange={(e) => setFormData({ ...formData, income_source: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Amount *</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="50000"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
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
                        <label className="text-sm font-medium mb-2 block">Payment Status</label>
                        <select
                          value={formData.payment_status}
                          onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {PAYMENT_STATUS.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Entry Date</label>
                        <Input
                          type="date"
                          value={formData.entry_date}
                          onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          GST Included
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, gst_included: !prev.gst_included }))}
                          className={`w-12 h-6 rounded-full relative transition ${
                            formData.gst_included ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                              formData.gst_included ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Invoice Linked
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, invoice_linked: !prev.invoice_linked }))}
                          className={`w-12 h-6 rounded-full relative transition ${
                            formData.invoice_linked ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                              formData.invoice_linked ? "translate-x-6" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-20"
                        placeholder="Additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingEntry ? "Update" : "Add"} Income
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Delete Income Entry</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">This income record will be permanently removed.</p>
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
