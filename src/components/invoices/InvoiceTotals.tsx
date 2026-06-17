interface Item {
  description: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
}

interface Props {
  items: Item[];
  discount: number;
}

export default function InvoiceTotals({ items, discount }: Props) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  const gstAmount = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unit_price * (item.gst_percentage / 100),
    0,
  );

  const total = subtotal + gstAmount - discount;

  return (
    <div
      className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-2xl
p-6
"
    >
      <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
        Totals
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span>Subtotal</span>

          <span className="font-medium">
            ₹{subtotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            GST
          </span>

          <span>₹{gstAmount.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex justify-between text-gray-700 dark:text-gray-300">
          <span className="font-medium text-red-600 dark:text-red-400">
            Discount
          </span>

          <span>₹{discount.toLocaleString("en-IN")}</span>
        </div>

        <div
          className="
border-t border-gray-200 dark:border-zinc-800
pt-4
flex justify-between
text-xl font-bold
text-gray-900 dark:text-white
"
        >
          <span className="text-emerald-600 dark:text-emerald-400">Total</span>

          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
