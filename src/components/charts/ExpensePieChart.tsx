"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export default function ExpensePieChart({ data }: Props) {
  if (!data.length) {
    return (
      <div
        className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  p-6
  text-gray-900 dark:text-white
"
      >
        No expense data
      </div>
    );
  }

  return (
    <div
      className="
  bg-white dark:bg-zinc-900
  border border-gray-200 dark:border-zinc-800
  rounded-xl
  p-6
"
    >
      <h3 className="font-semibold mb-6 text-gray-900 dark:text-white">
        Expense Breakdown
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "12px",
              color: "#ffffff",
            }}
            labelStyle={{
              color: "#ffffff",
            }}
            itemStyle={{
              color: "#ffffff",
            }}
            formatter={(value: any) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Amount",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {data.map((item) => (
          <div
            key={item.name}
            className="
flex justify-between
text-sm
border-b border-gray-200 dark:border-zinc-800
pb-2
"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[
                      data.findIndex((d) => d.name === item.name) %
                        COLORS.length
                    ],
                }}
              />

              <span className="capitalize text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>

            <span className="font-medium text-gray-900 dark:text-white">
              ₹{item.value.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
