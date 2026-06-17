"use client";

interface Item {
  description: string;
  quantity: number;
  unit_price: number;
  gst_percentage: number;
}

interface Props {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

export default function InvoiceItemsTable({ items, setItems }: Props) {
  function addItem() {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        gst_percentage: 18,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setItems(updated);
  }

  return (
    <div
      className="
bg-white dark:bg-zinc-900
border border-gray-200 dark:border-zinc-800
rounded-2xl
p-6
"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Invoice Items
        </h2>

        <button
          type="button"
          onClick={addItem}
          className="
bg-emerald-600
hover:bg-emerald-700
text-white
px-4
py-2
rounded-lg
transition
"
        >
          + Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                Description
              </th>

              <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                Qty
              </th>

              <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                Rate
              </th>

              <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                GST %
              </th>

              <th className="text-left py-3 text-gray-600 dark:text-gray-400 font-medium">
                Amount
              </th>

              <th className="text-right py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const amount = item.quantity * item.unit_price;

              return (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-zinc-800"
                >
                  <td className="py-4">
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      placeholder="Website Design"
                      className="
w-full
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
                    />
                  </td>

                  <td className="py-4">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      className="
w-24
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
                    />
                  </td>

                  <td className="py-4">
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, "unit_price", Number(e.target.value))
                      }
                      className="
w-32
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
                    />
                  </td>

                  <td className="py-4">
                    <select
                      value={item.gst_percentage}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "gst_percentage",
                          Number(e.target.value),
                        )
                      }
                      className="
bg-white dark:bg-zinc-950
border border-gray-300 dark:border-zinc-700
text-gray-900 dark:text-white
rounded-lg
px-3 py-2
"
                    >
                      <option value={0}>0%</option>

                      <option value={5}>5%</option>

                      <option value={12}>12%</option>

                      <option value={18}>18%</option>

                      <option value={28}>28%</option>
                    </select>
                  </td>

                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    ₹{amount.toLocaleString("en-IN")}
                  </td>

                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
