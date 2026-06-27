import { createClient } from "@/lib/supabase";

export async function processRecurringExpenses() {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: recurringExpenses, error } = await supabase
    .from("expense_entries")
    .select("*")
    .eq("recurring", true)
    .lte("next_due_date", today);

  if (error) {
    console.warn("Recurring expense processor could not load recurring expenses:", error.message);
    return;
  }

  if (!recurringExpenses?.length) {
    return;
  }

  for (const expense of recurringExpenses) {
    const nextDate = calculateNextDate(
      expense.next_due_date,
      expense.recurring_frequency,
    );

    if (!nextDate) {
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("expense_entries")
      .select("id")
      .eq("parent_recurring_id", expense.id)
      .eq("entry_date", expense.next_due_date)
      .maybeSingle();

    if (existingError) {
      console.warn("Could not verify existing recurring expense:", existingError.message);
      continue;
    }

    if (existing) {
      continue;
    }

    await supabase.from("expense_entries").insert({
      user_id: expense.user_id,
      description: expense.description,
      vendor: expense.vendor,
      amount: expense.amount,
      category: expense.category,
      entry_date: expense.next_due_date,
      gst_paid: expense.gst_paid,
      payment_method: expense.payment_method,
      expense_type: expense.expense_type,
      business_personal: expense.business_personal,
      notes: expense.notes,
      recurring: false,
      auto_generated: true,
      parent_recurring_id: expense.id,
      created_at: new Date().toISOString(),
    });

    await supabase
      .from("expense_entries")
      .update({
        next_due_date: nextDate,
      })
      .eq("id", expense.id);
  }
}

function calculateNextDate(currentDate: string | null, frequency: string | null) {
  if (!currentDate || !frequency || frequency === "one_time") {
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
