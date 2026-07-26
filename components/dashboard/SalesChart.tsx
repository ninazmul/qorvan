"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface SalesChartProps {
  data: { month: string; sales: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="mt-8 bg-white/80 backdrop-filter backdrop-blur-lg p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Over Last 6 Months</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#555" />
          <YAxis stroke="#555" />
          <Tooltip />
          <Bar dataKey="sales" fill="#0ea5e9" name="Sales" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
