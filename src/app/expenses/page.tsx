"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import { processRecurringExpenses } from "@/lib/processRecurringExpenses";
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
  Legend,
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
  recurring_frequency: string;
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
  const [recurringFrequency, setRecurringFrequency] = useState("one_time");
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
    async function initialize() {
      await processRecurringExpenses();

      await loadEntries();
    }

    initialize();
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
        recurring: recurringFrequency !== "one_time",
        recurring_frequency:
          recurringFrequency === "custom"
            ? `custom_${customMonths}`
            : recurringFrequency,
        business_personal: businessPersonal,
        notes,
        entry_date: entryDate,
        next_due_date: recurringFrequency !== "one_time" ? entryDate : null,
        auto_generated: false,
        parent_recurring_id: null,
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

      setRecurringFrequency("one_time");

      setCustomMonths("1");

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

  const vendorTotals = filteredEntries.reduce(
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

  const monthlyEntries = Object.entries(expenseByMonth);

  const highestExpenseMonth =
    monthlyEntries.length > 0
      ? monthlyEntries.reduce((a, b) => (a[1] > b[1] ? a : b))
      : null;

  const now = new Date();

  const totalExpenses = filteredEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );

  const currentMonthExpense = entries
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

  const topVendors = Object.entries(vendorTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recurringExpenses = filteredEntries.filter((entry) => entry.recurring);

  const recurringAmount = recurringExpenses.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0,
  );

  const businessExpense = filteredEntries
    .filter((entry) => entry.business_personal === "business")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const personalExpense = filteredEntries
    .filter((entry) => entry.business_personal === "personal")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const [customMonths, setCustomMonths] = useState("1");

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

  if (loading || isMobile === null) {
    return (
      <main className="ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading Expense Center
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Preparing expense analytics...
          </p>
        </div>
      </main>
    );
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
        <div className="grid md:grid-cols-7 gap-4 mt-6 mb-8">
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
              ₹{totalExpenses.toLocaleString("en-IN")}
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
          <div
            className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  p-5
  "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recurring
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{recurringAmount.toLocaleString("en-IN")}
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
              Highest Month
            </p>

            <h3 className="text-lg font-bold mt-2">
              {highestExpenseMonth?.[0] || "-"}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurring Schedule
              </label>

              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value)}
                className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
              >
                <option value="one_time">One Time</option>

                <option value="daily">Daily</option>

                <option value="weekly">Weekly</option>

                <option value="monthly">Monthly</option>

                <option value="2_months">Every 2 Months</option>

                <option value="3_months">Every 3 Months</option>

                <option value="6_months">Every 6 Months</option>

                <option value="yearly">Yearly</option>

                <option value="custom">Custom</option>
              </select>

              {recurringFrequency === "custom" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Interval (Months)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={customMonths}
                    onChange={(e) => setCustomMonths(e.target.value)}
                    className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                GST Paid
              </label>

              <button
                type="button"
                onClick={() => setGstPaid(!gstPaid)}
                className={`w-12 h-6 rounded-full relative transition ${
                  gstPaid ? "bg-emerald-600" : "bg-gray-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                    gstPaid ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
  border border-gray-200 dark:border-zinc-700
  rounded-xl
  overflow-hidden mb-8
"
        >
          {filteredEntries.length === 0 ? (
            <p className="p-5 text-sm text-gray-500 dark:text-gray-400">
              No expenses logged.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Vendor</th>

                  <th className="px-4 py-3 font-medium">Description</th>

                  <th className="px-4 py-3 font-medium">Category</th>

                  <th className="px-4 py-3 font-medium">Type</th>

                  <th className="px-4 py-3 font-medium">Payment</th>

                  <th className="px-4 py-3 font-medium">GST</th>

                  <th className="px-4 py-3 font-medium">Recurring</th>

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
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {entry.vendor || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {entry.description}
                        </p>

                        {entry.notes && (
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 capitalize">{entry.category}</td>

                    <td className="px-4 py-3 capitalize">
                      {entry.expense_type}
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {entry.payment_method?.replace("_", " ")}
                    </td>

                    <td className="px-4 py-3">
                      {entry.gst_paid ? (
                        <span className="text-emerald-500">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-blue-500 capitalize">
                        {entry.recurring_frequency?.replaceAll("_", " ") ||
                          "One Time"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(entry.entry_date).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      ₹{Number(entry.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="
          text-red-500
          hover:text-red-700
          text-xs
          font-medium
          "
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Legend />
              </PieChart>
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
            Top Vendors
          </h3>

          {topVendors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No vendor data available.
            </p>
          ) : (
            <div className="space-y-4">
              {topVendors.map(([vendor, amount], index) => (
                <div key={vendor} className="flex items-center justify-between">
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

                    <span className="font-medium text-gray-900 dark:text-white">
                      {vendor}
                    </span>
                  </div>

                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div
            className="
    bg-white dark:bg-zinc-900
    border border-emerald-500/20
    rounded-xl
    p-6
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Business Expenses
            </p>

            <h3 className="text-2xl font-bold text-emerald-500 mt-2">
              ₹{businessExpense.toLocaleString("en-IN")}
            </h3>
          </div>

          <div
            className="
    bg-white dark:bg-zinc-900
    border border-blue-500/20
    rounded-xl
    p-6
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personal Expenses
            </p>

            <h3 className="text-2xl font-bold text-blue-500 mt-2">
              ₹{personalExpense.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>
        <TaxDisclaimer />
      </div>
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="
      bg-white dark:bg-zinc-900
      border border-gray-200 dark:border-zinc-800
      rounded-2xl
      p-6
      w-full
      max-w-md
      "
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Delete Expense Entry
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              This expense record will be permanently removed.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="
          px-4 py-2
          rounded-xl
          border border-gray-300
          dark:border-zinc-700
          "
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
                className="
          px-4 py-2
          rounded-xl
          bg-red-600
          hover:bg-red-700
          disabled:opacity-50
          text-white
          "
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
