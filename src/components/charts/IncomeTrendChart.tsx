"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  income: number;
}

export default function IncomeTrendChart({ income }: Props) {
  const data = [
    { month: "Jan", income: income * 0.45 },
    { month: "Feb", income: income * 0.6 },
    { month: "Mar", income: income * 0.55 },
    { month: "Apr", income: income * 0.8 },
    { month: "May", income: income * 0.9 },
    { month: "Jun", income: income },
  ];

  const growth = (
    ((data[5].income - data[0].income) / data[0].income) *
    100
  ).toFixed(1);

  return (
    <div
      className="
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    rounded-xl
    p-6
    mb-6
  "
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Trend
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last 6 months
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>

          <p className="text-lg font-bold text-emerald-600">+{growth}%</p>
        </div>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={320}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <AreaChart data={data}>
            <XAxis
              dataKey="month"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa" }}
            />

            <YAxis
              width={80}
              stroke="#71717a"
              tick={{ fill: "#a1a1aa" }}
              tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />

            <Tooltip
              labelStyle={{
                color: "#ffffff",
              }}
              itemStyle={{
                color: "#ffffff",
              }}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              formatter={(value: any) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Income",
              ]}
            />

            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
