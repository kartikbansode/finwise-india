"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function RevenueExpenseChart({
  data,
}: {
  data: any[];
}) {
  return (
    <div
      className="
      bg-white dark:bg-zinc-900
      border border-gray-200 dark:border-zinc-800
      rounded-2xl
      p-6
      "
    >
      <h3 className="text-lg font-semibold mb-6">
        Revenue vs Expenses
      </h3>

      <div className="h-96">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Area
              type="monotone"
              dataKey="income"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
            />

            <Area
              type="monotone"
              dataKey="expense"
              stackId="2"
              stroke="#ef4444"
              fill="#ef4444"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}