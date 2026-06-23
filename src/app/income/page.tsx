"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import TaxDisclaimer from "@/components/TaxDisclaimer";
import MobileBlocker from "@/components/MobileBlocker";

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
}

const CATEGORIES = [
  "design",
  "development",
  "consulting",
  "writing",
  "marketing",
  "other",
];

export default function IncomePage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [gstIncluded, setGstIncluded] = useState(false);
  const [invoiceLinked, setInvoiceLinked] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("received");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [dateFilter, setDateFilter] = useState("this_month");

  async function loadEntries() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("income_entries")
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

    if (!clientName.trim() || !amount || Number(amount) <= 0) {
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

    const { error: insertError } = await supabase
      .from("income_entries")
      .insert({
        user_id: userData.user.id,

        client_name: clientName,

        income_source: incomeSource,

        amount: Number(amount),

        category,

        gst_included: gstIncluded,

        invoice_linked: invoiceLinked,

        payment_status: paymentStatus,

        payment_method: paymentMethod,

        notes,

        entry_date: entryDate,
      });

    if (insertError) {
      setError("Something went wrong. Please try again.");
    } else {
      setClientName("");
      setIncomeSource("");

      setAmount("");

      setCategory("other");

      setGstIncluded(false);

      setInvoiceLinked(false);

      setPaymentStatus("received");

      setPaymentMethod("bank_transfer");

      setNotes("");
      await loadEntries();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("income_entries").delete().eq("id", id);
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

  const totalThisMonth = entries
    .filter((e) => {
      const d = new Date(e.entry_date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const averageIncome =
    entries.length > 0
      ? filteredEntries.reduce((sum, entry) => sum + Number(entry.amount), 0) /
        entries.length
      : 0;

  const totalTransactions = filteredEntries.length;

  const clientTotals = filteredEntries.reduce(
    (acc, entry) => {
      const client = entry.client_name || "Unknown";

      acc[client] = (acc[client] || 0) + Number(entry.amount);

      return acc;
    },
    {} as Record<string, number>,
  );

  const topClient =
    Object.entries(clientTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
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
          Income
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
        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-6">
          Total this month:{" "}
          <span className="font-semibold text-emerald-700">
            ₹{totalThisMonth.toLocaleString("en-IN")}
          </span>
        </p>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div
            className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-5
    "
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly Revenue
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{totalThisMonth.toLocaleString("en-IN")}
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
              Average Income
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{Math.round(averageIncome).toLocaleString("en-IN")}
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
              Top Client
            </p>

            <h3 className="text-lg font-bold mt-2 truncate">{topClient}</h3>
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
        </div>

        <form
          onSubmit={handleAdd}
          className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-xl
p-5
mb-8
space-y-4
"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp"
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
                Amount received (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
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
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Income Source
              </label>

              <input
                type="text"
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder="Freelancing, Consulting, Retainer..."
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
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Status
              </label>

              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
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
                <option value="received">Received</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date received
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
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={gstIncluded}
                onChange={(e) => setGstIncluded(e.target.checked)}
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                GST Included
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={invoiceLinked}
                onChange={(e) => setInvoiceLinked(e.target.checked)}
                className="h-4 w-4"
              />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Linked To Invoice
              </span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Invoice #102, project name, etc."
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
            className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add income"}
          </button>
        </form>

        <div
          className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  overflow-hidden
"
        >
          {loading ? (
            <p className="p-5 text-sm dark:text-gray-400">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="p-5 text-sm dark:text-gray-400">
              No income logged yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800 text-left dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
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
                      {entry.client_name}
                    </td>
                    <td className="px-4 py-3 dark:text-gray-400 capitalize">
                      {entry.category}
                    </td>
                    <td className="px-4 py-3 dark:text-gray-400">
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
