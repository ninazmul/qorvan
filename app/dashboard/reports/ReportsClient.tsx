"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, DollarSign, ShoppingCart, Package,
  Users, ArrowUpRight, ArrowDownRight, Calendar, Download,
  RefreshCw
} from "lucide-react";
import { getDashboardStats, getSalesAnalyticsReport } from "@/lib/actions/analytics.actions";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  averageOrderValue: number;
  todayRevenue: number;
  todayOrders: number;
  lowStockProducts: number;
  pendingOrders: number;
}

interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

export default function ReportsClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "365d">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        getDashboardStats(),
        getSalesAnalyticsReport(period),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (analyticsRes.success) setMonthlySales(analyticsRes.data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return `৳${amount.toLocaleString("en-BD")}`;
  }

  const metricCards = stats
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          change: "+12.5%",
          positive: true,
          color: "from-amber-500 to-amber-600",
        },
        {
          label: "Total Orders",
          value: stats.totalOrders.toLocaleString(),
          icon: ShoppingCart,
          change: "+8.2%",
          positive: true,
          color: "from-blue-500 to-blue-600",
        },
        {
          label: "Active Customers",
          value: stats.activeCustomers.toLocaleString(),
          icon: Users,
          change: "+4.1%",
          positive: true,
          color: "from-emerald-500 to-emerald-600",
        },
        {
          label: "Avg. Order Value",
          value: formatCurrency(stats.averageOrderValue),
          icon: TrendingUp,
          change: "-2.3%",
          positive: false,
          color: "from-purple-500 to-purple-600",
        },
        {
          label: "Today's Revenue",
          value: formatCurrency(stats.todayRevenue),
          icon: BarChart3,
          change: "Today",
          positive: true,
          color: "from-rose-500 to-rose-600",
        },
        {
          label: "Today's Orders",
          value: stats.todayOrders.toLocaleString(),
          icon: Package,
          change: "Today",
          positive: true,
          color: "from-cyan-500 to-cyan-600",
        },
      ]
    : [];

  // Calculate max revenue for bar chart scaling
  const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sales & Revenue Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Business analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(["7d", "30d", "90d", "365d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  period === p
                    ? "bg-white text-amber-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "7d"
                  ? "7 Days"
                  : p === "30d"
                  ? "30 Days"
                  : p === "90d"
                  ? "90 Days"
                  : "1 Year"}
              </button>
            ))}
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}
                  >
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {card.positive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      card.positive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {card.change}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    vs prev. period
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart (CSS-only bar chart) */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Revenue Trend
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monthly revenue breakdown
                </p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-50 transition">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {monthlySales.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  No sales data available for selected period
                </p>
              </div>
            ) : (
              <div className="flex items-end gap-2 h-52">
                {monthlySales.map((m) => (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] text-gray-500 font-semibold">
                      {formatCurrency(m.revenue)}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-md transition-all duration-500 min-h-[4px]"
                      style={{
                        height: `${Math.max(
                          (m.revenue / maxRevenue) * 100,
                          2
                        )}%`,
                      }}
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders Summary Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order Status Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Pending",
                  count: stats?.pendingOrders || 0,
                  color: "bg-yellow-100 text-yellow-800",
                },
                {
                  label: "Processing",
                  count: 0,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  label: "Shipped",
                  count: 0,
                  color: "bg-purple-100 text-purple-800",
                },
                {
                  label: "Delivered",
                  count: stats?.totalOrders || 0,
                  color: "bg-emerald-100 text-emerald-800",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-lg p-4 ${s.color} text-center`}
                >
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          {stats && stats.lowStockProducts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800">Low Stock Alert</h4>
                  <p className="text-sm text-red-600">
                    {stats.lowStockProducts} product(s) are running low on
                    stock. Visit the{" "}
                    <a
                      href="/dashboard/inventory"
                      className="underline font-semibold"
                    >
                      Inventory page
                    </a>{" "}
                    to restock.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
