import { createClient } from "@/lib/supabase";

export async function processRecurringExpenses() {
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data: recurringExpenses } = await supabase
    .from("expense_entries")
    .select("*")
    .eq("recurring", true)
    .lte("next_due_date", today);

  if (!recurringExpenses?.length) return;

  for (const expense of recurringExpenses) {
    const nextDate = calculateNextDate(
      expense.next_due_date,
      expense.recurring_frequency,
    );

    await supabase.from("expense_entries").insert({
      user_id: expense.user_id,

      description: expense.description,

      amount: expense.amount,

      category: expense.category,

      vendor: expense.vendor,

      entry_date: expense.next_due_date,

      gst_paid: expense.gst_paid,

      payment_method: expense.payment_method,

      business_personal: expense.business_personal,

      notes: expense.notes,

      recurring: false,

      auto_generated: true,

      parent_recurring_id: expense.id,
    });

    await supabase
      .from("expense_entries")
      .update({
        next_due_date: nextDate,
      })
      .eq("id", expense.id);
  }
}

function calculateNextDate(
  currentDate: string,
  frequency: string,
) {
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
      if (frequency.startsWith("custom_")) {
        const months = Number(
          frequency.replace("custom_", ""),
        );

        date.setMonth(date.getMonth() + months);
      }
  }

  return date.toISOString().split("T")[0];
}