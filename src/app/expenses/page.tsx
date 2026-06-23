"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import MobileBlocker from "@/components/MobileBlocker";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";



interface ExpenseEntry {
  id: string;
  description: string;
  vendor: string | null;
  amount: number;
  category: string;
  expense_type: string;
  gst_paid: boolean;
  payment_method: string;
  recurring: boolean;
  business_personal: string;
  notes: string | null;
  entry_date: string;
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

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export default function ExpensesPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [vendor, setVendor] = useState("");
  const [expenseType, setExpenseType] = useState("variable");
  const [gstPaid, setGstPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [recurring, setRecurring] = useState(false);
  const [businessPersonal, setBusinessPersonal] = useState("business");
  const [dateFilter, setDateFilter] = useState("this_month");
  const [notes, setNotes] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadEntries() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase
      .from("expense_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("entry_date", { ascending: false });
    if (!error && data) setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!description.trim() || !amount || Number(amount) <= 0) {
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

    const { error: insertError } = await supabase
      .from("expense_entries")
      .insert({
        user_id: userData.user.id,

        description: description.trim(),

        vendor,

        amount: Number(amount),

        category,

        expense_type: expenseType,

        gst_paid: gstPaid,

        payment_method: paymentMethod,

        recurring,

        business_personal: businessPersonal,

        notes,

        entry_date: entryDate,
      });

    if (insertError) setError("Something went wrong. Please try again.");
    else {
      setDescription("");

      setVendor("");

      setAmount("");

      setCategory("other");

      setExpenseType("variable");

      setGstPaid(false);

      setPaymentMethod("bank_transfer");

      setRecurring(false);

      setBusinessPersonal("business");

      setNotes("");
      await loadEntries();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("expense_entries").delete().eq("id", id);
    await loadEntries();
  }

  const totalThisMonth = entries
    .filter((e) => {
      const d = new Date(e.entry_date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const filteredEntries = entries.filter((entry) => {
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

  const averageExpense =
    filteredEntries.length > 0
      ? filteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0) /
        filteredEntries.length
      : 0;

  const totalTransactions = filteredEntries.length;

  const vendorTotals = entries.reduce(
    (acc, entry) => {
      const vendor = entry.vendor || "Unknown";

      acc[vendor] = (acc[vendor] || 0) + Number(entry.amount);

      return acc;
    },
    {} as Record<string, number>,
  );

  const topVendor =
    Object.entries(vendorTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  const expenseByMonth = filteredEntries.reduce(
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

  const chartData = Object.entries(expenseByMonth).map(([month, amount]) => ({
    month,
    amount,
  }));

  const now = new Date();

  const currentMonthExpense = filteredEntries
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

  const previousMonthExpense = entries
    .filter((entry) => {
      const date = new Date(entry.entry_date);

      return (
        date.getMonth() === previousMonth.getMonth() &&
        date.getFullYear() === previousMonth.getFullYear()
      );
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenseGrowth =
    previousMonthExpense === 0
      ? 100
      : (
          ((currentMonthExpense - previousMonthExpense) /
            previousMonthExpense) *
          100
        ).toFixed(1);

  const categoryData = Object.entries(
    filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + Number(entry.amount);

        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const [isMobile, setIsMobile] = useState<boolean | null>(null);

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

  return (
    <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Expenses
        </h1>
        <div className="mt-4 mb-6">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
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
        <div className="grid md:grid-cols-5 gap-4 mt-6 mb-8">
          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Expenses
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{currentMonthExpense.toLocaleString("en-IN")}
            </h3>
          </div>

          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Average Expense
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{Math.round(averageExpense).toLocaleString("en-IN")}
            </h3>
          </div>

          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Top Vendor
            </p>

            <h3 className="text-lg font-bold mt-2 truncate">{topVendor}</h3>
          </div>

          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transactions
            </p>

            <h3 className="text-2xl font-bold mt-2">{totalTransactions}</h3>
          </div>

          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expense Growth
            </p>

            <h3
              className={`text-2xl font-bold mt-2 ${
                Number(expenseGrowth) >= 0 ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {Number(expenseGrowth) >= 0 ? "+" : ""}
              {expenseGrowth}%
            </h3>
          </div>
        </div>

        <form
          onSubmit={handleAdd}
          className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-700
rounded-xl
p-5
mb-8
space-y-4
"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Office rent"
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor
              </label>

              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Google, Adobe, Hostinger..."
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expense Type
              </label>

              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              >
                <option value="fixed">Fixed Expense</option>

                <option value="variable">Variable Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              >
                <option value="upi">UPI</option>

                <option value="bank_transfer">Bank Transfer</option>

                <option value="card">Card</option>

                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expense Usage
              </label>

              <select
                value={businessPersonal}
                onChange={(e) => setBusinessPersonal(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
              >
                <option value="business">Business</option>

                <option value="personal">Personal</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={gstPaid}
                  onChange={(e) => setGstPaid(e.target.checked)}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  GST Paid
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={recurring}
                  onChange={(e) => setRecurring(e.target.checked)}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Recurring Expense
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes..."
              className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
text-sm
focus:outline-none
focus:ring-2
focus:ring-emerald-500
"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="
bg-emerald-600
hover:bg-emerald-700
text-white
px-5 py-2
rounded-lg
text-sm
font-medium
disabled:opacity-50
"
          >
            {saving ? "Saving..." : "Add expense"}
          </button>
        </form>

        <div
          className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  p-6
  mb-8
  "
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Expense Trend
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expenses over time
            </p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#ef4444"
                  fill="#ef444420"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
  className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  p-6
  mb-8
  "
>
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
    Expense Breakdown
  </h3>

  <div className="h-80">
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
        >
          {categoryData.map(
            (_, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[
                    index %
                      COLORS.length
                  ]
                }
              />
            ),
          )}
        </Pie>

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

        <div
          className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-700
  rounded-xl
  overflow-hidden
"
        >
          {loading ? (
            <p className="p-5 text-sm text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          ) : filteredEntries.length === 0 ? (
            <p className="p-5 text-sm text-gray-500 dark:text-gray-400">
              No expenses logged.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="
  border-t border-gray-100 dark:border-zinc-800
  hover:bg-gray-50 dark:hover:bg-zinc-800/50
"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">
                      {entry.category}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(entry.entry_date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ₹{Number(entry.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <TaxDisclaimer />
      </div>
    </main>
  );
}
